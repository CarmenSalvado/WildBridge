import assert from "node:assert/strict";
import test from "node:test";
import { analyzeConnectivity, haversine } from "../lib/connectivity";
import { demoSpace, portlandHabitats } from "../data/portland";

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
