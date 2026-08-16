"use client";

import { LocateFixed, Minus, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { analyzeConnectivity, findHabitatGap } from "@/lib/connectivity";
import type { HabitatNode, HabitatScenario } from "@/lib/types";

const projector = (nodes: HabitatNode[]) => {
  const lats = nodes.map((node) => node.lat), lons = nodes.map((node) => node.lon);
  const minLat = Math.min(...lats) - .003, maxLat = Math.max(...lats) + .003;
  const minLon = Math.min(...lons) - .003, maxLon = Math.max(...lons) + .003;
  return (node: Pick<HabitatNode, "lat" | "lon">) => ({ x: ((node.lon - minLon) / (maxLon - minLon)) * 780, y: 560 - ((node.lat - minLat) / (maxLat - minLat)) * 560 });
};

export function HabitatMap({ scenario, showAfter }: { scenario: HabitatScenario; showAfter: boolean }) {
  const [zoom, setZoom] = useState(1);
  const nodes = showAfter ? [...scenario.habitats, scenario.userSpace] : scenario.habitats;
  const point = projector([...scenario.habitats, scenario.userSpace]);
  const analysis = analyzeConnectivity(nodes, scenario.thresholdKm);
  const beforeEdges = new Set(analyzeConnectivity(scenario.habitats, scenario.thresholdKm).edges.map((edge) => [edge.source, edge.target].sort().join("-")));
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const gap = findHabitatGap(scenario.habitats, scenario.thresholdKm);

  return (
    <div className={`map ${showAfter ? "is-after" : "is-before"}`}>
      <svg className="map-canvas" style={{ transform: `scale(${zoom})` }} viewBox="0 0 780 560" role="img" aria-labelledby="map-title map-desc">
        <title id="map-title">{`${scenario.region} habitat connectivity map`}</title>
        <desc id="map-desc">{scenario.habitats.length} green-space patches in a {scenario.terrain.toLowerCase()} setting. {showAfter ? "Your selected space is added with new dotted connections." : "A potential connectivity gap is marked between habitat patches."}</desc>
        <rect width="780" height="560" fill="#ebe9df" />
        <g className="map-blocks">
          {Array.from({ length: 9 }, (_, row) => Array.from({ length: 12 }, (_, col) => <rect key={`${row}-${col}`} x={col * 70 - 15 + (row % 2) * 12} y={row * 70 - 15} width="47" height="44" rx="4" />))}
        </g>
        <path className="river" d="M600-20 C530 90 655 205 590 310 C535 405 620 475 580 590" />
        <g className="roads"><path d="M-20 120 800 480" /><path d="M30 500 720 30" /><path d="M-20 300 800 205" /><path d="M350-20 410 590" /></g>
        <g className="map-labels"><text x="36" y="46">{scenario.labels.district}</text><text x="49" y="514">{scenario.terrain.toUpperCase()}</text><text x="634" y="286">{scenario.labels.water}</text></g>
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
        {showAfter && <g className="bridge-label" transform={`translate(${point(scenario.userSpace).x - 76} ${point(scenario.userSpace).y - 60})`}><rect width="152" height="35" rx="17" /><text x="76" y="22">YOUR NEW BRIDGE</text></g>}
      </svg>
      <div className="map-meta"><span>{scenario.labels.area}</span><span>{Math.abs(scenario.center.lat).toFixed(4)}° {scenario.center.lat >= 0 ? "N" : "S"}, {Math.abs(scenario.center.lon).toFixed(4)}° {scenario.center.lon >= 0 ? "E" : "W"}</span></div>
      <div className="map-tools" aria-label="Map controls"><button aria-label="Zoom in" disabled={zoom >= 1.4} onClick={() => setZoom((value) => Math.min(1.4, value + .2))}><Plus /></button><button aria-label="Zoom out" disabled={zoom <= 1} onClick={() => setZoom((value) => Math.max(1, value - .2))}><Minus /></button><button aria-label="Reset map zoom" onClick={() => setZoom(1)}><LocateFixed /></button></div>
      {!showAfter && <div className="gap-card"><span><Sparkles size={15} /> Habitat gap</span><b>A stepping-stone could connect two nearby patches here.</b></div>}
    </div>
  );
}
