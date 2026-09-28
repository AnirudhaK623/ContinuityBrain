#!/usr/bin/env bash
set -e

echo "🧠 Starting Continuity Brain (Sovereign Local Decision Engine)..."

# Ensure data directory exists
mkdir -p data

# Run idempotent ingestion if chroma_db does not exist or has zero items
python ingest.py

# Launch Streamlit app
echo "🚀 Launching Streamlit UI..."
streamlit run app.py --server.port 8501 --server.address 0.0.0.0
