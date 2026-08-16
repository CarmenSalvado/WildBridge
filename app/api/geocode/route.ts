import { NextRequest, NextResponse } from "next/server";

type NominatimResult = { display_name: string; lat: string; lon: string };

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2 || query.length > 120) return NextResponse.json({ error: "Enter a valid location." }, { status: 400 });

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.search = new URLSearchParams({ q: query, format: "jsonv2", limit: "5" }).toString();
    const response = await fetch(url, {
      headers: { "User-Agent": "WildBridge/1.0 (OregonHacks 2026; github.com/CarmenSalvado/WildBridge)", "Accept-Language": "en" },
      next: { revalidate: 86400 },
    });
    if (!response.ok) throw new Error(`Nominatim returned ${response.status}`);
    const results = (await response.json() as NominatimResult[])
      .map((item) => ({ name: item.display_name, lat: Number(item.lat), lon: Number(item.lon) }))
      .filter((item) => item.name && Number.isFinite(item.lat) && Number.isFinite(item.lon) && Math.abs(item.lat) <= 90 && Math.abs(item.lon) <= 180)
      .filter((item, index, items) => items.findIndex((candidate) => candidate.name === item.name) === index);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Location search is temporarily unavailable." }, { status: 503 });
  }
}
