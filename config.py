import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DECISION_LOG_PATH = DATA_DIR / "decision_log.json"
AUDIT_LOG_PATH = BASE_DIR / "audit_log.jsonl"
CHROMA_PERSIST_DIR = str(BASE_DIR / "chroma_db")

# Vector & Embedding Config
COLLECTION_NAME = "continuity_decisions"
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
DEFAULT_CONFIDENCE_THRESHOLD = 0.50
TOP_K = 3

# High Stakes Detection Keywords
HIGH_STAKES_KEYWORDS = [
    "layoff",
    "lawsuit",
    "acquisition",
    "funding",
    "shutdown",
    "fired",
    "resign",
    "subpoena",
    "breach",
    "bankruptcy",
    "terminate"
]

# Local Ollama HTTP API Config (100% sovereign / offline)
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
LLM_TEMPERATURE = 0.2
LLM_NUM_PREDICT = 200

# Strict System Prompt: Grounded reasoning only
GROUNDED_SYSTEM_PROMPT = (
    "You are Continuity Brain, an executive reasoning preservation assistant for a founder.\n"
    "Your objective is to synthesize past decision precedent to advise on a new scenario.\n"
    "STRICT RULES:\n"
    "1. Use ONLY the retrieved historical decisions provided in the context.\n"
    "2. NEVER invent reasoning, external policies, or hypothetical history.\n"
    "3. Explicitly cite entry IDs (e.g., [DEC-001]) for every precedent you reference.\n"
    "4. Highlight specifically where the new situation differs or has distinct nuance.\n"
    "5. Keep your synthesis concise (maximum 4 sentences).\n"
    "6. You MUST end your response with the exact sentence: 'Final judgment rests with you.'"
)

TEAM_MESSAGE_SYSTEM_PROMPT = (
    "You are Continuity Brain. Draft a concise internal announcement/memo for the team in the founder's "
    "calm, transparent, high-integrity style based on the retrieved precedents. "
    "Focus on core principles (long-term margin, team culture, customer trust). "
    "Keep it under 3 short paragraphs. Include a subject line."
)
