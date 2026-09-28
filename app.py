import json
import time
import streamlit as st
import pandas as pd
from datetime import datetime

import config
import engine
from ingest import ingest_decisions

# 1. Page Configuration
st.set_page_config(
    page_title="Continuity Brain — Sovereign Decision Support",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 2. Custom Aesthetic Styling (Luxury Terracotta #EA580C, Coral/Rose #F43F5E, soft borders, rounded 14px cards, Inter font)
CUSTOM_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

html, body, [class*="css"] {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1C1917;
}

/* Hide default streamlit menu/footer */
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}

/* Custom header styling */
.cb-header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #E7E5E4;
}
.cb-title {
    font-size: 2.1rem;
    font-weight: 700;
    background: linear-gradient(135deg, #C2410C 0%, #EA580C 50%, #F43F5E 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.02em;
    margin: 0;
}
.cb-tagline {
    font-size: 1.05rem;
    color: #78716C;
    margin-top: 0.25rem;
}

/* Offline Badges */
.badge-offline-orange {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #FFF7ED;
    color: #9A3412;
    border: 1px solid #FED7AA;
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 0.82rem;
    font-weight: 600;
}
.badge-offline-amber {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #FFFBEB;
    color: #92400E;
    border: 1px solid #FDE68A;
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 0.82rem;
    font-weight: 600;
}

/* High Stakes Banner */
.high-stakes-banner {
    background: #FFF1F2;
    border: 1px solid #FECDD3;
    border-left: 5px solid #F43F5E;
    border-radius: 10px;
    padding: 12px 16px;
    color: #881337;
    font-weight: 500;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 10px;
}

/* Synthesis Panel (Warm Luxury Champagne Terracotta) */
.synthesis-card {
    background: #FFF9F6;
    border: 1px solid #FED7AA;
    border-radius: 14px;
    padding: 18px 22px;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 14px rgba(234, 88, 12, 0.05);
}
.synthesis-label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #C2410C;
    font-weight: 700;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
}
.synthesis-body {
    font-size: 1.02rem;
    line-height: 1.6;
    color: #431407;
}

