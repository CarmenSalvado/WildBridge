export function NetworkMotif() {
  return (
    <svg className="network-motif" viewBox="0 0 580 210" role="img" aria-label="Three habitat patches becoming connected by a small new green space">
      <path className="motif-path motif-path-one" d="M70 130 C150 82 207 88 272 106" />
      <path className="motif-path motif-path-two" d="M308 105 C375 88 422 100 510 54" />
      <circle className="motif-ring" cx="70" cy="130" r="34" />
      <circle className="motif-node" cx="70" cy="130" r="22" />
      <circle className="motif-ring" cx="510" cy="54" r="34" />
      <circle className="motif-node" cx="510" cy="54" r="22" />
      <circle className="motif-pulse" cx="290" cy="105" r="32" />
      <circle className="motif-bridge" cx="290" cy="105" r="16" />
      <path className="motif-sprout" d="M290 89V66m0 10c-8-1-12-6-12-12 8 0 12 4 12 12Zm0-4c8-1 12-6 12-12-8 0-12 4-12 12Z" />
      <text x="46" y="184">park</text>
      <text x="267" y="156">you</text>
      <text x="474" y="111">garden</text>
    </svg>
  );
}
