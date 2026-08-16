# WildBridge

**Instead of helping you find nature, WildBridge helps you rebuild it.**

WildBridge is a map-driven urban habitat tool built for OregonHacks 2026. It reveals gaps between nearby green spaces and shows how a balcony, yard, patio, school garden, or window box could become a small stepping stone for nature.

The complete judge demo takes under a minute: open the Portland demo, inspect a highlighted habitat gap, add a space, choose its conditions, and watch the connectivity graph recalculate in a clear before/after view.

## Inspiration

Urban nature is often fragmented into isolated patches. Parks, gardens, and trees may be close in human terms while remaining disconnected as habitat. WildBridge makes that abstract problem personal and actionable: even a very small private space can be explored as part of a larger network.

## What it does

- Maps a reliable curated set of Portland green-space patches.
- Represents those patches as nodes in a connectivity graph.
- Highlights a possible gap between close but unconnected patches.
- Lets a user configure a balcony, window, yard, patio, or community space.
- Inserts that space into the graph and recalculates connectivity.
- Animates new links and presents a before/after Bridge Score.
- Recommends three Oregon / Pacific Northwest native plants based on space and sunlight.
- Provides a text equivalent for every important map insight.

## How we built it

WildBridge uses Next.js, React, TypeScript, and CSS, with geographic coordinates compatible with OpenStreetMap data. The Portland Demo Mode uses a bundled fallback dataset so a slow or unavailable external map service can never break the core presentation. Leaflet is the intended renderer for the live OSM data path; the demo deliberately keeps its self-contained vector map as the no-network fallback.

The technical flow is:

**OpenStreetMap-compatible green-space data → approximate habitat nodes → Haversine distances → connectivity graph → intervention simulation → before/after visualization**

The graph module creates an edge whenever two habitat centroids fall within a configurable distance threshold. It finds connected components, isolated nodes, edge density, and average nearest-neighbor distance, then normalizes those signals into the 0–100 Bridge Score. Adding a user space runs the exact same calculation again; the improvement is computed, not hard-coded.

The map is a self-contained accessible SVG rather than a fragile tile dependency. The standalone graph and recommendation modules can accept future live OSM/Overpass results without changing the product flow.

## Challenges

The hardest problem was translating habitat connectivity into something understandable in seconds without overstating ecological certainty. A simple graph model gives the demo genuine engineering depth, while careful copy keeps the result responsible.

## Accomplishments

- Real geospatial distance processing with the Haversine formula.
- Dynamic graph construction and recalculation after an intervention.
- A habitat-gap heuristic based on unconnected nearby patch pairs.
- A high-impact animated before/after map state.
- Deterministic native-plant matching for small urban spaces.
- Keyboard-accessible forms, visible focus states, reduced-motion support, semantic labels, and a complete text connectivity summary.
- A zero-account Portland demo that remains useful without external services.

## What we learned

Urban habitat connectivity is a complex, species- and context-dependent topic. Product design can make that complexity approachable, but the interface must distinguish an educational proxy from a scientific conclusion. Accessibility also improves the product for everyone: the text summary makes the graph faster to understand even for sighted map users.

## What's next

- Live OpenStreetMap / Overpass ingestion with the Portland dataset retained as automatic fallback.
- Species-specific distance thresholds and movement models.
- Richer municipal GIS layers and verified native-plant databases.
- Partnerships with municipalities, schools, and community groups.
- Citizen-science feedback to compare suggested interventions with observed habitat use.

## Scientific responsibility

**Bridge Score is a prototype habitat connectivity proxy, not a formal ecological assessment.** It is a relative metric based mainly on distances between approximate green-space centroids and simplified graph structure. It does not model habitat quality, barriers, species behavior, seasonality, property conditions, or planting survival. WildBridge demonstrates how geospatial technology could help people understand their potential contribution; it does not provide ecological or planting certification.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run lint
npm run build
```
