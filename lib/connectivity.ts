import type { Edge, GraphAnalysis, HabitatNode } from "./types";

export const CONNECTION_THRESHOLD_KM = 0.55;

export function haversine(a: HabitatNode, b: HabitatNode) {
  const radius = 6371;
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = radians(b.lat - a.lat);
  const dLon = radians(b.lon - a.lon);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(value));
}

export function analyzeConnectivity(nodes: HabitatNode[], thresholdKm = CONNECTION_THRESHOLD_KM, intervention?: { nodeId: string; reachKm: number }): GraphAnalysis {
  const edges: Edge[] = [];
  const neighbors = new Map(nodes.map((node) => [node.id, new Set<string>()]));
  const nearest: number[] = [];

  nodes.forEach((node, index) => {
    let nearestDistance = Infinity;
    nodes.slice(index + 1).forEach((other) => {
      const distanceKm = haversine(node, other);
      nearestDistance = Math.min(nearestDistance, distanceKm);
      const connectionThreshold = intervention && (node.id === intervention.nodeId || other.id === intervention.nodeId) ? thresholdKm + intervention.reachKm : thresholdKm;
      if (distanceKm <= connectionThreshold) {
        edges.push({ source: node.id, target: other.id, distanceKm });
        neighbors.get(node.id)?.add(other.id);
        neighbors.get(other.id)?.add(node.id);
      }
    });
    nodes.slice(0, index).forEach((other) => { nearestDistance = Math.min(nearestDistance, haversine(node, other)); });
    if (Number.isFinite(nearestDistance)) nearest.push(nearestDistance);
  });

  const seen = new Set<string>();
  const components = nodes.map((node) => {
    if (seen.has(node.id)) return [];
    const component: string[] = [];
    const queue = [node.id];
    seen.add(node.id);
    while (queue.length) {
      const current = queue.shift()!;
      component.push(current);
      neighbors.get(current)?.forEach((next) => {
        if (!seen.has(next)) { seen.add(next); queue.push(next); }
      });
    }
    return component;
  }).filter((component) => component.length);

  const isolated = nodes.filter((node) => neighbors.get(node.id)?.size === 0).map((node) => node.id);
  const connectedRatio = nodes.length > 1 ? (nodes.length - components.length) / (nodes.length - 1) : 0;
  const edgeDensity = Math.min(1, edges.length / Math.max(nodes.length, 1));
  const isolationPenalty = isolated.length / Math.max(nodes.length, 1);
  const score = Math.round(Math.max(0, Math.min(100, 8 + connectedRatio * 48 + edgeDensity * 26 - isolationPenalty * 50)));

  return {
    edges,
    components,
    isolated,
    averageNearestKm: nearest.reduce((sum, distance) => sum + distance, 0) / Math.max(nearest.length, 1),
    score,
  };
}

export function analyzeIntervention(nodes: HabitatNode[], userSpace: HabitatNode, thresholdKm = CONNECTION_THRESHOLD_KM, reachKm = 0) {
  const before = analyzeConnectivity(nodes, thresholdKm);
  const after = analyzeConnectivity([...nodes, userSpace], thresholdKm, { nodeId: userSpace.id, reachKm });
  const beforeEdges = new Set(before.edges.map((edge) => [edge.source, edge.target].sort().join("-")));
  const newEdges = after.edges.filter((edge) => !beforeEdges.has([edge.source, edge.target].sort().join("-")));
  const componentByNode = new Map(before.components.flatMap((component, index) => component.map((id) => [id, index] as const)));
  const joinedComponents = new Set(newEdges.map((edge) => componentByNode.get(edge.source === userSpace.id ? edge.target : edge.source)).filter((index) => index != null));
  const bridgedComponents = Math.max(0, joinedComponents.size - 1);

  return {
    before,
    after: newEdges.length ? after : { ...after, score: before.score },
    newConnections: newEdges.length,
    bridgedComponents,
  };
}

export function findHabitatGap(nodes: HabitatNode[], thresholdKm = CONNECTION_THRESHOLD_KM) {
  const components = analyzeConnectivity(nodes, thresholdKm).components;
  const componentByNode = new Map(components.flatMap((component, index) => component.map((id) => [id, index] as const)));
  let best: { a: HabitatNode; b: HabitatNode; distanceKm: number } | undefined;
  nodes.forEach((a, index) => nodes.slice(index + 1).forEach((b) => {
    const distanceKm = haversine(a, b);
    if (componentByNode.get(a.id) !== componentByNode.get(b.id) && distanceKm > thresholdKm && distanceKm < thresholdKm * 2 && (!best || distanceKm < best.distanceKm)) best = { a, b, distanceKm };
  }));
  if (!best) return null;
  return { lat: (best.a.lat + best.b.lat) / 2, lon: (best.a.lon + best.b.lon) / 2, between: [best.a.name, best.b.name] as [string, string] };
}
