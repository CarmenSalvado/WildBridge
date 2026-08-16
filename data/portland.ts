import type { HabitatNode } from "@/lib/types";

export const PORTLAND_CENTER = { lat: 45.5231, lon: -122.6765 };

export const portlandHabitats: HabitatNode[] = [
  { id: "tanner", name: "Tanner Springs Park", lat: 45.5290, lon: -122.6818, area: 1.0, kind: "park" },
  { id: "fields", name: "The Fields Park", lat: 45.5325, lon: -122.6802, area: 3.2, kind: "park" },
  { id: "jamison", name: "Jamison Square", lat: 45.5297, lon: -122.6810, area: 0.9, kind: "garden" },
  { id: "north", name: "North Park Blocks", lat: 45.5258, lon: -122.6782, area: 2.4, kind: "park" },
  { id: "waterfront", name: "Waterfront Park", lat: 45.5211, lon: -122.6698, area: 12, kind: "park" },
  { id: "south", name: "South Park Blocks", lat: 45.5184, lon: -122.6831, area: 8.8, kind: "wood" },
];

export const demoSpace: HabitatNode = {
  id: "your-space",
  name: "Your green space",
  lat: 45.5242,
  lon: -122.6742,
  area: 0.08,
  kind: "user",
};
