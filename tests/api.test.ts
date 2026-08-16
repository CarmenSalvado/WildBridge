import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { GET as geocode } from "../app/api/geocode/route";
import { GET as habitats } from "../app/api/habitats/route";

test("geocoding validates and deduplicates upstream results", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json([
    { display_name: "Portland, Oregon, USA", lat: "45.52", lon: "-122.67" },
    { display_name: "Portland, Oregon, USA", lat: "45.52", lon: "-122.67" },
    { display_name: "Broken result", lat: "not-a-number", lon: "0" },
  ]);
  try {
    const response = await geocode(new NextRequest("http://localhost/api/geocode?q=Portland"));
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.deepEqual(body.results, [{ name: "Portland, Oregon, USA", lat: 45.52, lon: -122.67 }]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("habitat lookup sends a bounded GET query and normalizes OSM features", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  globalThis.fetch = async (input) => {
    requestedUrl = String(input);
    return Response.json({ elements: [
      { id: 1, type: "way", center: { lat: 45.52, lon: -122.67 }, tags: { name: "River Park", leisure: "park" } },
      { id: 2, type: "node", lat: 45.521, lon: -122.671, tags: { name: "Community Garden", leisure: "garden" } },
      { id: 3, type: "relation", center: { lat: 45.522, lon: -122.672 }, tags: { name: "Urban Wood", natural: "wood" } },
      ...Array.from({ length: 20 }, (_, index) => ({ id: index + 4, type: "way", center: { lat: 45.523 + index * .001, lon: -122.673 }, tags: { name: `Extra Park ${index}`, leisure: "park" } })),
      { id: 24, type: "way", center: { lat: 45.52, lon: -122.67 }, tags: { leisure: "garden" } },
    ] });
  };
  try {
    const response = await habitats(new NextRequest("http://localhost/api/habitats?lat=45.52&lon=-122.67"));
    const body = await response.json();
    const query = new URL(requestedUrl).searchParams.get("data") ?? "";
    assert.equal(response.status, 200);
    assert.equal(body.habitats.length, 18);
    assert.deepEqual(body.habitats.slice(0, 3).map((node: { kind: string }) => node.kind), ["park", "garden", "wood"]);
    assert.ok(body.habitats.every((node: { name: string }) => !node.name.startsWith("Unnamed")));
    assert.match(query, /around:1800,45\.52,-122\.67/);
    assert.match(query, /\[name\]/);
    assert.match(query, /out center qt 80/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
