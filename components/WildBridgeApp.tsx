"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, MapPin, RotateCcw, Search, Share2, Sparkles } from "lucide-react";
import { analyzeConnectivity } from "@/lib/connectivity";
import { demoSpace, portlandHabitats } from "@/data/portland";
import { recommendPlants } from "@/data/plants";
import type { SpaceType, Sunlight } from "@/lib/types";
import { HabitatMap } from "./HabitatMap";
import { Landing } from "./Landing";
import { PlantCards } from "./PlantCards";

const spaces: { name: SpaceType; icon: string }[] = [
  { name: "Balcony", icon: "▤" }, { name: "Window", icon: "▥" }, { name: "Yard", icon: "⌂" }, { name: "Patio", icon: "▦" }, { name: "School / community", icon: "◇" },
];
const before = analyzeConnectivity(portlandHabitats);
const after = analyzeConnectivity([...portlandHabitats, demoSpace]);

export function WildBridgeApp() {
  const [space, setSpace] = useState<SpaceType>("Balcony");
  const [sunlight, setSunlight] = useState<Sunlight>("Full sun");
  const [size, setSize] = useState("Small · under 25 sq ft");
  const [configuring, setConfiguring] = useState(false);
  const [simulated, setSimulated] = useState(false);
  const [showAfter, setShowAfter] = useState(false);
  const appRef = useRef<HTMLElement>(null);
  const recommendations = useMemo(() => recommendPlants(space, sunlight), [space, sunlight]);
  const newConnections = after.edges.length - before.edges.length;

  const goToDemo = () => {
    appRef.current?.scrollIntoView({ behavior: "smooth" });
    setConfiguring(false); setSimulated(false); setShowAfter(false);
  };
  const simulate = () => {
    setConfiguring(false); setSimulated(true); setShowAfter(true);
    window.setTimeout(() => document.getElementById("impact")?.focus(), 450);
  };

  return <>
    <Landing onDemo={goToDemo} />
    <section className="app-section" ref={appRef} aria-label="WildBridge habitat explorer">
      <header className="app-header">
        <a className="brand brand-light" href="#top"><span className="brand-mark"><i /><i /><i /></span>WildBridge</a>
        <div className="app-stepper" aria-label="Progress"><span className="active"><i>1</i> Explore</span><b /><span className={configuring || simulated ? "active" : ""}><i>2</i> Your space</span><b /><span className={simulated ? "active" : ""}><i>3</i> Impact</span></div>
        <button className="demo-badge" onClick={goToDemo}><span /> Portland demo <ChevronDown size={15} /></button>
      </header>

      <div className="app-body">
        <div className="map-shell">
          <div className="search-card">
            <form onSubmit={(event) => event.preventDefault()}><Search size={19} /><label className="sr-only" htmlFor="location">Search a location</label><input id="location" defaultValue="Portland, Oregon" /><button type="submit">Search</button></form>
            <p><MapPin size={14} /> Demo coverage loaded · 6 habitat patches</p>
          </div>
          <HabitatMap showAfter={showAfter} />
          {simulated && <div className="view-toggle" aria-label="Map view"><button className={!showAfter ? "active" : ""} onClick={() => setShowAfter(false)}>Before</button><button className={showAfter ? "active" : ""} onClick={() => setShowAfter(true)}>After <Sparkles size={14} /></button></div>}
        </div>

        <aside className="side-panel">
          {!configuring && !simulated && <div className="panel-content explore-panel">
            <button className="back-link" onClick={() => document.getElementById("top")?.scrollIntoView({ behavior: "smooth" })}><ArrowLeft size={16} /> Back to story</button>
            <p className="panel-eyebrow">Neighborhood analysis</p><h2>A potential bridge is waiting.</h2><p>We found a weakly connected area between downtown habitat patches.</p>
            <div className="analysis-stat"><div><span>Bridge Score</span><b>{before.score}</b><small>/100</small></div><i style={{ "--score": `${before.score}%` } as React.CSSProperties} /></div>
            <div className="finding"><span>!</span><div><b>Connectivity gap detected</b><p>Two patches sit just beyond the current connection threshold.</p></div></div>
            <button className="button button-primary button-wide" onClick={() => setConfiguring(true)}>Add my space <ArrowRight size={18} /></button>
            <p className="metric-note">Bridge Score is a prototype relative metric based on distances between nearby green-space patches. It is not a formal ecological assessment.</p>
          </div>}

          {configuring && <div className="panel-content configure-panel">
            <button className="back-link" onClick={() => setConfiguring(false)}><ArrowLeft size={16} /> Back to analysis</button>
            <p className="panel-eyebrow">Your intervention</p><h2>Tell us about your space.</h2><p>Three quick details help us suggest plants that fit.</p>
            <fieldset><legend>What kind of space?</legend><div className="space-options">{spaces.map((item) => <button type="button" className={space === item.name ? "selected" : ""} aria-pressed={space === item.name} key={item.name} onClick={() => setSpace(item.name)}><span>{item.icon}</span>{item.name}{space === item.name && <Check size={14} />}</button>)}</div></fieldset>
            <label className="field-label" htmlFor="size">Approximate size</label><select id="size" value={size} onChange={(event) => setSize(event.target.value)}><option>Small · under 25 sq ft</option><option>Medium · 25–100 sq ft</option><option>Large · over 100 sq ft</option></select>
            <fieldset><legend>Sunlight</legend><div className="segmented">{(["Full sun", "Partial", "Shade"] as Sunlight[]).map((sun) => <button type="button" className={sunlight === sun ? "selected" : ""} aria-pressed={sunlight === sun} onClick={() => setSunlight(sun)} key={sun}>{sun}</button>)}</div></fieldset>
            <button className="button button-primary button-wide" onClick={simulate}>See my potential impact <Sparkles size={17} /></button>
          </div>}

          {simulated && <div className="panel-content impact-panel" id="impact" tabIndex={-1}>
            <div className="impact-top"><span><Check /></span><i className="impact-share" aria-hidden="true"><Share2 size={17} /></i></div>
            <p className="panel-eyebrow">Intervention simulated</p><h2>You created a potential bridge.</h2><p>Your {space.toLowerCase()} could act as a stepping stone between two nearby green spaces.</p>
            <div className="score-change"><div><small>Before</small><b>{before.score}</b></div><ArrowRight /><div className="after-score"><small>After</small><b>{after.score}</b></div><span>+{after.score - before.score}</span></div>
            <div className="impact-stats"><div><b>+{newConnections}</b><span>new graph<br />connections</span></div><div><b>{recommendations.length}</b><span>native plants<br />recommended</span></div></div>
            <div className="summary" aria-label="Connectivity summary"><b>Connectivity summary</b><p>6 nearby green spaces were detected. Adding your selected space creates {newConnections} additional graph connections and increases the prototype Bridge Score from {before.score} to {after.score}.</p></div>
            <button className="reset-button" onClick={() => { setSimulated(false); setShowAfter(false); setConfiguring(true); }}><RotateCcw size={15} /> Adjust my space</button>
          </div>}
        </aside>
      </div>

      {simulated && <section className="recommendations" aria-labelledby="plant-title">
        <div className="recommendation-heading"><div><p className="panel-eyebrow">Plant your bridge</p><h2 id="plant-title">Native plants for your {space.toLowerCase()}</h2></div><p>Selected for <b>{sunlight.toLowerCase()}</b> and a <b>{size.split(" ·")[0].toLowerCase()}</b> space.</p></div>
        <PlantCards plants={recommendations} />
        <div className="science-note"><span>i</span><p><b>About the model</b><br />WildBridge uses a distance-based habitat connectivity proxy for exploration and education—not a formal ecological assessment or planting prescription.</p></div>
      </section>}
    </section>
    <footer><div className="shell"><div><a className="brand" href="#top"><span className="brand-mark"><i /><i /><i /></span>WildBridge</a><p>Small spaces. Stronger connections.</p></div><p>Built for OregonHacks 2026 · Open data, responsible framing.</p></div></footer>
  </>;
}
