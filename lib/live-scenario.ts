import { findHabitatGap, haversine } from "./connectivity";
import type { HabitatNode, HabitatScenario } from "./types";

export function createLiveScenario(region: string, center: { lat: number; lon: number }, habitats: HabitatNode[]): HabitatScenario {
  let thresholdKm = .65;
  let gap = findHabitatGap(habitats, thresholdKm);

  if (!gap) {
    let closest = { a: habitats[0], b: habitats[1], distanceKm: haversine(habitats[0], habitats[1]) };
    habitats.forEach((a, index) => habitats.slice(index + 1).forEach((b) => {
      const distanceKm = haversine(a, b);
      if (distanceKm && distanceKm < closest.distanceKm) closest = { a, b, distanceKm };
    }));
    // ponytail: nearest-pair fallback keeps sparse maps useful; replace with species-specific thresholds when available.
    thresholdKm = closest.distanceKm * .7;
    gap = { lat: (closest.a.lat + closest.b.lat) / 2, lon: (closest.a.lon + closest.b.lon) / 2, between: [closest.a.name, closest.b.name] };
  }

  return {
    id: `live-${center.lat.toFixed(4)}-${center.lon.toFixed(4)}`,
    name: region.split(",")[0], region, terrain: "Live OSM data", center, habitats, thresholdKm,
    userSpace: { id: "live-your-space", name: "Your green space", lat: gap.lat, lon: gap.lon, area: .08, kind: "user" },
    labels: { area: region.toUpperCase(), district: "LIVE HABITAT MAP", water: "OPENSTREETMAP" },
  };
}
