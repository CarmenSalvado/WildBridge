"use client";

import { LocateFixed, Minus, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { analyzeConnectivity, findHabitatGap } from "@/lib/connectivity";
import { demoSpace, portlandHabitats } from "@/data/portland";
import type { HabitatNode } from "@/lib/types";

const bounds = { minLon: -122.688, maxLon: -122.664, minLat: 45.514, maxLat: 45.536 };
const point = (node: Pick<HabitatNode, "lat" | "lon">) => ({
  x: ((node.lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * 780,
  y: 560 - ((node.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 560,
});

export function HabitatMap({ showAfter }: { showAfter: boolean }) {
  const [zoom, setZoom] = useState(1);
  const nodes = showAfter ? [...portlandHabitats, demoSpace] : portlandHabitats;
  const analysis = analyzeConnectivity(nodes);
  const beforeEdges = new Set(analyzeConnectivity(portlandHabitats).edges.map((edge) => [edge.source, edge.target].sort().join("-")));
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const gap = findHabitatGap(portlandHabitats);

  return (
    <div className={`map ${showAfter ? "is-after" : "is-before"}`}>
      <svg className="map-canvas" style={{ transform: `scale(${zoom})` }} viewBox="0 0 780 560" role="img" aria-labelledby="map-title map-desc">
        <title id="map-title">Portland habitat connectivity map</title>
        <desc id="map-desc">Six urban green-space patches around Portland. {showAfter ? "Your selected space is added with new dotted connections." : "A potential connectivity gap is marked between habitat patches."}</desc>
        <rect width="780" height="560" fill="#ebe9df" />
        <g className="map-blocks">
          {Array.from({ length: 9 }, (_, row) => Array.from({ length: 12 }, (_, col) => <rect key={`${row}-${col}`} x={col * 70 - 15 + (row % 2) * 12} y={row * 70 - 15} width="47" height="44" rx="4" />))}
        </g>
        <path className="river" d="M600-20 C530 90 655 205 590 310 C535 405 620 475 580 590" />
        <g className="roads"><path d="M-20 120 800 480" /><path d="M30 500 720 30" /><path d="M-20 300 800 205" /><path d="M350-20 410 590" /></g>
        <g className="map-labels"><text x="36" y="46">PEARL DISTRICT</text><text x="49" y="514">DOWNTOWN</text><text x="634" y="286">WILLAMETTE RIVER</text></g>
        <g className="graph-edges">
          {analysis.edges.map((edge) => {
            const a = point(byId.get(edge.source)!); const b = point(byId.get(edge.target)!);
            const isNew = !beforeEdges.has([edge.source, edge.target].sort().join("-"));
            return <line className={isNew ? "new-edge" : ""} key={`${edge.source}-${edge.target}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
          })}
        </g>
        {gap && !showAfter && <g className="gap-marker" transform={`translate(${point(gap).x} ${point(gap).y})`}><circle r="30" /><circle r="8" /><path d="M-38 0h18m40 0h18" /></g>}
        <g className="habitat-nodes">
          {nodes.map((node) => {
            const p = point(node); const radius = Math.max(13, Math.min(28, 12 + Math.sqrt(node.area) * 4));
            return <g key={node.id} className={node.kind === "user" ? "user-node" : "habitat-node"} transform={`translate(${p.x} ${p.y})`}><circle className="node-halo" r={radius + 8} /><circle className="node-core" r={radius} /><circle className="node-dot" r="3" /><text y={radius + 21}>{node.name.replace(" Park", "")}</text></g>;
          })}
        </g>
        {gap && !showAfter && <g className="gap-label" transform={`translate(${point(gap).x - 71} ${point(gap).y - 55})`}><rect width="142" height="34" rx="17" /><text x="71" y="21">POTENTIAL GAP</text></g>}
        {showAfter && <g className="bridge-label" transform={`translate(${point(demoSpace).x - 76} ${point(demoSpace).y - 60})`}><rect width="152" height="35" rx="17" /><text x="76" y="22">YOUR NEW BRIDGE</text></g>}
      </svg>
      <div className="map-meta"><span>PORTLAND, OR</span><span>45.5231° N, 122.6765° W</span></div>
      <div className="map-tools" aria-label="Map controls"><button aria-label="Zoom in" disabled={zoom >= 1.4} onClick={() => setZoom((value) => Math.min(1.4, value + .2))}><Plus /></button><button aria-label="Zoom out" disabled={zoom <= 1} onClick={() => setZoom((value) => Math.max(1, value - .2))}><Minus /></button><button aria-label="Reset map zoom" onClick={() => setZoom(1)}><LocateFixed /></button></div>
      {!showAfter && <div className="gap-card"><span><Sparkles size={15} /> Habitat gap</span><b>A stepping-stone could connect two nearby patches here.</b></div>}
    </div>
  );
}
