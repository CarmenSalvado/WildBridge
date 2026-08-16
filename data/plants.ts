import type { Plant, SpaceType, Sunlight } from "@/lib/types";

export const plants: Plant[] = [
  { name: "Oregon sunshine", scientificName: "Eriophyllum lanatum", sunlight: ["Full sun"], spaces: ["Balcony", "Window", "Yard", "Patio", "School / community"], pollinator: "Bees & butterflies", description: "Golden blooms that thrive in dry, sunny containers.", color: "#E7B843", icon: "✦" },
  { name: "Farewell-to-spring", scientificName: "Clarkia amoena", sunlight: ["Full sun", "Partial"], spaces: ["Balcony", "Window", "Yard", "Patio", "School / community"], pollinator: "Native bees", description: "A compact annual with bright cup-shaped flowers.", color: "#D97886", icon: "✿" },
  { name: "Roemer’s fescue", scientificName: "Festuca roemeri", sunlight: ["Full sun", "Partial"], spaces: ["Balcony", "Yard", "Patio", "School / community"], pollinator: "Habitat cover", description: "Fine-textured native grass with year-round structure.", color: "#91A96C", icon: "≋" },
  { name: "Coastal strawberry", scientificName: "Fragaria chiloensis", sunlight: ["Full sun", "Partial"], spaces: ["Balcony", "Window", "Yard", "Patio", "School / community"], pollinator: "Bees", description: "Evergreen groundcover with flowers and edible fruit.", color: "#B85C57", icon: "●" },
  { name: "Inside-out flower", scientificName: "Vancouveria hexandra", sunlight: ["Partial", "Shade"], spaces: ["Balcony", "Window", "Yard", "Patio", "School / community"], pollinator: "Small native bees", description: "Airy white flowers for quiet, shaded corners.", color: "#D7D9C8", icon: "✧" },
  { name: "Western bleeding heart", scientificName: "Dicentra formosa", sunlight: ["Partial", "Shade"], spaces: ["Balcony", "Window", "Yard", "Patio", "School / community"], pollinator: "Hummingbirds", description: "Fern-like foliage and pink flowers for moist shade.", color: "#D58B9F", icon: "♥" },
  { name: "Kinnikinnick", scientificName: "Arctostaphylos uva-ursi", sunlight: ["Full sun", "Partial"], spaces: ["Balcony", "Yard", "Patio", "School / community"], pollinator: "Bees & birds", description: "Low evergreen cover with flowers and red berries.", color: "#58775C", icon: "◆" },
  { name: "Douglas aster", scientificName: "Symphyotrichum subspicatum", sunlight: ["Full sun", "Partial"], spaces: ["Yard", "School / community"], pollinator: "Late-season pollinators", description: "Lavender fall flowers with high habitat value.", color: "#7F79A6", icon: "✺" },
  { name: "Red flowering currant", scientificName: "Ribes sanguineum", sunlight: ["Full sun", "Partial"], spaces: ["Yard", "School / community"], pollinator: "Hummingbirds & bees", description: "A celebrated Northwest shrub with early pink blooms.", color: "#B76278", icon: "♣" },
  { name: "Nodding onion", scientificName: "Allium cernuum", sunlight: ["Full sun", "Partial"], spaces: ["Balcony", "Window", "Yard", "Patio", "School / community"], pollinator: "Bees & butterflies", description: "Compact clusters of pale pink summer flowers.", color: "#B69ABE", icon: "✤" },
  { name: "Woodland strawberry", scientificName: "Fragaria vesca", sunlight: ["Partial", "Shade"], spaces: ["Balcony", "Window", "Yard", "Patio", "School / community"], pollinator: "Bees", description: "A shade-tolerant edible groundcover for small spaces.", color: "#70945F", icon: "●" },
  { name: "Common camas", scientificName: "Camassia quamash", sunlight: ["Full sun", "Partial"], spaces: ["Yard", "Patio", "School / community"], pollinator: "Native bees", description: "Blue spring flowers rooted in Northwest landscapes.", color: "#687BB5", icon: "✦" },
];

export function recommendPlants(space: SpaceType, sunlight: Sunlight) {
  return plants.filter((plant) => plant.spaces.includes(space) && plant.sunlight.includes(sunlight)).slice(0, 3);
}
