/**
 * Illustration of the three-tier provincial HMIS: facilities -> district hubs -> provincial core.
 * Data-flow lines animate with CSS only (disabled for reduced-motion users via the global rule).
 */
const facilities = [0, 1, 2, 3, 4, 5].map((i) => 62 + i * 87);
const hubs = [118, 280, 442];

export default function HmisFlow() {
  return (
    <figure className="hmis-flow">
      <svg viewBox="0 0 560 410" role="img" aria-labelledby="hmis-flow-title hmis-flow-desc">
        <title id="hmis-flow-title">Three-tier health information system</title>
        <desc id="hmis-flow-desc">Health facilities send data to district hubs, which feed a provincial core with a longitudinal patient record, governed AI services and an interoperability hub.</desc>

        {/* flows: facilities -> hubs */}
        {facilities.map((x, i) => {
          const hub = hubs[Math.floor(i / 2)];
          return <path key={`f${x}`} className="flow" d={`M${x} 318 C ${x} 270, ${hub} 270, ${hub} 214`} />;
        })}
        {/* flows: hubs -> core */}
        {hubs.map((x) => (
          <path key={`h${x}`} className="flow flow-2" d={`M${x} 168 C ${x} 140, 280 138, 280 108`} />
        ))}

        {/* Tier 3 */}
        <g>
          <rect x="130" y="18" width="300" height="90" rx="16" className="tier-core" />
          <text x="280" y="48" textAnchor="middle" className="t-mono t-bright">PROVINCIAL CORE</text>
          <text x="280" y="70" textAnchor="middle" className="t-small">Longitudinal patient record</text>
          <text x="280" y="88" textAnchor="middle" className="t-small">Governed AI · Interoperability hub</text>
          <g className="ai-badge"><circle cx="404" cy="40" r="11" /><text x="404" y="44" textAnchor="middle">AI</text></g>
        </g>

        {/* Tier 2 */}
        {hubs.map((x) => (
          <g key={`hub${x}`}>
            <rect x={x - 56} y="168" width="112" height="46" rx="12" className="tier-hub" />
            <text x={x} y="195" textAnchor="middle" className="t-mono">DISTRICT HUB</text>
          </g>
        ))}

        {/* Tier 1 */}
        {facilities.map((x, i) => (
          <g key={`fac${x}`} className="facility" style={{ animationDelay: `${i * 0.35}s` }}>
            <rect x={x - 28} y="318" width="56" height="48" rx="10" className="tier-fac" />
            <path d={`M${x - 7} 342 H${x + 7} M${x} 335 V${349}`} className="cross" />
            <text x={x} y="381" textAnchor="middle" className="t-tiny">{i < 3 ? "DHQ / THQ" : "MNH / MNHC"}</text>
          </g>
        ))}

        <text x="8" y="12" className="t-tiny">TIER 3</text>
        <text x="8" y="162" className="t-tiny">TIER 2</text>
        <text x="8" y="312" className="t-tiny">TIER 1</text>
      </svg>
      <figcaption>Illustrative architecture: facilities (Tier 1), district data hubs (Tier 2) and a secure provincial core (Tier 3).</figcaption>
    </figure>
  );
}
