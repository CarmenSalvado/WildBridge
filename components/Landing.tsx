import Link from "next/link";
import { ArrowDown, ArrowRight, Map, Network, Sprout } from "lucide-react";
import { NetworkMotif } from "./NetworkMotif";

const steps = [
  ["01", "Map nearby habitat", "See green-space patches around your neighborhood."],
  ["02", "Find the gaps", "Reveal places where habitat is weakly connected."],
  ["03", "Add your space", "Try a balcony, yard, patio, or window box."],
  ["04", "See the bridge", "Watch your potential connections come to life."],
];

export function Landing() {
  return (
    <main id="top">
      <nav className="nav shell" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="WildBridge home"><span className="brand-mark"><i /><i /><i /></span>WildBridge</a>
        <div className="nav-links">
          <a href="#why">Why it matters</a>
          <a href="#how">How it works</a>
          <Link className="nav-cta" href="/explore">Open habitat explorer <ArrowRight size={15} /></Link>
        </div>
      </nav>

      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow"><span /> OregonHacks 2026 · Urban habitat tool</p>
          <h1>Your smallest green space can connect <em>something bigger.</em></h1>
          <p className="hero-lede">WildBridge reveals gaps between urban habitats and shows how your balcony, yard, or window box could become a stepping stone for nature.</p>
          <div className="hero-actions">
            <Link className="button button-primary button-find" href="/explore">
              <svg className="button-vines" viewBox="0 0 320 180" aria-hidden="true">
                <g className="vine-stems">
                  <path pathLength="1" d="M106 74C86 60 91 34 62 28C36 23 25 6 43 8C60 10 63 27 51 32" />
                  <path pathLength="1" d="M156 68C153 47 139 38 148 18C156 1 179 5 174 21C170 34 157 31 158 23" />
                  <path pathLength="1" d="M215 75C238 64 240 40 265 31C288 23 303 41 290 55C281 65 269 59 274 48" />
                  <path pathLength="1" d="M231 89C256 83 271 98 295 87C313 79 316 62 304 63C294 64 294 75 301 76" />
                  <path pathLength="1" d="M220 107C244 118 246 146 273 153C297 160 311 143 299 132C290 124 278 130 283 140" />
                  <path pathLength="1" d="M175 113C178 136 195 139 193 159C190 178 164 180 164 163C164 150 178 149 180 157" />
                  <path pathLength="1" d="M105 106C82 115 85 141 59 151C35 160 19 146 30 134C39 124 53 130 48 141" />
                  <path pathLength="1" d="M88 90C61 82 48 98 24 88C6 80 5 61 18 64C28 66 27 78 18 78" />
                </g>
                <g className="vine-leaves">
                  <path d="M50 29C36 27 31 17 33 10C44 8 54 13 57 22C57 26 54 29 50 29Z" />
                  <path d="M151 20C143 10 148 2 155 0C163 7 164 15 159 22C156 24 153 23 151 20Z" />
                  <path d="M270 34C277 22 288 21 294 25C293 36 287 43 278 44C273 43 270 39 270 34Z" />
                  <path d="M294 87C305 81 314 86 316 93C309 101 300 103 293 98C290 94 291 90 294 87Z" />
                  <path d="M273 152C285 152 291 160 289 168C279 172 269 168 266 159C266 155 269 152 273 152Z" />
                  <path d="M191 158C201 166 198 176 192 180C182 176 177 168 181 160C183 156 187 155 191 158Z" />
                  <path d="M59 150C52 162 41 163 35 158C37 147 43 141 52 141C57 142 59 146 59 150Z" />
                  <path d="M25 88C14 94 5 89 3 82C10 74 19 72 27 77C30 81 29 85 25 88Z" />
                </g>
              </svg>
              <span>Find my bridge</span><ArrowRight size={18} />
            </Link>
            <a className="button button-quiet" href="#how">See how it works <ArrowDown size={17} /></a>
          </div>
          <p className="hero-note"><span>●</span> Live OpenStreetMap search · Real mapped habitats</p>
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
