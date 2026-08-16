import type { HabitatNode, HabitatScenario } from "./types";

export function createLiveScenario(region: string, center: { lat: number; lon: number }, habitats: HabitatNode[]): HabitatScenario {
  const thresholdKm = .65;

  return {
    id: `live-${center.lat.toFixed(4)}-${center.lon.toFixed(4)}`,
    name: region.split(",")[0], region, terrain: "Live OSM data", center, habitats, thresholdKm,
    userSpace: { id: "live-your-space", name: "Your green space", lat: center.lat, lon: center.lon, area: .08, kind: "user" },
    labels: { area: region.toUpperCase(), district: "LIVE HABITAT MAP", water: "OPENSTREETMAP" },
  };
}
