"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, LocateFixed, LoaderCircle, MapPin, RotateCcw, Search, Share2, Sparkles, Wifi } from "lucide-react";
import { analyzeIntervention, findHabitatGap } from "@/lib/connectivity";
import { recommendPlants } from "@/data/plants";
import { createLiveScenario } from "@/lib/live-scenario";
import type { HabitatNode, HabitatScenario } from "@/lib/types";
import type { SpaceType, Sunlight } from "@/lib/types";
import { PlantCards } from "./PlantCards";

const LeafletHabitatMap = dynamic(() => import("./LeafletHabitatMap").then((module) => module.LeafletHabitatMap), { ssr: false, loading: () => <div className="map map-loading"><LoaderCircle /> Loading live map…</div> });

const spaces: { name: SpaceType; icon: string }[] = [
  { name: "Balcony", icon: "▤" }, { name: "Window", icon: "▥" }, { name: "Yard", icon: "⌂" }, { name: "Patio", icon: "▦" }, { name: "School / community", icon: "◇" },
];
const sizeOptions = [
  { value: "small", label: "Small · under 25 sq ft", area: .03, reachKm: 0 },
  { value: "medium", label: "Medium · 25–100 sq ft", area: .08, reachKm: .05 },
  { value: "large", label: "Large · over 100 sq ft", area: .2, reachKm: .1 },
] as const;
const plantingOptions = [
  { value: "few", label: "A few", detail: "1–3", reachKm: 0 },
  { value: "several", label: "Several", detail: "4–9", reachKm: .025 },
  { value: "many", label: "Many", detail: "10+", reachKm: .05 },
] as const;
type SizeValue = typeof sizeOptions[number]["value"];
type PlantingValue = typeof plantingOptions[number]["value"];
type LocationMatch = { name: string; lat: number; lon: number };

