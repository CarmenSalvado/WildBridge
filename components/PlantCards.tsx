import type { Plant } from "@/lib/types";

export function PlantCards({ plants }: { plants: Plant[] }) {
  return <div className="plant-grid">{plants.map((plant) => (
    <article className="plant-card" key={plant.scientificName}>
      <div className="plant-art" style={{ "--plant": plant.color } as React.CSSProperties}><span>{plant.icon}</span><i /><i /><i /></div>
      <div><p className="plant-native"><span /> Oregon native</p><h4>{plant.name}</h4><em>{plant.scientificName}</em><p>{plant.description}</p><small>{plant.pollinator}</small></div>
    </article>
  ))}</div>;
}
