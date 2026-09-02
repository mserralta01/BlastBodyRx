type VirtualFitPathVialProps = {
  name: string;
  strength: string;
  className?: string;
  priority?: boolean;
};

export function VirtualFitPathVial({ name, strength, className }: VirtualFitPathVialProps) {
  const title = `${name} ${strength} VirtualFitPath research vial`;
  const productFontSize = name.length > 12 ? 17 : name.length > 8 ? 20 : 23;

  return (
    <svg className={className} viewBox="0 0 300 520" role="img" aria-label={title}>
      <defs>
        <linearGradient id={`glass-${name}-${strength}`} x1="0" x2="1">
          <stop stopColor="#dbe8f2" stopOpacity=".42" />
          <stop offset=".24" stopColor="#fff" stopOpacity=".92" />
          <stop offset=".7" stopColor="#eef8ff" stopOpacity=".55" />
          <stop offset="1" stopColor="#a6bed0" stopOpacity=".5" />
        </linearGradient>
        <linearGradient id={`cap-${name}-${strength}`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#1b2028" />
          <stop offset="1" stopColor="#020408" />
        </linearGradient>
        <filter id={`shadow-${name}-${strength}`} x="-30%" y="-20%" width="160%" height="150%">
          <feDropShadow dx="0" dy="18" stdDeviation="14" floodColor="#07182d" floodOpacity=".22" />
        </filter>
      </defs>
      <g filter={`url(#shadow-${name}-${strength})`}>
        <rect x="70" y="27" width="160" height="54" rx="13" fill={`url(#cap-${name}-${strength})`} />
        <path d="M84 70h132v29c0 8-7 15-15 15H99c-8 0-15-7-15-15V70Z" fill="#0b0e13" />
        <rect x="92" y="102" width="116" height="35" rx="10" fill={`url(#glass-${name}-${strength})`} stroke="#9fb3c2" strokeWidth="3" />
        <path d="M66 151c0-17 14-31 31-31h106c17 0 31 14 31 31l10 312c1 20-15 36-35 36H91c-20 0-36-16-35-36l10-312Z" fill={`url(#glass-${name}-${strength})`} stroke="#9fb3c2" strokeWidth="4" />
        <rect x="65" y="190" width="170" height="232" rx="8" fill="#fff" stroke="#e4e9ee" />
        <rect x="65" y="190" width="170" height="10" rx="5" fill="#1476e8" />
        <g transform="translate(99 216) scale(.42)">
          <path d="M3 8h22l31 69 26-69h23L57 111Z" fill="#070b12" />
          <path d="M44 8h74L103 29H61L52 48h42L80 68H43L26 104H3Z" fill="#1476e8" />
          <path d="M102 8h34c24 0 38 11 38 30 0 17-12 29-33 32l-24 4-13 30H79l23-51h31c10 0 16-5 16-13 0-7-6-11-16-11H93Z" fill="#070b12" />
        </g>
        <text x="150" y="280" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="18" letterSpacing="-.7">
          <tspan fill="#070b12">Virtual</tspan><tspan fill="#1476e8">Fit</tspan><tspan fill="#070b12">Path</tspan>
        </text>
        <path d="M92 294h116" stroke="#1476e8" strokeWidth="2" />
        <text x="150" y="330" textAnchor="middle" fill="#0a111c" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize={productFontSize}>{name.toUpperCase()}</text>
        <text x="150" y="365" textAnchor="middle" fill="#1476e8" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="25">{strength.toUpperCase()}</text>
        <text x="150" y="400" textAnchor="middle" fill="#2f3a48" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="10" letterSpacing="1.2">RESEARCH USE ONLY</text>
        <path d="M65 421h170v18c0 7-6 13-13 13H78c-7 0-13-6-13-13v-18Z" fill="#1476e8" />
      </g>
    </svg>
  );
}
