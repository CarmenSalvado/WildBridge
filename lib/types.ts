export type SpaceType = "Balcony" | "Window" | "Yard" | "Patio" | "School / community";
export type Sunlight = "Full sun" | "Partial" | "Shade";

export type HabitatNode = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  area: number;
  kind: "park" | "garden" | "wood" | "user";
};

export type Edge = {
  source: string;
  target: string;
  distanceKm: number;
  isNew?: boolean;
};

export type GraphAnalysis = {
  edges: Edge[];
  components: string[][];
  isolated: string[];
  averageNearestKm: number;
  score: number;
};

export type Plant = {
  name: string;
  scientificName: string;
  sunlight: Sunlight[];
  spaces: SpaceType[];
  pollinator: string;
  description: string;
  color: string;
  icon: string;
};
