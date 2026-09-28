import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { AuditLogEntry, DecisionEntry } from "../data/decisionLog";
import { Sparkles, Layers, Info } from "lucide-react";

interface PrecedentBubbleChartProps {
  auditLogs: AuditLogEntry[];
  allDecisions: DecisionEntry[];
  onSelectPrecedent?: (precedentId: string) => void;
}

interface BubbleDataPoint {
  auditId: string;
  precedentId: string;
  category: string;
  similarityPct: number;
  similarityScore: number;
  highStakes: boolean;
  timestamp: string;
  query: string;
  decisionText: string;
  reasoningSnippet: string;
  x?: number;
  y?: number;
}

const CATEGORIES = [
  "Pricing",
  "Hiring",
  "Product",
  "Funding",
  "Legal",
  "Operations",
  "Marketing",
  "Partnerships"
];

// Luxury warm color palette: terracotta, burnt orange, coral, light red, amber, and rose
const CATEGORY_COLORS: Record<string, { fill: string; border: string; glow: string; text: string; bg: string }> = {
  Pricing: {
    fill: "#EA580C", // rich terracotta
    border: "#C2410C",
    glow: "rgba(234, 88, 12, 0.4)",
    text: "#9A3412",
    bg: "#FFF7ED"
  },
  Hiring: {
    fill: "#D97706", // warm amber ochre
    border: "#B45309",
    glow: "rgba(217, 119, 6, 0.4)",
    text: "#92400E",
    bg: "#FEF3C7"
  },
  Product: {
    fill: "#F43F5E", // vibrant coral rose
    border: "#E11D48",
    glow: "rgba(244, 63, 94, 0.4)",
    text: "#9F1239",
    bg: "#FFF1F2"
  },
  Funding: {
    fill: "#E11D48", // crimson carmine
    border: "#BE123C",
    glow: "rgba(225, 29, 72, 0.4)",
    text: "#881337",
    bg: "#FFE4E6"
  },
  Legal: {
    fill: "#C026D3", // deep royal magenta / garnet
    border: "#A21CAF",
    glow: "rgba(192, 38, 211, 0.4)",
    text: "#701A75",
    bg: "#FDF4FF"
  },
  Operations: {
    fill: "#FB923C", // apricot orange
    border: "#EA580C",
    glow: "rgba(251, 146, 60, 0.4)",
    text: "#9A3412",
    bg: "#FFF7ED"
  },
  Marketing: {
    fill: "#F97316", // sunset burnt orange
    border: "#EA580C",
    glow: "rgba(249, 115, 22, 0.4)",
    text: "#9A3412",
    bg: "#FFF7ED"
  },
  Partnerships: {
    fill: "#E11D48", // rosewood
    border: "#9F1239",
    glow: "rgba(225, 29, 72, 0.4)",
    text: "#881337",
    bg: "#FFF1F2"
  }
};