export function WildBridgeApp() {
  const [scenario, setScenario] = useState<HabitatScenario | null>(null);
  const [query, setQuery] = useState("");
  const [locationMatches, setLocationMatches] = useState<LocationMatch[]>([]);
  const [locationState, setLocationState] = useState<"idle" | "loading" | "live" | "error">("idle");
  const [locationMessage, setLocationMessage] = useState("Search a city or use your location to load live habitat data");
  const [space, setSpace] = useState<SpaceType>("Balcony");
  const [sunlight, setSunlight] = useState<Sunlight>("Full sun");
  const [size, setSize] = useState<SizeValue>("small");
  const [planting, setPlanting] = useState<PlantingValue>("several");
  const [configuring, setConfiguring] = useState(false);
  const [simulated, setSimulated] = useState(false);
  const [showAfter, setShowAfter] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const selectedSize = sizeOptions.find((option) => option.value === size)!;
  const selectedPlanting = plantingOptions.find((option) => option.value === planting)!;
  const interventionReachKm = selectedSize.reachKm + selectedPlanting.reachKm;
  const userSpace = useMemo(() => scenario ? { ...scenario.userSpace, area: selectedSize.area } : null, [scenario, selectedSize.area]);
  const activeScenario = useMemo(() => scenario && userSpace ? { ...scenario, userSpace } : scenario, [scenario, userSpace]);
  const impact = useMemo(() => scenario && userSpace ? analyzeIntervention(scenario.habitats, userSpace, scenario.thresholdKm, interventionReachKm) : null, [scenario, userSpace, interventionReachKm]);
  const gap = useMemo(() => scenario ? findHabitatGap(scenario.habitats, scenario.thresholdKm) : null, [scenario]);
  const beforeScore = impact?.before.score ?? 0;
  const afterScore = impact?.after.score ?? 0;
  const scoreGain = afterScore - beforeScore;
  const recommendations = useMemo(() => recommendPlants(space, sunlight), [space, sunlight]);
  const newConnections = impact?.newConnections ?? 0;
  const bridgedComponents = impact?.bridgedComponents ?? 0;
  const outcome = bridgedComponents > 0
    ? { tone: "bridge", title: "You created a potential bridge.", copy: `Your ${space.toLowerCase()} links habitat groups that were previously disconnected.` }
    : newConnections > 0
      ? { tone: "connected", title: "Your space joins the network.", copy: `Your ${space.toLowerCase()} connects to nearby habitat, but does not bridge two separate groups yet.` }
      : { tone: "neutral", title: "No connection yet — and that’s useful.", copy: "This position sits beyond the current connection range. Try moving the marker closer to a mapped green space." };
  const loadCoordinates = async (lat: number, lon: number, name: string) => {
    setLocationState("loading"); setLocationMessage("Reading nearby OpenStreetMap habitat data…");
    const response = await fetch(`/api/habitats?lat=${lat}&lon=${lon}`);
    const data = await response.json() as { habitats?: HabitatNode[]; error?: string };
    if (!response.ok || !data.habitats || data.habitats.length < 3) throw new Error(data.error || "No nearby habitat data was found.");
    const live = createLiveScenario(name, { lat, lon }, data.habitats);
    setScenario(live); setLocationState("live"); setLocationMessage(`Live OpenStreetMap data · ${live.habitats.length} habitat patches`);
    setConfiguring(false); setSimulated(false); setShowAfter(false); setShareStatus("");
  };
  const chooseLocation = async (match: LocationMatch) => {
    setQuery(match.name.split(",").slice(0, 3).join(","));
    try {
      await loadCoordinates(match.lat, match.lon, match.name);
      setLocationMatches([]);
    } catch (error) {
      setLocationState("error"); setLocationMessage(error instanceof Error ? error.message : "Live habitat data could not be loaded.");
    }
  };
  const searchLocation = async (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim().length < 2) return;
    try {
      setLocationState("loading"); setLocationMessage("Finding that location…");
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`);
      const data = await response.json() as { results?: LocationMatch[]; error?: string };
      if (!response.ok || !data.results?.length) throw new Error(data.error || "Location not found.");
      if (data.results.length === 1) await chooseLocation(data.results[0]);
      else { setLocationMatches(data.results); setLocationState("idle"); setLocationMessage("Choose the exact place to analyze"); }
    } catch (error) {
      setLocationState("error"); setLocationMessage(error instanceof Error ? error.message : "Location search failed.");
    }
  };
  const useMyLocation = () => {
    if (!navigator.geolocation) { setLocationState("error"); setLocationMessage("This browser does not support geolocation."); return; }
    setLocationMatches([]);
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
  const selectUserLocation = (lat: number, lon: number) => {
    setScenario((current) => current ? { ...current, userSpace: { ...current.userSpace, lat, lon } } : current);
    setShowAfter(false); setSimulated(false); setShareStatus("");
  };
  const startOver = () => {
    setScenario(null); setQuery(""); setLocationMatches([]); setLocationState("idle"); setLocationMessage("Search a city or use your location to load live habitat data");
    setConfiguring(false); setSimulated(false); setShowAfter(false); setShareStatus("");
    window.setTimeout(() => document.getElementById("location")?.focus(), 0);
  };
  const shareResult = async () => {
    if (!scenario || !impact) return;
    const text = `WildBridge analysis for ${scenario.name}: ${beforeScore} → ${afterScore} connectivity score, ${newConnections} habitat network${newConnections === 1 ? "" : "s"} reached, planting level ${selectedPlanting.label.toLowerCase()}.`;
    try {
      if (navigator.share) await navigator.share({ title: "My WildBridge impact", text, url: window.location.href });
      else { await navigator.clipboard.writeText(text); setShareStatus("Result copied"); }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareStatus("Could not share");
    }
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
            <form className="location-search" onSubmit={searchLocation}><Search size={19} /><label className="sr-only" htmlFor="location">Search a location</label><input id="location" value={query} onChange={(event) => { setQuery(event.target.value); setLocationMatches([]); }} placeholder="Search any city or address" /><button type="submit" disabled={locationState === "loading" || query.trim().length < 2} aria-label="Search location">{locationState === "loading" ? <LoaderCircle className="spin" /> : <ArrowRight />}</button></form>
            {locationMatches.length > 0 && <ul className="location-results" aria-label="Location results">{locationMatches.map((match) => <li key={`${match.lat}-${match.lon}`}><button type="button" onClick={() => chooseLocation(match)} disabled={locationState === "loading"}><MapPin /><span>{match.name}</span></button></li>)}</ul>}
            <div className="location-options"><button type="button" onClick={useMyLocation} disabled={locationState === "loading"}><LocateFixed /> Use my location</button></div>
            <p className={locationState === "error" ? "search-error" : ""} aria-live="polite"><MapPin size={14} /> {locationMessage}</p>
          </div>
          <LeafletHabitatMap key={scenario?.id ?? "empty"} scenario={activeScenario} showAfter={showAfter} previewUserSpace={configuring} reachKm={interventionReachKm} onSelectLocation={selectUserLocation} />
          {configuring && <div className="map-placement-hint"><MapPin /> Click the map to place your space</div>}
          {scenario && <div className="map-legend" aria-label="Map legend"><span><i className="legend-habitat" /> Habitat patch</span><span><i className="legend-link" /> Connection</span>{!showAfter && <span><i className="legend-gap" /> Potential gap</span>}{(configuring || simulated) && <span><i className="legend-space" /> Your space</span>}</div>}
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
            <p className="panel-eyebrow">{scenario.terrain} analysis</p><h2>{gap ? "A potential bridge is waiting." : "This area is already well connected."}</h2><p>{gap ? `We found a weakly connected area near ${scenario.name}.` : `No clear connectivity gap was found near ${scenario.name}.`}</p>
            <div className="analysis-stat"><div><span>Local connectivity score</span><b>{beforeScore}</b><small>/100</small></div><i style={{ "--score": `${beforeScore}%` } as React.CSSProperties} /></div>
            <div className="finding"><span>{gap ? "!" : "✓"}</span><div><b>{gap ? "Connectivity gap detected" : "No gap detected"}</b><p>{gap ? `${gap.between[0]} and ${gap.between[1]} sit close, but outside the current connection range.` : "The mapped green spaces already form one local network at the current range."}</p></div></div>
            <details className="score-method"><summary>How is this score calculated?</summary><p>We turn mapped green spaces into a graph, connect nearby patches, then combine connected groups, isolated patches, and edge density into a 0–100 relative score.</p></details>
            <button className="button button-primary button-wide" onClick={() => { setConfiguring(true); setShowAfter(false); }}>Add my real space <ArrowRight size={18} /></button>
            <p className="metric-note">Bridge Score is a prototype relative metric based on distances between nearby green-space patches. It is not a formal ecological assessment.</p>
          </div>}

          {scenario && configuring && <div className="panel-content configure-panel">
            <button className="back-link" onClick={() => setConfiguring(false)}><ArrowLeft size={16} /> Back to analysis</button>
            <p className="panel-eyebrow">Your intervention</p><h2>Place your space.</h2><p>Your searched address is selected. Click anywhere on the map to fine-tune the real location.</p>
            <div className="selected-location"><MapPin /><div><b>Selected coordinates</b><span>{scenario.userSpace.lat.toFixed(5)}, {scenario.userSpace.lon.toFixed(5)}</span></div><button type="button" onClick={() => selectUserLocation(scenario.center.lat, scenario.center.lon)}>Reset</button></div>
            <fieldset><legend>What kind of space?</legend><div className="space-options">{spaces.map((item) => <button type="button" className={space === item.name ? "selected" : ""} aria-pressed={space === item.name} key={item.name} onClick={() => setSpace(item.name)}><span>{item.icon}</span>{item.name}{space === item.name && <Check size={14} />}</button>)}</div></fieldset>
            <label className="field-label" htmlFor="size">Approximate size</label><select id="size" value={size} onChange={(event) => setSize(event.target.value as SizeValue)}>{sizeOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select>
            <fieldset><legend>How many plants?</legend><div className="segmented">{plantingOptions.map((option) => <button type="button" className={planting === option.value ? "selected" : ""} aria-pressed={planting === option.value} onClick={() => setPlanting(option.value)} key={option.value}>{option.label}<small>{option.detail}</small></button>)}</div></fieldset>
            <fieldset><legend>Sunlight</legend><div className="segmented">{(["Full sun", "Partial", "Shade"] as Sunlight[]).map((sun) => <button type="button" className={sunlight === sun ? "selected" : ""} aria-pressed={sunlight === sun} onClick={() => setSunlight(sun)} key={sun}>{sun}</button>)}</div></fieldset>
            <div className="live-impact-preview"><span>Projected score</span><b>{beforeScore} <i>→</i> {afterScore}</b><small>Updates with location, size, and planting level</small></div>
            <button className="button button-primary button-wide" onClick={simulate}>Calculate my impact <Sparkles size={17} /></button>
          </div>}

          {scenario && simulated && <div className="panel-content impact-panel" data-outcome={outcome.tone} id="impact" tabIndex={-1}>
            <div className="impact-top"><span>{newConnections ? <Check /> : <MapPin />}</span><button className="impact-share" onClick={shareResult} aria-label="Share this result"><Share2 size={17} /></button></div>
            <p className="panel-eyebrow">Personal impact calculated</p><h2>{outcome.title}</h2><p>{outcome.copy}</p>
            <div className="score-change"><div><small>Current</small><b>{beforeScore}</b></div><ArrowRight /><div className="after-score"><small>With your space</small><b>{afterScore}</b></div><span>{scoreGain ? `+${scoreGain}` : "No change"}</span></div>
            <div className="impact-stats"><div><b>{newConnections}</b><span>habitat networks<br />reached</span></div><div><b>{bridgedComponents}</b><span>network gaps<br />bridged</span></div></div>
            <div className="summary" aria-label="Connectivity summary"><b>Why the score changed</b><p>{newConnections ? `At this location, your ${selectedSize.label.split(" ·")[0].toLowerCase()} ${space.toLowerCase()} with ${selectedPlanting.label.toLowerCase()} plants reaches ${newConnections} habitat network${newConnections === 1 ? "" : "s"}${bridgedComponents ? ` and bridges ${bridgedComponents} network gap${bridgedComponents === 1 ? "" : "s"}` : ". Existing patches in the same network count once"}.` : "No mapped habitat network falls within the current modeled reach. Try a different location, space size, or planting level."}</p></div>
            <div className="result-actions"><button className="reset-button" onClick={() => { setSimulated(false); setShowAfter(false); setConfiguring(true); }}><RotateCcw size={15} /> Adjust my space</button><button className="reset-button" onClick={startOver}><Search size={15} /> New location</button></div>
            <p className="share-status" aria-live="polite">{shareStatus}</p>
          </div>}
        </aside>
      </div>

      {scenario && simulated && <section className="recommendations" aria-labelledby="plant-title">
        <div className="recommendation-heading"><div><p className="panel-eyebrow">{newConnections ? "Plant your bridge" : "Strengthen your space"}</p><h2 id="plant-title">Pacific Northwest plants for your {space.toLowerCase()}</h2></div><p>Planting level: <b>{selectedPlanting.label.toLowerCase()}</b> · selected for <b>{sunlight.toLowerCase()}</b> and a <b>{selectedSize.label.split(" ·")[0].toLowerCase()}</b> space.</p></div>
        <PlantCards plants={recommendations} />
        <div className="science-note"><span>i</span><p><b>About the model</b><br />WildBridge uses a distance-based connectivity proxy for exploration—not a formal ecological assessment. Space size and planting level change modeled reach by at most 150 meters; plant suggestions are Pacific Northwest examples and should be locally verified.</p></div>
      </section>}
    </section>
    <footer><div className="shell"><div><Link className="brand" href="/"><span className="brand-mark"><i /><i /><i /></span>WildBridge</Link><p>Small spaces. Stronger connections.</p></div><p>Built for OregonHacks 2026 · Open data, responsible framing.</p></div></footer>
  </>;
}
