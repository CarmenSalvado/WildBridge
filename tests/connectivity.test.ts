import assert from "node:assert/strict";
import test from "node:test";
import { analyzeConnectivity, haversine } from "../lib/connectivity";
import { demoSpace, portlandHabitats } from "../data/portland";
import { habitatScenarios } from "../data/scenarios";
import { createLiveScenario } from "../lib/live-scenario";

test("adding the demo habitat improves the real graph score", () => {
  const before = analyzeConnectivity(portlandHabitats);
  const after = analyzeConnectivity([...portlandHabitats, demoSpace]);
  assert.ok(haversine(portlandHabitats[0], portlandHabitats[1]) > 0);
  assert.ok(after.score > before.score);
  assert.ok(after.edges.length > before.edges.length);
  assert.deepEqual(
    { before: before.score, after: after.score, newConnections: after.edges.length - before.edges.length },
    { before: 42, after: 67, newConnections: 2 },
  );
});

test("every bundled landscape has a useful intervention", () => {
  habitatScenarios.forEach((scenario) => {
    const before = analyzeConnectivity(scenario.habitats, scenario.thresholdKm);
    const after = analyzeConnectivity([...scenario.habitats, scenario.userSpace], scenario.thresholdKm);
    assert.ok(after.score > before.score, scenario.region);
    assert.ok(after.edges.length > before.edges.length, scenario.region);
  });
});

test("live OSM nodes produce a useful bridge scenario", () => {
  const scenario = createLiveScenario("Test location", habitatScenarios[0].center, habitatScenarios[0].habitats);
  const before = analyzeConnectivity(scenario.habitats, scenario.thresholdKm);
  const after = analyzeConnectivity([...scenario.habitats, scenario.userSpace], scenario.thresholdKm);
  assert.match(scenario.id, /^live-/);
  assert.ok(after.score > before.score);
  assert.ok(after.edges.length > before.edges.length);
});
