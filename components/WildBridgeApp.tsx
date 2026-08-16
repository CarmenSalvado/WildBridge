"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, LocateFixed, LoaderCircle, MapPin, RotateCcw, Search, Share2, Sparkles, Wifi } from "lucide-react";
import { analyzeConnectivity } from "@/lib/connectivity";
import { recommendPlants } from "@/data/plants";
import { createLiveScenario } from "@/lib/live-scenario";
import type { HabitatNode, HabitatScenario } from "@/lib/types";
import type { SpaceType, Sunlight } from "@/lib/types";
import { PlantCards } from "./PlantCards";

const LeafletHabitatMap = dynamic(() => import("./LeafletHabitatMap").then((module) => module.LeafletHabitatMap), { ssr: false, loading: () => <div className="map map-loading"><LoaderCircle /> Loading live map…</div> });

const spaces: { name: SpaceType; icon: string }[] = [
  { name: "Balcony", icon: "▤" }, { name: "Window", icon: "▥" }, { name: "Yard", icon: "⌂" }, { name: "Patio", icon: "▦" }, { name: "School / community", icon: "◇" },
];
export function WildBridgeApp() {
  const [scenario, setScenario] = useState<HabitatScenario | null>(null);
  const [query, setQuery] = useState("");
  const [locationState, setLocationState] = useState<"idle" | "loading" | "live" | "error">("idle");
  const [locationMessage, setLocationMessage] = useState("Search a city or use your location to load live habitat data");
  const [space, setSpace] = useState<SpaceType>("Balcony");
  const [sunlight, setSunlight] = useState<Sunlight>("Full sun");
  const [size, setSize] = useState("Small · under 25 sq ft");
  const [configuring, setConfiguring] = useState(false);
  const [simulated, setSimulated] = useState(false);
  const [showAfter, setShowAfter] = useState(false);
  const before = analyzeConnectivity(scenario?.habitats ?? [], scenario?.thresholdKm);
  const after = analyzeConnectivity(scenario ? [...scenario.habitats, scenario.userSpace] : [], scenario?.thresholdKm);
  const recommendations = useMemo(() => recommendPlants(space, sunlight), [space, sunlight]);
  const newConnections = after.edges.length - before.edges.length;
  const loadCoordinates = async (lat: number, lon: number, name: string) => {
    setLocationState("loading"); setLocationMessage("Reading nearby OpenStreetMap habitat data…");
    const response = await fetch(`/api/habitats?lat=${lat}&lon=${lon}`);
    const data = await response.json() as { habitats?: HabitatNode[]; error?: string };
    if (!response.ok || !data.habitats || data.habitats.length < 3) throw new Error(data.error || "No nearby habitat data was found.");
    const live = createLiveScenario(name, { lat, lon }, data.habitats);
    setScenario(live); setLocationState("live"); setLocationMessage(`Live OpenStreetMap data · ${live.habitats.length} habitat patches`);
    setConfiguring(false); setSimulated(false); setShowAfter(false);
  };
  const searchLocation = async (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim().length < 2) return;
    try {
      setLocationState("loading"); setLocationMessage("Finding that location…");
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`);
      const data = await response.json() as { results?: { name: string; lat: number; lon: number }[]; error?: string };
      if (!response.ok || !data.results?.length) throw new Error(data.error || "Location not found.");
      const match = data.results[0]; setQuery(match.name.split(",").slice(0, 3).join(","));
      await loadCoordinates(match.lat, match.lon, match.name);
    } catch (error) {
      setLocationState("error"); setLocationMessage(error instanceof Error ? error.message : "Location search failed.");
    }
  };
  const useMyLocation = () => {
    if (!navigator.geolocation) { setLocationState("error"); setLocationMessage("This browser does not support geolocation."); return; }
    setLocationState("loading"); setLocationMessage("Waiting for location permission…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => loadCoordinates(coords.latitude, coords.longitude, "Your current location").catch((error) => { setLocationState("error"); setLocationMessage(error instanceof Error ? error.message : "Live habitat data could not be loaded."); }),
      () => { setLocationState("error"); setLocationMessage("Location permission was unavailable. Search for a place instead."); },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };
  const simulate = () => {
    setConfiguring(false); setSimulated(true); setShowAfter(true);
    window.setTimeout(() => document.getElementById("impact")?.focus(), 450);
  };

  return <>
    <section className="app-section explore-route" aria-label="WildBridge habitat explorer">
      <header className="app-header">
        <Link className="brand brand-light" href="/"><span className="brand-mark"><i /><i /><i /></span>WildBridge</Link>
        <div className="app-stepper" aria-label="Progress"><span className="active"><i>1</i> Explore</span><b /><span className={configuring || simulated ? "active" : ""}><i>2</i> Your space</span><b /><span className={simulated ? "active" : ""}><i>3</i> Impact</span></div>
        <div className="source-badge"><span /> {scenario ? <><Wifi size={12} /> Live map</> : "OpenStreetMap"}</div>
      </header>

      <div className="app-body">
        <div className="map-shell">
          <div className="search-card">
            <form className="location-search" onSubmit={searchLocation}><Search size={19} /><label className="sr-only" htmlFor="location">Search a location</label><input id="location" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search any city or address" /><button type="submit" disabled={locationState === "loading" || query.trim().length < 2} aria-label="Search location">{locationState === "loading" ? <LoaderCircle className="spin" /> : <ArrowRight />}</button></form>
            <div className="location-options"><button type="button" onClick={useMyLocation} disabled={locationState === "loading"}><LocateFixed /> Use my location</button></div>
            <p className={locationState === "error" ? "search-error" : ""} aria-live="polite"><MapPin size={14} /> {locationMessage}</p>
          </div>
          <LeafletHabitatMap key={scenario?.id ?? "empty"} scenario={scenario} showAfter={showAfter} />
          {simulated && <div className="view-toggle" aria-label="Map view"><button className={!showAfter ? "active" : ""} onClick={() => setShowAfter(false)}>Before</button><button className={showAfter ? "active" : ""} onClick={() => setShowAfter(true)}>After <Sparkles size={14} /></button></div>}
        </div>

        <aside className="side-panel">
          {!scenario && <div className="panel-content explore-panel empty-explore-panel">
            <Link className="back-link" href="/"><ArrowLeft size={16} /> Back to story</Link>
            <p className="panel-eyebrow">Live habitat explorer</p><h2>Start with a real place.</h2><p>Search any city or address, or use your current location. WildBridge will load nearby mapped green spaces directly from OpenStreetMap.</p>
            <div className="empty-map-key"><MapPin /><span><b>No sample landscape</b>Results only appear when live habitat data is available.</span></div>
          </div>}

          {scenario && !configuring && !simulated && <div className="panel-content explore-panel">
            <Link className="back-link" href="/"><ArrowLeft size={16} /> Back to story</Link>
            <p className="panel-eyebrow">{scenario.terrain} analysis</p><h2>A potential bridge is waiting.</h2><p>We found a weakly connected area near {scenario.name}.</p>
            <div className="analysis-stat"><div><span>Bridge Score</span><b>{before.score}</b><small>/100</small></div><i style={{ "--score": `${before.score}%` } as React.CSSProperties} /></div>
            <div className="finding"><span>!</span><div><b>Connectivity gap detected</b><p>Two patches sit just beyond the current connection threshold.</p></div></div>
            <button className="button button-primary button-wide" onClick={() => setConfiguring(true)}>Add my space <ArrowRight size={18} /></button>
            <p className="metric-note">Bridge Score is a prototype relative metric based on distances between nearby green-space patches. It is not a formal ecological assessment.</p>
          </div>}

          {scenario && configuring && <div className="panel-content configure-panel">
            <button className="back-link" onClick={() => setConfiguring(false)}><ArrowLeft size={16} /> Back to analysis</button>
            <p className="panel-eyebrow">Your intervention</p><h2>Tell us about your space.</h2><p>Three quick details help us suggest plants that fit.</p>
            <fieldset><legend>What kind of space?</legend><div className="space-options">{spaces.map((item) => <button type="button" className={space === item.name ? "selected" : ""} aria-pressed={space === item.name} key={item.name} onClick={() => setSpace(item.name)}><span>{item.icon}</span>{item.name}{space === item.name && <Check size={14} />}</button>)}</div></fieldset>
            <label className="field-label" htmlFor="size">Approximate size</label><select id="size" value={size} onChange={(event) => setSize(event.target.value)}><option>Small · under 25 sq ft</option><option>Medium · 25–100 sq ft</option><option>Large · over 100 sq ft</option></select>
            <fieldset><legend>Sunlight</legend><div className="segmented">{(["Full sun", "Partial", "Shade"] as Sunlight[]).map((sun) => <button type="button" className={sunlight === sun ? "selected" : ""} aria-pressed={sunlight === sun} onClick={() => setSunlight(sun)} key={sun}>{sun}</button>)}</div></fieldset>
            <button className="button button-primary button-wide" onClick={simulate}>See my potential impact <Sparkles size={17} /></button>
          </div>}

          {scenario && simulated && <div className="panel-content impact-panel" id="impact" tabIndex={-1}>
            <div className="impact-top"><span><Check /></span><i className="impact-share" aria-hidden="true"><Share2 size={17} /></i></div>
            <p className="panel-eyebrow">Intervention simulated</p><h2>You created a potential bridge.</h2><p>Your {space.toLowerCase()} could act as a stepping stone between two nearby green spaces.</p>
            <div className="score-change"><div><small>Before</small><b>{before.score}</b></div><ArrowRight /><div className="after-score"><small>After</small><b>{after.score}</b></div><span>+{after.score - before.score}</span></div>
            <div className="impact-stats"><div><b>+{newConnections}</b><span>new graph<br />connections</span></div><div><b>{recommendations.length}</b><span>native plants<br />recommended</span></div></div>
            <div className="summary" aria-label="Connectivity summary"><b>Connectivity summary</b><p>{scenario.habitats.length} nearby green spaces were detected. Adding your selected space creates {newConnections} additional graph connections and increases the prototype Bridge Score from {before.score} to {after.score}.</p></div>
            <button className="reset-button" onClick={() => { setSimulated(false); setShowAfter(false); setConfiguring(true); }}><RotateCcw size={15} /> Adjust my space</button>
          </div>}
        </aside>
      </div>

      {scenario && simulated && <section className="recommendations" aria-labelledby="plant-title">
        <div className="recommendation-heading"><div><p className="panel-eyebrow">Plant your bridge</p><h2 id="plant-title">Native plants for your {space.toLowerCase()}</h2></div><p>Selected for <b>{sunlight.toLowerCase()}</b> and a <b>{size.split(" ·")[0].toLowerCase()}</b> space.</p></div>
        <PlantCards plants={recommendations} />
        <div className="science-note"><span>i</span><p><b>About the model</b><br />WildBridge uses a distance-based habitat connectivity proxy for exploration and education—not a formal ecological assessment or planting prescription. Plant suggestions are Pacific Northwest examples and should be locally verified.</p></div>
      </section>}
    </section>
    <footer><div className="shell"><div><Link className="brand" href="/"><span className="brand-mark"><i /><i /><i /></span>WildBridge</Link><p>Small spaces. Stronger connections.</p></div><p>Built for OregonHacks 2026 · Open data, responsible framing.</p></div></footer>
  </>;
}
