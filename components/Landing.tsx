import { ArrowDown, ArrowRight, Map, Network, Sprout } from "lucide-react";
import { NetworkMotif } from "./NetworkMotif";

const steps = [
  ["01", "Map nearby habitat", "See green-space patches around your neighborhood."],
  ["02", "Find the gaps", "Reveal places where habitat is weakly connected."],
  ["03", "Add your space", "Try a balcony, yard, patio, or window box."],
  ["04", "See the bridge", "Watch your potential connections come to life."],
];

export function Landing({ onDemo }: { onDemo: () => void }) {
  return (
    <main id="top">
      <nav className="nav shell" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="WildBridge home"><span className="brand-mark"><i /><i /><i /></span>WildBridge</a>
        <div className="nav-links">
          <a href="#why">Why it matters</a>
          <a href="#how">How it works</a>
          <button className="nav-cta" onClick={onDemo}>Try Portland demo <ArrowRight size={15} /></button>
        </div>
      </nav>

      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow"><span /> OregonHacks 2026 · Urban habitat tool</p>
          <h1>Your smallest green space can connect <em>something bigger.</em></h1>
          <p className="hero-lede">WildBridge reveals gaps between urban habitats and shows how your balcony, yard, or window box could become a stepping stone for nature.</p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={onDemo}>Find my bridge <ArrowRight size={18} /></button>
            <a className="button button-quiet" href="#how">See how it works <ArrowDown size={17} /></a>
          </div>
          <p className="hero-note"><span>●</span> No account needed · Portland demo ready</p>
        </div>
        <div className="hero-visual" aria-hidden="false">
          <div className="hero-visual-label"><span>Habitat connectivity</span><b>Potential bridge found</b></div>
          <NetworkMotif />
          <div className="hero-score"><span>Bridge Score</span><b>42 <i>→</i> 67</b><small>+25 potential</small></div>
        </div>
      </section>

      <section className="manifesto" id="why">
        <div className="shell manifesto-grid">
          <div className="section-kicker"><span>01</span><p>The opportunity</p></div>
          <div>
            <h2>Urban nature isn’t gone.<br />It’s <em>fragmented.</em></h2>
            <p>Parks, gardens, and trees often exist as isolated islands. WildBridge turns small private spaces into visible opportunities for reconnection—one practical step at a time.</p>
          </div>
          <div className="problem-diagram" role="img" aria-label="Several isolated habitat islands with a dotted potential route between them">
            <span className="island island-a" /><span className="island island-b" /><span className="island island-c" />
            <svg viewBox="0 0 400 210"><path d="M52 132 C135 45 192 160 337 64" /></svg>
            <p>small spaces,<br />shared ecosystem</p>
          </div>
        </div>
      </section>

      <section className="how shell" id="how">
        <div className="section-kicker"><span>02</span><p>How it works</p></div>
        <div className="how-heading"><h2>From map to meaningful action.</h2><p>Instead of helping you find nature, WildBridge helps you rebuild it.</p></div>
        <div className="steps">
          {steps.map(([number, title, copy], index) => (
            <article className="step" key={number}>
              <span>{number}</span>{index === 0 ? <Map /> : index === 1 ? <Network /> : <Sprout />}
              <h3>{title}</h3><p>{copy}</p>
            </article>
          ))}
        </div>
        <div className="access-note">
          <div><span>AA</span></div><p><b>Accessible by design.</b> Every map insight has a text equivalent, and connectivity is never communicated through color alone.</p>
        </div>
      </section>
    </main>
  );
}