export default function PrecedentBubbleChart({
  auditLogs,
  allDecisions,
  onSelectPrecedent
}: PrecedentBubbleChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [hoveredPoint, setHoveredPoint] = useState<BubbleDataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Map decisions lookup
  const decisionMap = new Map<string, DecisionEntry>();
  allDecisions.forEach((d) => decisionMap.set(d.id, d));

  // Extract all matched precedent data points from audit logs
  const bubbleData: BubbleDataPoint[] = [];
  auditLogs.forEach((log) => {
    log.matchedIds.forEach((pid, idx) => {
      const dec = decisionMap.get(pid);
      const score = log.scores[idx] !== undefined ? log.scores[idx] : 0.75;
      const simPct = Math.round(score * 1000) / 10;
      const category = dec?.category || log.primaryCategory || "Pricing";

      bubbleData.push({
        auditId: log.id,
        precedentId: pid,
        category,
        similarityPct: simPct,
        similarityScore: score,
        highStakes: dec?.stakes === "high" || log.highStakes,
        timestamp: log.timestamp,
        query: log.query,
        decisionText: dec?.decision || "Verified founder precedent recorded in knowledge graph.",
        reasoningSnippet: dec?.reasoning ? dec.reasoning.slice(0, 110) + "..." : ""
      });
    });
  });

  const filteredData =
    selectedCategory === "All"
      ? bubbleData
      : bubbleData.filter((d) => d.category === selectedCategory);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = 420;
    const margin = { top: 40, right: 35, bottom: 65, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("viewBox", `0 0 ${width} ${height}`).attr("width", "100%").attr("height", height);

    // Defs for luxury drop-shadow and gradients
    const defs = svg.append("defs");

    // Glow filter
    const filter = defs.append("filter").attr("id", "bubble-glow").attr("x", "-40%").attr("y", "-40%").attr("width", "180%").attr("height", "180%");
    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "blur");
    filter.append("feComposite").attr("in", "SourceGraphic").attr("in2", "blur").attr("operator", "over");

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // X Scale: Category bands
    const xScale = d3.scaleBand().domain(CATEGORIES).range([0, innerWidth]).padding(0.2);

    // Y Scale: Similarity Score % (50% to 100%)
    const yScale = d3.scaleLinear().domain([50, 100]).range([innerHeight, 0]).nice();

    // Subtle background gridlines
    const yAxisGrid = d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => "").ticks(5);

    g.append("g")
      .attr("class", "grid")
      .call(yAxisGrid)
      .selectAll("line")
      .attr("stroke", "#F1F5F9")
      .attr("stroke-dasharray", "3,3");
    g.selectAll(".grid .domain").remove();

    // Subtle column highlight bands for categories
    CATEGORIES.forEach((cat) => {
      const catX = xScale(cat) || 0;
      const catWidth = xScale.bandwidth();
      g.append("rect")
        .attr("x", catX)
        .attr("y", 0)
        .attr("width", catWidth)
        .attr("height", innerHeight)
        .attr("fill", selectedCategory === cat ? "rgba(255, 237, 213, 0.45)" : "rgba(248, 250, 252, 0.6)")
        .attr("rx", 6)
        .attr("stroke", selectedCategory === cat ? "#FDBA74" : "transparent")
        .attr("stroke-width", 1)
        .style("transition", "fill 0.2s ease");
    });

    // X Axis
    const xAxis = d3.axisBottom(xScale);
    const xAxisG = g.append("g").attr("transform", `translate(0, ${innerHeight})`).call(xAxis);

    xAxisG.select(".domain").attr("stroke", "#E2E8F0");
    xAxisG
      .selectAll("text")
      .attr("transform", "rotate(-18)")
      .style("text-anchor", "end")
      .attr("dx", "-0.6em")
      .attr("dy", "0.8em")
      .attr("font-size", "11px")
      .attr("font-weight", (d) => (d === selectedCategory ? "700" : "500"))
      .attr("fill", (d) => (d === selectedCategory ? "#C2410C" : "#64748B"))
      .style("cursor", "pointer")
      .on("click", (_, d) => {
        setSelectedCategory((prev) => (prev === d ? "All" : (d as string)));
      });

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `${d}%`);
    const yAxisG = g.append("g").call(yAxis);
    yAxisG.select(".domain").attr("stroke", "#E2E8F0");
    yAxisG
      .selectAll("text")
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .attr("fill", "#64748B");

    // Y Axis Label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("fill", "#94A3B8")
      .text("Similarity Score (1 - Cosine Distance)");

    // 50% Confidence Threshold Reference Line
    const thresholdY = yScale(50);
    g.append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", thresholdY)
      .attr("y2", thresholdY)
      .attr("stroke", "#F97316")
      .attr("stroke-dasharray", "4,4")
      .attr("stroke-width", 1.5);

    g.append("text")
      .attr("x", innerWidth - 5)
      .attr("y", thresholdY - 6)
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .attr("fill", "#EA580C")
      .text("50% Grounding Threshold");

    // Bubble simulation / positioning with jitter
    const seededRandom = (seed: string) => {
      let h = 0;
      for (let i = 0; i < seed.length; i++) {
        h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
      }
      return ((h & 0x7fffffff) % 1000) / 1000;
    };

    // Calculate layout for each bubble
    const plottedData = filteredData.map((d, i) => {
      const catBand = xScale(d.category) || 0;
      const bandWidth = xScale.bandwidth();
      // Pseudo-random jitter inside category column so bubbles don't perfectly overlap
      const jitter = (seededRandom(d.auditId + d.precedentId) - 0.5) * (bandWidth * 0.55);
      const cx = catBand + bandWidth / 2 + jitter;
      const cy = yScale(Math.max(50, Math.min(100, d.similarityPct)));
      return {
        ...d,
        x: cx,
        y: cy
      };
    });

    // Render Bubble Groups
    const bubbles = g
      .selectAll(".bubble-group")
      .data(plottedData)
      .enter()
      .append("g")
      .attr("class", "bubble-group")
      .attr("transform", (d) => `translate(${d.x}, ${innerHeight})`)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        // Dim other bubbles
        d3.selectAll(".bubble-group").style("opacity", 0.3);
        d3.select(this).style("opacity", 1.0);

        // Enlarge current bubble
        d3.select(this).select("circle.main-bubble")
          .transition()
          .duration(180)
          .attr("r", 24)
          .attr("filter", "url(#bubble-glow)");

        // Set hover state
        const rect = container.getBoundingClientRect();
        setHoveredPoint(d);
        setTooltipPos({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        });
      })
      .on("mousemove", function (event) {
        const rect = container.getBoundingClientRect();
        setTooltipPos({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        });
      })
      .on("mouseleave", function (_, d) {
        d3.selectAll(".bubble-group").style("opacity", 1.0);
        d3.select(this).select("circle.main-bubble")
          .transition()
          .duration(180)
          .attr("r", d.highStakes ? 20 : 17)
          .attr("filter", null);

        setHoveredPoint(null);
      })
      .on("click", (_, d) => {
        if (onSelectPrecedent) {
          onSelectPrecedent(d.precedentId);
        }
      });

    // Outer subtle pulse ring for High Stakes
    bubbles
      .filter((d) => d.highStakes)
      .append("circle")
      .attr("class", "pulse-ring")
      .attr("r", 25)
      .attr("fill", "none")
      .attr("stroke", "#F43F5E")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "2,2")
      .attr("opacity", 0.7);

    // Main Circle with luxury warm gradients
    bubbles
      .append("circle")
      .attr("class", "main-bubble")
      .attr("r", 0)
      .attr("fill", (d) => CATEGORY_COLORS[d.category]?.fill || "#EA580C")
      .attr("stroke", (d) => (d.highStakes ? "#E11D48" : "#FFFFFF"))
      .attr("stroke-width", 2)
      .attr("opacity", 0.92);

    // Inside text label (precedent ID DEC-XXX)
    bubbles
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.32em")
      .attr("fill", "#FFFFFF")
      .attr("font-size", "9px")
      .attr("font-weight", "700")
      .attr("letter-spacing", "-0.02em")
      .text((d) => d.precedentId.replace("DEC-", "#"))
      .attr("opacity", 0);

    // Animate bubbles up from bottom
    bubbles
      .transition()
      .duration(750)
      .delay((_, i) => i * 35)
      .ease(d3.easeCubicOut)
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

    bubbles
      .select("circle.main-bubble")
      .transition()
      .duration(750)
      .delay((_, i) => i * 35)
      .attr("r", (d) => (d.highStakes ? 20 : 17));

    bubbles
      .select("text")
      .transition()
      .duration(400)
      .delay((_, i) => i * 35 + 300)
      .attr("opacity", 1);
  }, [auditLogs, allDecisions, selectedCategory]);

  return (
    <div className="bg-white border border-stone-200/90 rounded-[14px] p-5 shadow-xs relative overflow-hidden space-y-4">
      {/* Header & Category Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <h3 className="text-sm font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-600" />
              Precedent Retrieval Distribution (D3 Bubble Chart)
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Visualizing historical decision matches across 8 categories and cosine similarity scores.
          </p>
        </div>

        {/* Legend stats */}
        <div className="flex items-center gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
            <span>Standard Precedent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border border-rose-500 bg-rose-500 flex items-center justify-center text-[7px] text-white font-bold">
              !
            </span>
            <span className="text-rose-700 font-medium">High Stakes</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills (Orange & Light Red Luxury Styling) */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mr-1">
          Filter:
        </span>
        <button
          onClick={() => setSelectedCategory("All")}
          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
            selectedCategory === "All"
              ? "bg-gradient-to-r from-orange-600 to-rose-600 text-white shadow-2xs font-semibold"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          All ({bubbleData.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = bubbleData.filter((d) => d.category === cat).length;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                isSelected
                  ? "bg-orange-600 text-white shadow-2xs font-semibold"
                  : "bg-orange-50/60 text-stone-700 hover:bg-orange-100/70 border border-orange-200/50"
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: isSelected ? "#FFFFFF" : CATEGORY_COLORS[cat]?.fill || "#EA580C"
                }}
              />
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1 rounded-full font-mono ${
                  isSelected ? "bg-white/20 text-white" : "bg-orange-100/80 text-orange-800"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* D3 SVG Container */}
      <div ref={containerRef} className="relative w-full h-[420px] bg-stone-50/40 rounded-xl border border-stone-200/60 overflow-hidden">
        <svg ref={svgRef} className="w-full h-full" />

        {/* Hover Tooltip (Warm Luxury Glassmorphism) */}
        {hoveredPoint && tooltipPos && (
          <div
            className="absolute z-40 pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: `${Math.max(120, Math.min(tooltipPos.x, (containerRef.current?.clientWidth || 800) - 130))}px`,
              top: `${Math.max(130, tooltipPos.y)}px`
            }}
          >
            <div className="bg-white/95 backdrop-blur-md border border-orange-200/90 shadow-xl rounded-xl p-3.5 w-72 text-stone-900 text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-orange-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-orange-900 text-sm">
                    {hoveredPoint.precedentId}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-800">
                    {hoveredPoint.category}
                  </span>
                </div>
                <span className="font-bold text-orange-600 font-mono text-sm">
                  {hoveredPoint.similarityPct}% match
                </span>
              </div>

              {hoveredPoint.highStakes && (
                <div className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>HIGH-STAKES SCENARIO</span>
                </div>
              )}

              <div className="text-stone-600 line-clamp-2 leading-relaxed">
                <strong className="text-stone-900 font-medium">Query:</strong>{" "}
                {hoveredPoint.query}
              </div>

              <div className="bg-orange-50/60 p-2 rounded-lg border border-orange-200/60 text-stone-800 line-clamp-2 leading-relaxed italic text-[11px]">
                "{hoveredPoint.decisionText}"
              </div>

              <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono pt-1">
                <span>{new Date(hoveredPoint.timestamp).toLocaleDateString()}</span>
                <span className="text-orange-700 font-medium">Click to inspect</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info Callout */}
      <div className="flex items-center justify-between text-xs text-stone-500 pt-1 px-1">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-orange-500" />
          <span>Interactive D3 canvas: hover over bubbles to view similarity score and decision context.</span>
        </span>
        <span className="font-mono text-stone-400">
          {filteredData.length} precedent event{filteredData.length !== 1 ? "s" : ""} plotted
        </span>
      </div>
    </div>
  );
}
