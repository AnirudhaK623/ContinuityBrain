import json
import time
from datetime import datetime
from typing import Generator, List, Dict, Any, Tuple
import urllib.request
import urllib.error
import chromadb
from chromadb.utils import embedding_functions

import config

def get_chroma_collection():
    """Retrieve the persistent ChromaDB collection with sentence-transformer embeddings."""
    embedding_func = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name=config.EMBEDDING_MODEL_NAME
    )
    client = chromadb.PersistentClient(path=config.CHROMA_PERSIST_DIR)
    collection = client.get_or_create_collection(
        name=config.COLLECTION_NAME,
        embedding_function=embedding_func,
        metadata={"hnsw:space": "cosine"}
    )
    return collection

def check_ollama_status() -> Tuple[bool, bool, str]:
    """
    Check if Ollama server is reachable and if the target model is downloaded.
    Returns: (is_online, has_model, message)
    """
    url = f"{config.OLLAMA_BASE_URL}/api/tags"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "ContinuityBrain/1.0"})
        with urllib.request.urlopen(req, timeout=1.5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                models = [m.get("name", "") for m in data.get("models", [])]
                target = config.OLLAMA_MODEL
                target_base = target.split(":")[0]
                has_model = any(target in m or target_base in m for m in models)
                if has_model:
                    return True, True, f"Ollama online with model {config.OLLAMA_MODEL}"
                return True, False, f"Ollama online, but model '{config.OLLAMA_MODEL}' not found. Run `ollama pull {config.OLLAMA_MODEL}`"
    except Exception as e:
        return False, False, f"Ollama offline: {str(e)}"
    return False, False, "Ollama connection failed"

def is_high_stakes(query: str, matches: List[Dict[str, Any]]) -> Tuple[bool, str]:
    """Determine if high-stakes banner should trigger based on keywords or matched stakes."""
    query_lower = query.lower()
    matched_keywords = [kw for kw in config.HIGH_STAKES_KEYWORDS if kw in query_lower]
    if matched_keywords:
        return True, f"Query touches critical scenario keyword: '{matched_keywords[0]}'"

    for match in matches:
        if match.get("metadata", {}).get("stakes", "").lower() == "high":
            return True, f"Relevant precedent {match.get('metadata', {}).get('id', '')} carries HIGH stakes"

    return False, ""

def retrieve_precedents(query: str, top_k: int = config.TOP_K) -> List[Dict[str, Any]]:
    """Retrieve top-K matching precedents with cosine similarity percentage."""
    collection = get_chroma_collection()
    results = collection.query(
        query_texts=[query],
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )

    matches = []
    if results and results.get("ids") and len(results["ids"][0]) > 0:
        ids = results["ids"][0]
        metas = results["metadatas"][0]
        distances = results["distances"][0]
        for i in range(len(ids)):
            # Cosine distance ranges [0, 2]; similarity is (1 - distance)
            distance = distances[i] if i < len(distances) else 1.0
            similarity = max(0.0, min(1.0, 1.0 - distance))
            similarity_pct = round(similarity * 100, 1)

            matches.append({
                "rank": i + 1,
                "id": ids[i],
                "similarity_score": similarity,
                "similarity_pct": similarity_pct,
                "metadata": metas[i] if i < len(metas) else {}
            })

    return matches

def stream_llm_synthesis(
    query: str,
    matches: List[Dict[str, Any]]
) -> Generator[str, None, None]:
    """
    Stream grounded AI synthesis from local Ollama HTTP API.
    Enforces strict prompt constraints and temperature.
    """
    # Build context from retrieved decisions only
    context_blocks = []
    for m in matches:
        meta = m.get("metadata", {})
        context_blocks.append(
            f"Precedent [{meta.get('id', 'N/A')}]:\n"
            f"- Category: {meta.get('category')}\n"
            f"- Stakes: {meta.get('stakes')}\n"
            f"- Situation: {meta.get('situation')}\n"
            f"- Decision: {meta.get('decision')}\n"
            f"- Reasoning: {meta.get('reasoning')}\n"
            f"- Outcome: {meta.get('outcome')}"
        )
    context_str = "\n\n".join(context_blocks)

    user_prompt = (
        f"NEW SCENARIO:\n{query}\n\n"
        f"RETRIEVED PRECEDENTS (USE ONLY THESE):\n{context_str}\n\n"
        f"Synthesize the founder's stored reasoning to address the new scenario. "
        f"Cite precedent IDs directly, note differences, max 4 sentences. "
        f"End with 'Final judgment rests with you.'"
    )

    payload = {
        "model": config.OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": config.GROUNDED_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        "options": {
            "temperature": config.LLM_TEMPERATURE,
            "num_predict": config.LLM_NUM_PREDICT
        },
        "stream": True
    }

    url = f"{config.OLLAMA_BASE_URL}/api/chat"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            for line in resp:
                if line:
                    chunk = json.loads(line.decode("utf-8"))
                    msg = chunk.get("message", {})
                    token = msg.get("content", "")
                    if token:
                        yield token
                    if chunk.get("done", False):
                        break
    except Exception as e:
        yield f"\n\n[Local LLM Synthesis unavailable: {str(e)}. Precedent retrieval remains 100% functional.]"

