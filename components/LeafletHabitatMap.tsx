"use client";

import { useEffect } from "react";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap, ZoomControl } from "react-leaflet";
import { analyzeConnectivity, findHabitatGap } from "@/lib/connectivity";
import type { HabitatScenario } from "@/lib/types";

function FitScenario({ scenario }: { scenario: HabitatScenario }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds([...scenario.habitats, scenario.userSpace].map((node) => [node.lat, node.lon]), { padding: [55, 55], maxZoom: 15 });
  }, [map, scenario]);
  return null;
}

export function LeafletHabitatMap({ scenario, showAfter }: { scenario: HabitatScenario; showAfter: boolean }) {
  const nodes = showAfter ? [...scenario.habitats, scenario.userSpace] : scenario.habitats;
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const before = analyzeConnectivity(scenario.habitats, scenario.thresholdKm);
  const analysis = analyzeConnectivity(nodes, scenario.thresholdKm);
  const beforeEdges = new Set(before.edges.map((edge) => [edge.source, edge.target].sort().join("-")));
  const gap = findHabitatGap(scenario.habitats, scenario.thresholdKm);

  return <div className="map leaflet-map-wrap">
    <MapContainer className="leaflet-map" center={[scenario.center.lat, scenario.center.lon]} zoom={14} scrollWheelZoom zoomControl={false} aria-label={`${scenario.region} live OpenStreetMap habitat map`}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
      <ZoomControl position="bottomleft" />
      <FitScenario scenario={scenario} />
      {analysis.edges.map((edge) => {
        const a = byId.get(edge.source)!, b = byId.get(edge.target)!;
        const isNew = !beforeEdges.has([edge.source, edge.target].sort().join("-"));
        return <Polyline key={`${edge.source}-${edge.target}`} positions={[[a.lat, a.lon], [b.lat, b.lon]]} pathOptions={{ color: isNew ? "#244d39" : "#597565", weight: isNew ? 5 : 3, opacity: .85, dashArray: isNew ? "10 8" : "7 9", className: isNew ? "leaflet-new-edge" : "" }} />;
      })}
      {gap && !showAfter && <CircleMarker center={[gap.lat, gap.lon]} radius={12} pathOptions={{ color: "#b17736", fillColor: "#d09348", fillOpacity: .9, weight: 4, dashArray: "4 4" }}><Tooltip permanent direction="top">Potential gap</Tooltip></CircleMarker>}
      {nodes.map((node) => <CircleMarker key={node.id} center={[node.lat, node.lon]} radius={node.kind === "user" ? 13 : Math.max(8, Math.min(15, 7 + Math.sqrt(node.area) * 2))} pathOptions={node.kind === "user" ? { color: "#244d39", fillColor: "#d5e5a6", fillOpacity: 1, weight: 5 } : { color: "#f8f7f0", fillColor: "#608167", fillOpacity: .95, weight: 4 }}><Tooltip permanent={node.kind === "user"} direction="top">{node.name}</Tooltip></CircleMarker>)}
    </MapContainer>
    <div className="live-map-badge"><span /> LIVE OSM DATA</div>
  </div>;
}
