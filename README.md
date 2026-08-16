# WildBridge

**Instead of helping you find nature, WildBridge helps you rebuild it.**

WildBridge is a map-driven urban habitat tool built for OregonHacks 2026. It reveals gaps between nearby green spaces and shows how a balcony, yard, patio, school garden, or window box could become a small stepping stone for nature.

The complete flow takes under a minute: search a real location, inspect a highlighted habitat gap, add a space, choose its conditions, and watch the connectivity graph recalculate in a clear before/after view.

## Inspiration

Urban nature is often fragmented into isolated patches. Parks, gardens, and trees may be close in human terms while remaining disconnected as habitat. WildBridge makes that abstract problem personal and actionable: even a very small private space can be explored as part of a larger network.

## What it does

- Searches real locations worldwide through OpenStreetMap Nominatim or browser geolocation.
- Retrieves nearby parks, gardens, woods, meadows, and protected areas through Overpass API.
- Renders live OpenStreetMap tiles and graph overlays with Leaflet.
- Represents those patches as nodes in a connectivity graph.
- Highlights a possible gap between close but unconnected patches.
- Lets a user configure a balcony, window, yard, patio, or community space.
- Inserts that space into the graph and recalculates connectivity.
- Animates new links and presents a before/after Bridge Score.
- Recommends three Oregon / Pacific Northwest native plants based on space and sunlight.
- Provides a text equivalent for every important map insight.

## How we built it

WildBridge uses Next.js, React, TypeScript, Leaflet, React Leaflet, and CSS. A server-side Nominatim route resolves explicit location searches, a bounded Overpass query retrieves nearby green spaces, and Leaflet renders OpenStreetMap tiles with graph edges and intervention nodes. No sample landscape is shown as real data: analysis starts only after live habitat data is available.

The technical flow is:

**OpenStreetMap-compatible green-space data → approximate habitat nodes → Haversine distances → connectivity graph → intervention simulation → before/after visualization**

The graph module creates an edge whenever two habitat centroids fall within a configurable distance threshold. It finds connected components, isolated nodes, edge density, and average nearest-neighbor distance, then normalizes those signals into the 0–100 Bridge Score. Adding a user space runs the exact same calculation again; the improvement is computed, not hard-coded. Each landscape supplies the same small scenario contract—nodes, intervention, threshold, coordinates, and map labels—so adding another terrain does not require changing the UI or algorithm.

Live searches use an attributed Leaflet map, while the same graph and scoring modules produce the accessible text summary.

The public geocoder is called only after an explicit form submission, identifies WildBridge with a dedicated User-Agent, and is cached by Next.js. OpenStreetMap attribution is always visible on live maps. Plant recommendations remain Pacific Northwest examples and must be locally verified when exploring other regions.

## Challenges

The hardest problem was translating habitat connectivity into something understandable in seconds without overstating ecological certainty. A simple graph model gives the demo genuine engineering depth, while careful copy keeps the result responsible.

## Accomplishments

- Real geospatial distance processing with the Haversine formula.
- Dynamic graph construction and recalculation after an intervention.
- A habitat-gap heuristic based on unconnected nearby patch pairs.
- A high-impact animated before/after map state.
- Deterministic native-plant matching for small urban spaces.
- Keyboard-accessible forms, visible focus states, reduced-motion support, semantic labels, and a complete text connectivity summary.
- A clear empty state that never presents sample geometry as live habitat data.

## What we learned

Urban habitat connectivity is a complex, species- and context-dependent topic. Product design can make that complexity approachable, but the interface must distinguish an educational proxy from a scientific conclusion. Accessibility also improves the product for everyone: the text summary makes the graph faster to understand even for sighted map users.

## What's next

- A dedicated hosted habitat-data provider for higher live-search availability at scale.
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
