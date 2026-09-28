# Continuity Brain 🧠
> **Sovereign Local Decision-Support Engine**  
> *Preserve how your best people decide.*

Continuity Brain is a 100% sovereign, local-first decision-support platform designed for line managers and executive successors. When faced with high-pressure dilemmas (pricing battles, key resignations, investor demands, enterprise contract negotiations), Continuity Brain retrieves verified founder reasoning precedents from an immutable local vector store and synthesizes grounded guidance using a local LLM via Ollama.

**Zero cloud APIs. Zero external telemetry. No corporate data ever leaves your machine.**

---

## ⚡ Quickstart (Under 2 Minutes)

### 1. Prerequisites
- **Python 3.10+**
- **Ollama** installed locally ([ollama.com](https://ollama.com))

### 2. Pull the Sovereign Model
```bash
ollama pull llama3.2:3b
```
*(Make sure Ollama is running in the background: `ollama serve`)*

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run Continuity Brain
```bash
bash run.sh
```
This runs the idempotent vector ingestion into local ChromaDB (`ingest.py`) and launches the Streamlit interface on `http://localhost:8501`.

---

## 🏗️ Architecture & Strict Local Stack
- **Web UI & Streaming:** Streamlit (Wide layout, custom emerald `#34D399` styling, responsive cards)
- **Vector Database:** ChromaDB (persistent local SQLite + Parquet storage, cosine similarity space)
- **Embedding Model:** `all-MiniLM-L6-v2` via `sentence-transformers` (runs entirely on local CPU/GPU)
- **Local LLM Engine:** Ollama HTTP REST API (`localhost:11434`) running `llama3.2:3b` at temperature `0.2` with `num_predict: 200`
- **Audit Logging:** Append-only local `audit_log.jsonl` tracking queries, similarity scores, latency, and full synthesis

---

## 🎯 Canonical Demo Scenarios

Four pre-loaded demo buttons test real-world founder pressure points:

1. **🏷️ Competitor Undercutting Price:**  
   *Query:* "A competitor is undercutting our annual subscription price by 40%. A sales rep is asking for permission to match it."  
   *Precedent:* [DEC-001] Refused to engage in margin-destroying price wars; competed on SLA guarantees and SOC2 security.
2. **🚨 Key Engineer Resigning:**  
   *Query:* "Our lead backend engineer just submitted their two weeks notice right in the middle of our v2 migration."  
   *Precedent:* [DEC-004] Avoided panic counteroffers; executed structured knowledge transfer and addressed single-point-of-failure docs.
3. **💼 Large Customer Demanding 35% Discount:**  
   *Query:* "Our biggest enterprise customer (18% of ARR) says they will churn unless we give them a 35% discount on renewal."  
   *Precedent:* [DEC-003] Held firm on gross margin baseline; offered seat pruning and technical reviews rather than discounting core rate.
4. **🚀 Investor Pushing Rapid Expansion:**  
   *Query:* "Our lead seed investor is aggressively urging us to double headcount and expand to Europe immediately."  
   *Precedent:* [DEC-007] Resisted premature scaling; validated inbound traction before committing burn to international overhead.

---

## ⏱️ 90-Second Hackathon Demo Script

- **0:00 - 0:15 (The Problem & Sovereignty):**  
  *"Founders and key executives spend years developing an intuitive reasoning compass. When line managers face crises, they either guess or interrupt the founder. Continuity Brain captures that reasoning compass locally. Notice the green badge in the header: 'Running fully offline. No data leaves this machine'."*

- **0:15 - 0:35 (Retrieval & Precedents):**  
  *Click the first example button: 'Competitor undercutting price by 40%'. Click 'Retrieve Precedents & Reason'.*  
  *"Within 200 milliseconds, our local ChromaDB calculates cosine similarity across 40 historical decisions. It surfaces [DEC-001] at 89% similarity with the founder's exact trade-off reasoning: avoid price wars, protect gross margins, win on enterprise reliability."*

- **0:35 - 0:50 (Grounded Local Synthesis & Safety):**  
  *Point to the streamed green synthesis panel.*  
  *"Notice the streaming synthesis from our local Llama 3.2 model. Our strict system prompt forbids hallucinations: it references only [DEC-001], compares the scenario nuances, and reminds the user: 'Final judgment rests with you'."*

- **0:50 - 1:05 (Confidence Threshold & High-Stakes Guardrail):**  
  *Type an unrelated query like 'Should we cater Mexican or sushi for lunch?' or raise the sidebar slider to 90%.*  
  *"If similarity drops below the threshold, Continuity Brain withholds AI synthesis and warns: 'Insufficient precedent: new scenario, use independent judgment.' If a query touches keywords like 'layoff' or 'lawsuit', a high-stakes warning banner alerts management."*

- **1:05 - 1:20 (Actionable Output & Audit Trail):**  
  *Click 'Draft Team Message'. Switch to the 'Audit Trail' tab.*  
  *"With one click, it drafts an internal team memo in the founder's voice. And under Audit Trail, every decision, similarity score, and model response is logged to an immutable local JSONL file for governance."*

- **1:20 - 1:30 (Closing):**  
  *"Continuity Brain scales leadership judgment while ensuring 100% sovereign data privacy. Thank you."*

---

## 📂 Project Structure
```
├── app.py                # Streamlit front-end with custom aesthetic styling
├── config.py             # System configuration, thresholds, prompts & paths
├── engine.py             # Chroma retrieval, Ollama streaming & audit logger
├── ingest.py             # Idempotent ChromaDB vectorization pipeline
├── run.sh                # Single-command startup script
├── requirements.txt      # Python dependencies
├── audit_log.jsonl       # Append-only local query audit record
├── data/
│   └── decision_log.json # 40 realistic fictional founder decisions
└── README.md             # Documentation and hackathon demo script
```