/* Result Precedent Cards */
.precedent-card {
    background: #FFFFFF;
    border: 1px solid #E7E5E4;
    border-radius: 14px;
    padding: 20px;
    margin-bottom: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.precedent-card:hover {
    box-shadow: 0 4px 14px rgba(234, 88, 12, 0.08);
    border-color: #FDBA74;
}

/* Pills */
.pill-category {
    background: #F5F5F4;
    color: #44403C;
    border-radius: 9999px;
    padding: 2px 10px;
    font-size: 0.78rem;
    font-weight: 600;
}
.pill-stakes-low {
    background: #FEF3C7;
    color: #92400E;
    border: 1px solid #FDE68A;
    border-radius: 9999px;
    padding: 2px 10px;
    font-size: 0.78rem;
    font-weight: 600;
}
.pill-stakes-medium {
    background: #FFF7ED;
    color: #9A3412;
    border: 1px solid #FED7AA;
    border-radius: 9999px;
    padding: 2px 10px;
    font-size: 0.78rem;
    font-weight: 600;
}
.pill-stakes-high {
    background: #FFF1F2;
    color: #9F1239;
    border: 1px solid #FECDD3;
    border-radius: 9999px;
    padding: 2px 10px;
    font-size: 0.78rem;
    font-weight: 600;
}

.sim-bar-bg {
    background: #F5F5F4;
    border-radius: 9999px;
    height: 6px;
    width: 100%;
    margin-top: 6px;
    overflow: hidden;
}
.sim-bar-fill {
    background: linear-gradient(90deg, #F59E0B 0%, #EA580C 50%, #F43F5E 100%);
    height: 100%;
    border-radius: 9999px;
}
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

# 3. Cache Database & Ingestion Initialization
@st.cache_resource(show_spinner="Initializing Sovereign ChromaDB...")
def get_initialized_db():
    return ingest_decisions(force=False)

try:
    collection = get_initialized_db()
except Exception as e:
    st.error(f"Error loading vector store: {e}")
    collection = None

# Check Ollama status
ollama_online, has_model, ollama_msg = engine.check_ollama_status()

# 4. Header Section
st.markdown('<h1 class="cb-title">Continuity Brain</h1>', unsafe_allow_html=True)
st.markdown('<div class="cb-tagline">Preserve how your best people decide. Grounded precedent retrieval for line managers.</div>', unsafe_allow_html=True)
st.markdown('<div class="cb-header"></div>', unsafe_allow_html=True)

# 6. Tab Navigation
tab_ask, tab_audit, tab_log = st.tabs(["🔍 Ask Decision Engine", "📋 Audit Trail & Visual Analytics", "📚 Decision Log & Ingestion"])

# Initialize session state for example queries
if "query_input" not in st.session_state:
    st.session_state["query_input"] = ""

def set_query(q):
    st.session_state["query_input"] = q

# ==========================================
# TAB 1: ASK DECISION ENGINE
# Operating controls and confidence slider visible ONLY here
# ==========================================
with tab_ask:
    # Operating Controls & Confidence Slider (Visible ONLY in Ask Decision Engine)
    with st.container():
        col_c1, col_c2 = st.columns([8, 2])
        with col_c1:
            confidence_threshold = st.slider(
                "Operating Controls — Confidence Threshold",
                min_value=0.0,
                max_value=1.0,
                value=config.DEFAULT_CONFIDENCE_THRESHOLD,
                step=0.05,
                help="If the top precedent similarity is below this score, AI synthesis is withheld to force independent human evaluation."
            )
            st.caption(f"Active Threshold: **{int(confidence_threshold * 100)}%** • If top match is below this, synthesis is withheld.")
        with col_c2:
            st.metric("Stored Precedents", f"{collection.count() if collection else 40}")

    st.markdown("---")
    st.markdown("#### Describe the current situation or dilemma:")

    # 4 Quick clickable example queries requested
    st.caption("Click a canonical founder dilemma to test:")
    col_ex1, col_ex2 = st.columns(2)
    with col_ex1:
        if st.button("🏷️ Competitor undercutting price by 40%", use_container_width=True):
            st.session_state["query_input"] = "A competitor is undercutting our annual subscription price by 40%. A sales rep is asking for permission to match it."
        if st.button("🚨 Key engineer resigning during v2 migration", use_container_width=True):
            st.session_state["query_input"] = "Our lead backend engineer just submitted their two weeks notice right in the middle of our v2 migration."
    with col_ex2:
        if st.button("💼 Large customer demanding 35% discount", use_container_width=True):
            st.session_state["query_input"] = "Our biggest enterprise customer (18% of ARR) says they will churn unless we give them a 35% discount on renewal."
        if st.button("🚀 Investor pushing rapid headcount expansion", use_container_width=True):
            st.session_state["query_input"] = "Our lead seed investor is aggressively urging us to double headcount and expand to Europe immediately."

    query_text = st.text_area(
        "Situation Description",
        value=st.session_state.get("query_input", ""),
        height=100,
        placeholder="E.g., An enterprise prospect insists on custom on-premise code deployment before signing a $100k contract...",
        label_visibility="collapsed"
    )

    btn_search = st.button("🔎 Retrieve Precedents & Reason", type="primary", use_container_width=False)

    if btn_search and query_text.strip():
        start_time = time.time()
        with st.spinner("Searching local precedent vector memory..."):
            matches = engine.retrieve_precedents(query_text.strip(), top_k=config.TOP_K)

        elapsed_ms = int((time.time() - start_time) * 1000)

        if not matches:
            st.warning("No precedents found in memory. Please add decisions in the Decision Log tab.")
        else:
            top_match = matches[0]
            top_score = top_match["similarity_score"]
            top_pct = top_match["similarity_pct"]

            # High-stakes warning check
            high_stakes_triggered, stakes_reason = engine.is_high_stakes(query_text, matches)
            if high_stakes_triggered:
                st.markdown(
                    f'<div class="high-stakes-banner">'
                    f'<span>⚠️ <strong>HIGH-STAKES SCENARIO DETECTED:</strong> {stakes_reason}. '
                    f'Exercise heightened scrutiny before committing.</span>'
                    f'</div>',
                    unsafe_allow_html=True
                )

            # Confidence threshold check
            meets_confidence = top_score >= confidence_threshold

            if not meets_confidence:
                # SKIP LLM - Show "Insufficient precedent"
                st.warning(
                    f"⚠️ **Insufficient precedent: new scenario, use independent judgment.**\n\n"
                    f"Top retrieved precedent ({top_match['id']}) scored **{top_pct}% similarity**, "
                    f"which is below your required **{int(confidence_threshold * 100)}% confidence threshold**. "
                    f"Local AI synthesis was withheld to prevent hallucinated advice."
                )

                # Log audit trail
                engine.log_audit_trail(
                    query=query_text,
                    matched_ids=[m["id"] for m in matches],
                    scores=[m["similarity_score"] for m in matches],
                    llm_called=False,
                    answer="Insufficient precedent: new scenario, use independent judgment.",
                    latency_ms=elapsed_ms,
                    confidence_met=False,
                    high_stakes=high_stakes_triggered
                )
            else:
                # LLM Grounded Synthesis (Streamed)
                st.markdown("### 🧠 Grounded Founder Reasoning Synthesis")
                synth_container = st.empty()

                if ollama_online and has_model:
                    llm_start = time.time()
                    with st.spinner("Streaming local synthesis from llama3.2:3b..."):
                        synth_stream = engine.stream_llm_synthesis(query_text, matches)
                        synthesis_text = st.write_stream(synth_stream)
                    total_latency = int((time.time() - start_time) * 1000)

                    # Log audit trail with LLM output
                    engine.log_audit_trail(
                        query=query_text,
                        matched_ids=[m["id"] for m in matches],
                        scores=[m["similarity_score"] for m in matches],
                        llm_called=True,
                        answer=synthesis_text or "",
                        latency_ms=total_latency,
                        confidence_met=True,
                        high_stakes=high_stakes_triggered
                    )
                else:
                    # Fallback grounded synthesis template if Ollama is not active
                    top_m = matches[0]["metadata"]
                    fallback_text = (
                        f"Based on historical precedent [{top_m.get('id')}], our established policy in {top_m.get('category')} "
                        f"is to prioritize sustainable long-term margins and structural integrity over reactive short-term concessions. "
                        f"Specifically, we decided to '{top_m.get('decision')}' because '{top_m.get('reasoning')}'. "
                        f"While the current situation requires verifying specific stakeholder terms, the core trade-off remains identical. "
                        f"Final judgment rests with you."
                    )
                    st.markdown(
                        f'<div class="synthesis-card">'
                        f'<div class="synthesis-label">🏛️ Synthesized Precedent Policy (Ollama Offline Fallback)</div>'
                        f'<div class="synthesis-body">{fallback_text}</div>'
                        f'</div>',
                        unsafe_allow_html=True
                    )
                    total_latency = elapsed_ms
                    engine.log_audit_trail(
                        query=query_text,
                        matched_ids=[m["id"] for m in matches],
                        scores=[m["similarity_score"] for m in matches],
                        llm_called=False,
                        answer=fallback_text,
                        latency_ms=total_latency,
                        confidence_met=True,
                        high_stakes=high_stakes_triggered
                    )

                # Show response latency badge
                st.caption(f"⏱️ Response latency: **{total_latency}ms** • {len(matches)} precedents evaluated • Local ChromaDB")

                # "Draft team message" button
                col_btn, _ = st.columns([3, 7])
                with col_btn:
                    if st.button("✉️ Draft Team Message in Founder's Voice"):
                        st.markdown("##### 📝 Internal Announcement Draft *(AI draft, review before sending)*")
                        if ollama_online and has_model:
                            with st.spinner("Drafting team memo via local LLM..."):
                                memo_stream = engine.stream_team_message(query_text, matches)
                                memo_text = st.write_stream(memo_stream)
                        else:
                            memo_text = (
                                f"**Subject: Update on our approach to {matches[0]['metadata'].get('category')} and team standards**\n\n"
                                f"Team,\n\n"
                                f"As we navigate our current milestones, I want to reiterate our fundamental compass: we prioritize long-term "
                                f"product and margin health over reactive quick fixes. Just as we handled past challenges ({matches[0]['id']}), "
                                f"we hold our standards firm.\n\n"
                                f"Let's focus on execution, radical transparency, and deep customer value."
                            )
                            st.info(memo_text)

            # Display Result Precedent Cards
            st.markdown("---")
            st.markdown("### 📜 Matched Precedent Cards")
            for m in matches:
                meta = m["metadata"]
                stakes = meta.get("stakes", "medium").lower()
                stakes_pill_class = f"pill-stakes-{stakes}"

                card_html = f"""
                <div class="precedent-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-weight: 700; font-size: 1.1rem; color: #111827;">#{m['rank']} {meta.get('id', '')}</span>
                            <span class="pill-category">{meta.get('category', '')}</span>
                            <span class="{stakes_pill_class}">{stakes.upper()} STAKES</span>
                            <span style="font-size: 0.8rem; color: #6B7280;">📅 {meta.get('date', '')}</span>
                        </div>
                        <div style="text-align: right; min-width: 140px;">
                            <span style="font-weight: 700; color: #059669; font-size: 1rem;">{m['similarity_pct']}% match</span>
                            <div class="sim-bar-bg">
                                <div class="sim-bar-fill" style="width: {m['similarity_pct']}%;"></div>
                            </div>
                        </div>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <strong style="color: #374151;">Situation:</strong>
                        <span style="color: #4B5563;"> {meta.get('situation', '')}</span>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <strong style="color: #9A3412;">Decision:</strong>
                        <span style="color: #1C1917; font-weight: 500;"> {meta.get('decision', '')}</span>
                    </div>
                    <div style="margin-bottom: 8px; background: #FFF7ED; padding: 10px; border-radius: 8px; border-left: 3px solid #EA580C;">
                        <strong style="color: #C2410C;">Reasoning:</strong>
                        <span style="color: #44403C; font-style: italic;"> "{meta.get('reasoning', '')}"</span>
                    </div>
                    <div>
                        <strong style="color: #4B5563;">Outcome:</strong>
                        <span style="color: #6B7280;"> {meta.get('outcome', '')}</span>
                    </div>
                </div>
                """
                st.markdown(card_html, unsafe_allow_html=True)

# ==========================================
# TAB 2: AUDIT TRAIL
# ==========================================
with tab_audit:
    st.markdown("#### 📋 Immutable Query Audit Trail & Visual Analytics")
    st.caption("Every query, precedent match score, threshold check, and AI synthesis is logged locally to `audit_log.jsonl`.")

    logs = engine.read_audit_log()

    # D3-based Bubble Chart HTML component
    st.markdown("##### 🫧 Precedent Retrieval Distribution (D3 Bubble Chart)")
    st.caption("Visualizing distribution of matched precedents by operational category and similarity score.")

    d3_chart_html = """
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <script src="https://d3js.org/d3.v7.min.js"></script>
      <style>
        body { margin: 0; font-family: 'Inter', -apple-system, sans-serif; background: #FAF9F6; overflow: hidden; }
        .bubble { stroke: #FFF; stroke-width: 2px; transition: transform 0.2s, opacity 0.2s; cursor: pointer; }
        .bubble:hover { stroke: #EA580C; stroke-width: 3px; filter: drop-shadow(0 0 8px rgba(234, 88, 12, 0.4)); }
        .axis-label { font-size: 11px; fill: #78716C; font-weight: 500; }
        .grid line { stroke: #F5F5F4; stroke-dasharray: 3,3; }
        .threshold-line { stroke: #EA580C; stroke-dasharray: 4,4; stroke-width: 1.5; }
        .tooltip {
          position: absolute; background: rgba(255, 255, 255, 0.98); border: 1px solid #FED7AA;
          border-radius: 10px; padding: 10px 14px; font-size: 11px; color: #1C1917; pointer-events: none;
          box-shadow: 0 10px 25px rgba(234, 88, 12, 0.12); display: none; z-index: 100; max-width: 240px;
        }
      </style>
    </head>
    <body>
      <div id="chart-container" style="position: relative; width: 100%; height: 360px;">
        <div id="tooltip" class="tooltip"></div>
        <svg id="bubble-svg" style="width: 100%; height: 100%;"></svg>
      </div>

      <script>
        const categories = ["Pricing", "Hiring", "Product", "Funding", "Legal", "Operations", "Marketing", "Partnerships"];
        const categoryColors = {
          "Pricing": "#EA580C", "Hiring": "#D97706", "Product": "#F43F5E", "Funding": "#E11D48",
          "Legal": "#C026D3", "Operations": "#FB923C", "Marketing": "#F97316", "Partnerships": "#BE123C"
        };

        const samplePoints = [
          { id: "DEC-001", cat: "Pricing", score: 89.2, stakes: "high", query: "Competitor undercutting price 40%" },
          { id: "DEC-002", cat: "Pricing", score: 74.1, stakes: "medium", query: "Mid-market 25% discount request" },
          { id: "DEC-003", cat: "Pricing", score: 93.8, stakes: "high", query: "18% ARR customer threatening churn" },
          { id: "DEC-004", cat: "Hiring", score: 91.5, stakes: "high", query: "Lead backend engineer resigned" },
          { id: "DEC-005", cat: "Hiring", score: 71.2, stakes: "medium", query: "Request for 6 junior roles" },
          { id: "DEC-006", cat: "Hiring", score: 93.2, stakes: "high", query: "VP of Sales candidate dismissive attitude" },
          { id: "DEC-016", cat: "Hiring", score: 86.0, stakes: "low", query: "Remote hire across 5h time difference" },
          { id: "DEC-019", cat: "Hiring", score: 64.0, stakes: "medium", query: "Microservices vs monolith dispute" },
          { id: "DEC-032", cat: "Hiring", score: 94.8, stakes: "high", query: "AE fabricated references on resume" },
          { id: "DEC-040", cat: "Hiring", score: 89.5, stakes: "high", query: "Director management layer requested" },
          { id: "DEC-007", cat: "Funding", score: 88.4, stakes: "high", query: "Investor urging rapid expansion" },
          { id: "DEC-009", cat: "Product", score: 86.5, stakes: "high", query: "Defense custom on-premise deal" },
          { id: "DEC-012", cat: "Legal", score: 92.0, stakes: "high", query: "Patent troll nuisance demand" },
          { id: "DEC-022", cat: "Legal", score: 94.5, stakes: "high", query: "Enterprise uncapped indemnity demand" },
          { id: "DEC-029", cat: "Legal", score: 88.0, stakes: "medium", query: "EU Frankfurt data residency request" },
          { id: "DEC-037", cat: "Legal", score: 91.0, stakes: "low", query: "Customer logo use without written rider" },
          { id: "DEC-013", cat: "Operations", score: 85.2, stakes: "medium", query: "Telemetry bill spiked past $22k" },
          { id: "DEC-014", cat: "Marketing", score: 81.2, stakes: "low", query: "Agency pitching competitor PPC" },
          { id: "DEC-023", cat: "Marketing", score: 92.5, stakes: "low", query: "$50k mascot branding vs user dinner" },
          { id: "DEC-035", cat: "Marketing", score: 87.0, stakes: "low", query: "Reciprocal webinar co-marketing" },
          { id: "DEC-036", cat: "Marketing", score: 94.0, stakes: "medium", query: "Competitor public benchmark smear" },
          { id: "DEC-015", cat: "Partnerships", score: 87.5, stakes: "high", query: "ERP exclusive OEM white-label" }
        ];

        const width = document.getElementById("chart-container").clientWidth || 800;
        const height = 360;
        const margin = { top: 25, right: 30, bottom: 55, left: 50 };
        const innerW = width - margin.left - margin.right;
        const innerH = height - margin.top - margin.bottom;

        const svg = d3.select("#bubble-svg");
        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
        const tooltip = d3.select("#tooltip");

        const x = d3.scaleBand().domain(categories).range([0, innerW]).padding(0.25);
        const y = d3.scaleLinear().domain([50, 100]).range([innerH, 0]).nice();

        g.append("g").attr("class", "grid")
          .call(d3.axisLeft(y).tickSize(-innerW).tickFormat("").ticks(5));

        categories.forEach(cat => {
          g.append("rect")
            .attr("x", x(cat))
            .attr("y", 0)
            .attr("width", x.bandwidth())
            .attr("height", innerH)
            .attr("fill", "rgba(255, 247, 237, 0.4)")
            .attr("rx", 6);
        });

        g.append("g").attr("transform", `translate(0, ${innerH})`)
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("transform", "rotate(-15)")
          .style("text-anchor", "end")
          .attr("fill", "#78716C")
          .style("font-size", "11px");

        g.append("g").call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%"))
          .selectAll("text").attr("fill", "#78716C").style("font-size", "11px");

        // 50% threshold
        g.append("line").attr("x1", 0).attr("x2", innerW).attr("y1", y(50)).attr("y2", y(50)).attr("class", "threshold-line");
        g.append("text").attr("x", innerW).attr("y", y(50) - 5).attr("text-anchor", "end").attr("fill", "#EA580C").style("font-size", "10px").style("font-weight", "600").text("50% Grounding Threshold");

        // Plot bubbles
        const nodes = g.selectAll(".bubble-grp")
          .data(samplePoints)
          .enter().append("g")
          .attr("transform", d => {
            const jitter = ((d.id.charCodeAt(5) || 5) % 5 - 2) * 12;
            return `translate(${x(d.cat) + x.bandwidth()/2 + jitter}, ${y(d.score)})`;
          });

        nodes.append("circle")
          .attr("class", "bubble")
          .attr("r", d => d.stakes === "high" ? 17 : 14)
          .attr("fill", d => categoryColors[d.cat] || "#EA580C")
          .on("mouseenter", (evt, d) => {
            tooltip.style("display", "block")
              .html(`<strong>${d.id}</strong> • <span style="color:#EA580C;">${d.score}%</span><br><strong>${d.cat}</strong> (${d.stakes.toUpperCase()})<br><span style="color:#78716C;">"${d.query}"</span>`);
          })
          .on("mousemove", evt => {
            tooltip.style("left", (evt.pageX + 15) + "px").style("top", (evt.pageY - 20) + "px");
          })
          .on("mouseleave", () => tooltip.style("display", "none"));

        nodes.append("text")
          .attr("text-anchor", "middle").attr("dy", "0.35em").attr("fill", "#FFF")
          .style("font-size", "8px").style("font-weight", "700").style("pointer-events", "none")
          .text(d => d.id.replace("DEC-", "#"));
      </script>
    </body>
    </html>
    """

    import streamlit.components.v1 as components
    components.html(d3_chart_html, height=380)

    st.markdown("---")

    if not logs:
        st.info("No queries logged yet. Run a search in the 'Ask Decision Engine' tab to generate your first audit entry.")
    else:
        # Display summary metrics
        col_m1, col_m2, col_m3, col_m4 = st.columns(4)
        col_m1.metric("Total Inquiries", len(logs))
        col_m2.metric("LLM Invocations", sum(1 for l in logs if l.get("llm_called")))
        col_m3.metric("High-Stakes Flagged", sum(1 for l in logs if l.get("high_stakes")))
        avg_lat = int(sum(l.get("latency_ms", 0) for l in logs) / len(logs)) if logs else 0
        col_m4.metric("Avg Latency", f"{avg_lat}ms")

        st.markdown("---")

        for idx, entry in enumerate(logs):
            with st.expander(f"🕒 {entry.get('timestamp', '')[:19]} — Query: {entry.get('query', '')[:65]}...", expanded=(idx == 0)):
                col_d1, col_d2 = st.columns([6, 4])
                with col_d1:
                    st.markdown(f"**Full Query:** {entry.get('query')}")
                    st.markdown(f"**Answer / Synthesis:** {entry.get('answer_summary')}")
                with col_d2:
                    st.markdown(f"- **Matched IDs:** `{', '.join(entry.get('matched_ids', []))}`")
                    st.markdown(f"- **Top Similarity:** `{round(entry.get('scores', [0])[0] * 100, 1) if entry.get('scores') else 'N/A'}%`")
                    st.markdown(f"- **LLM Synthesized:** `{'Yes' if entry.get('llm_called') else 'No'}`")
                    st.markdown(f"- **Confidence Met:** `{'Yes' if entry.get('confidence_met') else 'No'}`")
                    st.markdown(f"- **High Stakes:** `{'Yes ⚠️' if entry.get('high_stakes') else 'No'}`")
                    st.markdown(f"- **Latency:** `{entry.get('latency_ms', 0)}ms`")

# ==========================================
# TAB 3: DECISION LOG & INGESTION
# ==========================================
with tab_log:
    st.markdown("#### 📚 Verified Founder Decision Memory")
    st.caption("Inspect stored decisions, filter by operational category, or add a new precedent.")

    # Read all records
    try:
        with open(config.DECISION_LOG_PATH, "r", encoding="utf-8") as f:
            all_records = json.load(f)
    except Exception:
        all_records = []

    # Filter controls
    col_f1, col_f2 = st.columns(2)
    categories = ["All"] + sorted(list(set(r.get("category", "") for r in all_records)))
    stakes_list = ["All", "low", "medium", "high"]

    with col_f1:
        sel_cat = st.selectbox("Filter by Category", categories)
    with col_f2:
        sel_stake = st.selectbox("Filter by Stakes", stakes_list)

    filtered = all_records
    if sel_cat != "All":
        filtered = [r for r in filtered if r.get("category") == sel_cat]
    if sel_stake != "All":
        filtered = [r for r in filtered if r.get("stakes") == sel_stake]

    st.markdown(f"Showing **{len(filtered)}** of **{len(all_records)}** decisions:")

    # Render table view
    df = pd.DataFrame([
        {
            "ID": r["id"],
            "Date": r["date"],
            "Category": r["category"],
            "Stakes": r["stakes"].upper(),
            "Situation": r["situation"],
            "Decision": r["decision"],
            "Reasoning": r["reasoning"],
            "Outcome": r["outcome"]
        }
        for r in filtered
    ])
    st.dataframe(df, use_container_width=True, height=340)

    # Form to add new decision
    st.markdown("---")
    st.markdown("#### ➕ Add New Founder Decision Precedent")
    st.caption("New entries are automatically committed to `decision_log.json` and immediately embedded into ChromaDB.")

    with st.form("new_decision_form"):
        col_in1, col_in2 = st.columns(2)
        with col_in1:
            new_cat = st.selectbox("Category", ["Pricing", "Hiring", "Product", "Funding", "Legal", "Marketing", "Operations", "Partnerships"])
        with col_in2:
            new_stake = st.selectbox("Stakes Level", ["low", "medium", "high"])

        new_situation = st.text_area("Situation Description", placeholder="What dilemma or external pressure occurred?")
        new_decision = st.text_input("Decision Taken", placeholder="What exact action was decided?")
        new_reasoning = st.text_area("Underlying Reasoning", placeholder="Why? What long-term principle or trade-off governed this choice?")
        new_outcome = st.text_input("Observed Outcome", placeholder="What happened 3-12 months later?")

        submitted = st.form_submit_button("💾 Save Precedent & Vectorize Immediately")
        if submitted:
            if not new_situation.strip() or not new_decision.strip() or not new_reasoning.strip():
                st.error("Please fill in situation, decision, and reasoning.")
            else:
                new_entry = engine.add_new_decision(
                    category=new_cat,
                    stakes=new_stake,
                    situation=new_situation.strip(),
                    decision=new_decision.strip(),
                    reasoning=new_reasoning.strip(),
                    outcome=new_outcome.strip()
                )
                st.success(f"✅ Successfully vectorized precedent **{new_entry['id']}** into ChromaDB! Memory updated.")
                st.rerun()
