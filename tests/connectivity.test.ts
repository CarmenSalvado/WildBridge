import assert from "node:assert/strict";
import test from "node:test";
import { analyzeConnectivity, analyzeIntervention, findHabitatGaps, haversine } from "../lib/connectivity";
import { demoSpace, PORTLAND_CENTER, portlandHabitats } from "../data/portland";
import { createLiveScenario } from "../lib/live-scenario";

test("adding the demo habitat improves the real graph score", () => {
  const before = analyzeConnectivity(portlandHabitats);
  const after = analyzeConnectivity([...portlandHabitats, demoSpace]);
  assert.ok(haversine(portlandHabitats[0], portlandHabitats[1]) > 0);
  assert.ok(after.score > before.score);
  assert.ok(after.edges.length > before.edges.length);
  assert.deepEqual(
    { before: before.score, after: after.score, newConnections: after.edges.length - before.edges.length },
    { before: 29, after: 50, newConnections: 2 },
  );
});

test("live OSM nodes produce a useful bridge scenario", () => {
  const scenario = createLiveScenario("Test location", PORTLAND_CENTER, portlandHabitats);
  assert.match(scenario.id, /^live-/);
  assert.deepEqual({ lat: scenario.userSpace.lat, lon: scenario.userSpace.lon }, PORTLAND_CENTER);
  assert.equal(scenario.thresholdKm, .65);
});

test("a real intervention scores connections without changing existing habitat edges", () => {
  const result = analyzeIntervention(portlandHabitats, demoSpace);
  const originalEdges = analyzeConnectivity(portlandHabitats).edges.length;
  assert.equal(result.before.edges.length, originalEdges);
  assert.equal(result.newConnections, 2);
  assert.equal(result.bridgedComponents, 1);
  assert.equal(result.after.score, analyzeConnectivity([...portlandHabitats, demoSpace]).score);
});

test("an isolated intervention does not claim an impact", () => {
  const isolated = { ...demoSpace, id: "isolated", lat: PORTLAND_CENTER.lat + .1, lon: PORTLAND_CENTER.lon + .1 };
  const result = analyzeIntervention(portlandHabitats, isolated);
  assert.equal(result.newConnections, 0);
  assert.equal(result.bridgedComponents, 0);
  assert.equal(result.after.score, result.before.score);
});

test("space reach changes only the intervention connections", () => {
  const habitats = [
    { id: "west", name: "West habitat", lat: 0, lon: 0, area: 1, kind: "park" as const },
    { id: "east", name: "East habitat", lat: 0, lon: .012, area: 1, kind: "park" as const },
  ];
  const space = { id: "space", name: "Your space", lat: 0, lon: .006, area: .1, kind: "user" as const };
  const small = analyzeIntervention(habitats, space, .55, 0);
  const large = analyzeIntervention(habitats, space, .55, .15);
  assert.equal(small.newConnections, 0);
  assert.equal(large.newConnections, 2);
  assert.equal(large.bridgedComponents, 1);
  assert.equal(large.before.edges.length, small.before.edges.length);
});

test("counts one reached network instead of every patch in it", () => {
  const habitats = [
    { id: "a", name: "A", lat: 0, lon: 0, area: 1, kind: "park" as const },
    { id: "b", name: "B", lat: 0, lon: .001, area: 1, kind: "park" as const },
    { id: "c", name: "C", lat: 0, lon: .002, area: 1, kind: "park" as const },
  ];
  const result = analyzeIntervention(habitats, { id: "space", name: "Your space", lat: 0, lon: .001, area: .1, kind: "user" }, .55);
  assert.equal(result.newConnections, 1);
  assert.equal(result.bridgedComponents, 0);
});

test("finds multiple distinct gaps between disconnected habitat groups", () => {
  const habitats = [
    { id: "west", name: "West", lat: 0, lon: 0, area: 1, kind: "park" as const },
    { id: "center", name: "Center", lat: 0, lon: .006, area: 1, kind: "garden" as const },
    { id: "east", name: "East", lat: 0, lon: .012, area: 1, kind: "park" as const },
  ];
  const gaps = findHabitatGaps(habitats, .55);
  assert.deepEqual(gaps.map((gap) => gap.between), [["West", "Center"], ["Center", "East"]]);
});
