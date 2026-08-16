"use client";

import { Check, Sprout } from "lucide-react";
import { useState } from "react";
import type { Plant } from "@/lib/types";

export function PlantCards({ plants }: { plants: Plant[] }) {
  const [planted, setPlanted] = useState<string[]>([]);

  return <div className="plant-grid">{plants.map((plant) => {
    const isPlanted = planted.includes(plant.scientificName);
    return <article className="plant-card" data-planted={isPlanted} key={plant.scientificName}>
      <div className="plant-art" style={{ "--plant": plant.color } as React.CSSProperties}><span>{plant.icon}</span><i /><i /><i /></div>
      <div><p className="plant-native"><span /> Oregon native</p><h4>{plant.name}</h4><em>{plant.scientificName}</em><p>{plant.description}</p><small>{plant.pollinator}</small><button className="plant-planted" type="button" aria-pressed={isPlanted} onClick={() => setPlanted((items) => isPlanted ? items.filter((item) => item !== plant.scientificName) : [...items, plant.scientificName])}>{isPlanted ? <Check size={13} /> : <Sprout size={13} />}{isPlanted ? "Planted" : "I planted this"}</button></div>
    </article>;
  })}</div>;
}
