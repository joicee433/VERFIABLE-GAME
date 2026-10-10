export function Seal({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={`seal-in ${className}`} role="img" aria-label="One play every 7 days">
      <defs>
        <path id="ring" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" />
      </defs>
      <circle cx="100" cy="100" r="96" fill="#ff5a36" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="#0f1430" strokeWidth="2" strokeDasharray="2 5" strokeLinecap="round" />
      <circle cx="100" cy="100" r="52" fill="none" stroke="#0f1430" strokeWidth="2" />
      <text fontFamily="var(--font-display)" fontWeight="700" fontSize="15" fill="#0f1430" letterSpacing="1.2">
        <textPath href="#ring" startOffset="0">proof checked on-chain, one play every week, </textPath>
      </text>
      <text x="100" y="116" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="800" fontSize="58" fill="#0f1430">7</text>
      <text x="100" y="136" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="600" fontSize="14" fill="#0f1430">days</text>
    </svg>
  );
}
