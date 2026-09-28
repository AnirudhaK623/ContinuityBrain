import json
import os
import sys
from pathlib import Path
import chromadb
from chromadb.utils import embedding_functions

import config

def build_embed_text(item: dict) -> str:
    """Format rich text representation of the decision for semantic embedding."""
    return (
        f"Category: {item.get('category', '')}\n"
        f"Stakes: {item.get('stakes', '')}\n"
        f"Situation: {item.get('situation', '')}\n"
        f"Decision: {item.get('decision', '')}\n"
        f"Reasoning: {item.get('reasoning', '')}\n"
        f"Outcome: {item.get('outcome', '')}"
    )

def ingest_decisions(force: bool = False):
    """Idempotently ingest decisions from JSON file into persistent ChromaDB."""
    if not config.DECISION_LOG_PATH.exists():
        print(f"Error: {config.DECISION_LOG_PATH} does not exist.")
        sys.exit(1)

    with open(config.DECISION_LOG_PATH, "r", encoding="utf-8") as f:
        records = json.load(f)

    print(f"Loaded {len(records)} records from {config.DECISION_LOG_PATH}")

    # Use sentence-transformers embedding function (all-MiniLM-L6-v2)
    embedding_func = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name=config.EMBEDDING_MODEL_NAME
    )

    client = chromadb.PersistentClient(path=config.CHROMA_PERSIST_DIR)

    # Cosine distance space: distance = 1 - cosine_similarity
    collection = client.get_or_create_collection(
        name=config.COLLECTION_NAME,
        embedding_function=embedding_func,
        metadata={"hnsw:space": "cosine"}
    )

    current_count = collection.count()
    if not force and current_count >= len(records):
        print(f"ChromaDB collection already up-to-date with {current_count} entries. Skipping ingestion.")
        return collection

    print(f"Ingesting {len(records)} decisions into ChromaDB...")
    ids = [r["id"] for r in records]
    documents = [build_embed_text(r) for r in records]
    metadatas = [
        {
            "id": r["id"],
            "date": r["date"],
            "category": r["category"],
            "stakes": r["stakes"],
            "situation": r["situation"],
            "decision": r["decision"],
            "reasoning": r["reasoning"],
            "outcome": r["outcome"]
        }
        for r in records
    ]

    # Upsert ensures idempotency
    collection.upsert(
        ids=ids,
        documents=documents,
        metadatas=metadatas
    )

    print(f"Successfully ingested {collection.count()} decisions into ChromaDB at {config.CHROMA_PERSIST_DIR}.")
    return collection

if __name__ == "__main__":
    force_ingest = "--force" in sys.argv
    ingest_decisions(force=force_ingest)
