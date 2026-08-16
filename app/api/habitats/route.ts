import { NextRequest, NextResponse } from "next/server";
import type { HabitatNode } from "@/lib/types";

type OverpassElement = {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const endpoints = ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter"];

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lon = Number(request.nextUrl.searchParams.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return NextResponse.json({ error: "Invalid coordinates." }, { status: 400 });

  const query = `[out:json][timeout:18];(
    nwr(around:1800,${lat},${lon})[leisure~"^(park|garden|nature_reserve)$"][name];
    nwr(around:1800,${lat},${lon})[natural~"^(wood|grassland|scrub|heath)$"][name];
    nwr(around:1800,${lat},${lon})[landuse~"^(forest|meadow|recreation_ground|village_green)$"][name];
    nwr(around:1800,${lat},${lon})[boundary="protected_area"][name];
  );out center qt 80;`;

  let receivedData = false;
  for (const endpoint of endpoints) {
    try {
      const url = new URL(endpoint);
      url.searchParams.set("data", query);
      const response = await fetch(url, {
        headers: { "User-Agent": "WildBridge/1.0 (OregonHacks 2026; github.com/CarmenSalvado/WildBridge)" },
        signal: AbortSignal.timeout(15000),
        next: { revalidate: 600 },
      });
      if (!response.ok) continue;
      const elements = (await response.json() as { elements: OverpassElement[] }).elements;
      receivedData = true;
      const habitats = elements.flatMap((element): HabitatNode[] => {
        const point = element.center ?? (element.lat != null && element.lon != null ? { lat: element.lat, lon: element.lon } : null);
        if (!point) return [];
        const tags = element.tags ?? {};
        if (!tags.name) return [];
        const kind = tags.leisure === "garden" ? "garden" : tags.natural === "wood" || tags.landuse === "forest" ? "wood" : "park";
        return [{ id: `osm-${element.type}-${element.id}`, name: tags.name, ...point, area: kind === "wood" ? 4 : kind === "garden" ? 1 : 2, kind }];
      }).filter((node, index, nodes) => nodes.findIndex((item) => item.name === node.name || Math.abs(item.lat - node.lat) < .00008 && Math.abs(item.lon - node.lon) < .00008) === index)
        .sort((a, b) => (a.lat - lat) ** 2 + (a.lon - lon) ** 2 - (b.lat - lat) ** 2 - (b.lon - lon) ** 2).slice(0, 18);
      if (habitats.length >= 3) return NextResponse.json({ habitats });
    } catch {
      // Try the second public Overpass instance before the client uses its local estimate.
    }
  }
  return NextResponse.json(
    { error: receivedData ? "Fewer than three nearby mapped green spaces were found." : "Live habitat data is temporarily unavailable." },
    { status: receivedData ? 404 : 503 },
  );
}