def stream_team_message(query: str, matches: List[Dict[str, Any]]) -> Generator[str, None, None]:
    """Draft an internal team memo in founder's style from retrieved precedents."""
    context_blocks = [
        f"[{m['metadata'].get('id')}]: {m['metadata'].get('decision')} | {m['metadata'].get('reasoning')}"
        for m in matches
    ]
    user_prompt = (
        f"Current situation: {query}\n"
        f"Precedents: {' | '.join(context_blocks)}\n"
        f"Draft a brief, authentic internal team memo explaining how we approach this."
    )

    payload = {
        "model": config.OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": config.TEAM_MESSAGE_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        "options": {
            "temperature": 0.3,
            "num_predict": 250
        },
        "stream": True
    }

    url = f"{config.OLLAMA_BASE_URL}/api/chat"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            for line in resp:
                if line:
                    chunk = json.loads(line.decode("utf-8"))
                    msg = chunk.get("message", {})
                    token = msg.get("content", "")
                    if token:
                        yield token
                    if chunk.get("done", False):
                        break
    except Exception as e:
        yield f"\n\n[Team message drafting failed: {str(e)}]"

def log_audit_trail(
    query: str,
    matched_ids: List[str],
    scores: List[float],
    llm_called: bool,
    answer: str,
    latency_ms: int,
    confidence_met: bool,
    high_stakes: bool
):
    """Append query record to local audit_log.jsonl."""
    entry = {
        "timestamp": datetime.now().isoformat(),
        "query": query,
        "matched_ids": matched_ids,
        "scores": scores,
        "llm_called": llm_called,
        "confidence_met": confidence_met,
        "high_stakes": high_stakes,
        "latency_ms": latency_ms,
        "answer_summary": (answer[:200] + "...") if len(answer) > 200 else answer
    }
    try:
        with open(config.AUDIT_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")
    except Exception as e:
        print(f"Failed to write audit log: {e}")

def read_audit_log() -> List[Dict[str, Any]]:
    """Read all entries from audit_log.jsonl in reverse chronological order."""
    if not config.AUDIT_LOG_PATH.exists():
        return []
    logs = []
    with open(config.AUDIT_LOG_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    logs.append(json.loads(line))
                except Exception:
                    continue
    logs.reverse()
    return logs

def add_new_decision(
    category: str,
    stakes: str,
    situation: str,
    decision: str,
    reasoning: str,
    outcome: str
) -> Dict[str, Any]:
    """Add a new decision entry to decision_log.json and immediately embed it into ChromaDB."""
    with open(config.DECISION_LOG_PATH, "r", encoding="utf-8") as f:
        records = json.load(f)

    new_num = len(records) + 1
    new_id = f"DEC-{new_num:03d}"
    today = datetime.now().strftime("%Y-%m-%d")

    new_entry = {
        "id": new_id,
        "date": today,
        "category": category,
        "stakes": stakes,
        "situation": situation,
        "decision": decision,
        "reasoning": reasoning,
        "outcome": outcome
    }
    records.append(new_entry)

    with open(config.DECISION_LOG_PATH, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)

    # Immediately upsert to ChromaDB
    from ingest import build_embed_text
    collection = get_chroma_collection()
    collection.upsert(
        ids=[new_id],
        documents=[build_embed_text(new_entry)],
        metadatas=[new_entry]
    )

    return new_entry
