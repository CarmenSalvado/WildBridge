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

const endpoints = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lon = Number(request.nextUrl.searchParams.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return NextResponse.json({ error: "Invalid coordinates." }, { status: 400 });

  const query = `[out:json][timeout:18];(
    nwr(around:1800,${lat},${lon})[leisure~"^(park|garden|nature_reserve)$"];
    nwr(around:1800,${lat},${lon})[natural~"^(wood|grassland|scrub|heath)$"];
    nwr(around:1800,${lat},${lon})[landuse~"^(forest|meadow|recreation_ground|village_green)$"];
    nwr(around:1800,${lat},${lon})[boundary="protected_area"];
  );out center 80;`;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "WildBridge/1.0 (OregonHacks 2026; github.com/CarmenSalvado/WildBridge)" },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(15000),
        next: { revalidate: 600 },
      });
      if (!response.ok) continue;
      const elements = (await response.json() as { elements: OverpassElement[] }).elements;
      const habitats = elements.flatMap((element): HabitatNode[] => {
        const point = element.center ?? (element.lat != null && element.lon != null ? { lat: element.lat, lon: element.lon } : null);
        if (!point) return [];
        const tags = element.tags ?? {};
        const kind = tags.leisure === "garden" ? "garden" : tags.natural === "wood" || tags.landuse === "forest" ? "wood" : "park";
        return [{ id: `osm-${element.type}-${element.id}`, name: tags.name || `Unnamed ${kind}`, ...point, area: kind === "wood" ? 4 : kind === "garden" ? 1 : 2, kind }];
      }).filter((node, index, nodes) => nodes.findIndex((item) => Math.abs(item.lat - node.lat) < .00008 && Math.abs(item.lon - node.lon) < .00008) === index)
        .sort((a, b) => Number(a.name.startsWith("Unnamed")) - Number(b.name.startsWith("Unnamed"))).slice(0, 18);
      if (habitats.length >= 3) return NextResponse.json({ habitats });
    } catch {
      // Try the second public Overpass instance before returning the reliable demo fallback.
    }
  }
  return NextResponse.json({ error: "No nearby mapped green spaces were available." }, { status: 503 });
}
