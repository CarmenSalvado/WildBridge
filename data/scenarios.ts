import { demoSpace, PORTLAND_CENTER, portlandHabitats } from "./portland";
import type { HabitatScenario } from "@/lib/types";

const translated = (
  id: string,
  name: string,
  region: string,
  terrain: string,
  lat: number,
  lon: number,
  names: string[],
  labels: HabitatScenario["labels"],
): HabitatScenario => {
  const move = <T extends { lat: number; lon: number }>(node: T) => ({ ...node, lat: node.lat + lat - PORTLAND_CENTER.lat, lon: node.lon + lon - PORTLAND_CENTER.lon });
  return {
    id, name, region, terrain, center: { lat, lon }, labels, thresholdKm: .55,
    habitats: portlandHabitats.map((node, index) => ({ ...move(node), id: `${id}-${node.id}`, name: names[index] })),
    userSpace: { ...move(demoSpace), id: `${id}-your-space` },
  };
};

export const habitatScenarios: HabitatScenario[] = [
  translated(
    "portland", "Pearl District", "Portland, Oregon", "Dense urban", PORTLAND_CENTER.lat, PORTLAND_CENTER.lon,
    portlandHabitats.map((node) => node.name),
    { area: "PORTLAND, OR", district: "PEARL DISTRICT", water: "WILLAMETTE RIVER" },
  ),
  translated(
    "eugene", "Riverfront", "Eugene, Oregon", "River corridor", 44.0521, -123.0868,
    ["Skinner Butte Park", "Owen Rose Garden", "RiverPlay Garden", "Downtown Riverfront Park", "Alton Baker Park", "Monroe Community Garden"],
    { area: "EUGENE, OR", district: "RIVERFRONT", water: "WILLAMETTE RIVER" },
  ),
  translated(
    "bend", "Old Bend", "Bend, Oregon", "Dry urban edge", 44.0582, -121.3153,
    ["Drake Park", "Harmon Park", "Miller’s Landing", "Columbia Park", "Riverbend Park", "Pilot Butte Habitat"],
    { area: "BEND, OR", district: "OLD BEND", water: "DESCHUTES RIVER" },
  ),
];

export const portlandScenario = habitatScenarios[0];
