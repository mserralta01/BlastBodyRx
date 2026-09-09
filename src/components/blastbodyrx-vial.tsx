type BlastBodyRxVialProps = {
  name: string;
  strength: string;
  className?: string;
  priority?: boolean;
};

export function BlastBodyRxVial({ name, strength, className }: BlastBodyRxVialProps) {
  const title = `${name} ${strength} BlastBodyRx research vial`;
  const productFontSize = name.length > 12 ? 43 : name.length > 8 ? 50 : 58;

  return (
    <svg className={className} viewBox="0 0 1024 1536" role="img" aria-label={title}>
      <image href="/assets/products/blastbodyrx-vial-base.png" width="1024" height="1536" preserveAspectRatio="xMidYMid meet" />
      <g fontFamily="Arial, Helvetica, sans-serif" textAnchor="middle">
        <g transform="translate(420 755)">
          <path d="M0 0h54c48 0 76 18 76 54 0 21-11 37-33 47 29 8 44 27 44 55 0 42-31 64-88 64H0V0Zm47 38v48h15c17 0 26-8 26-24 0-16-9-24-27-24H47Zm0 84v60h19c21 0 31-10 31-30 0-20-11-30-32-30H47Z" fill="#111712" />
          <path d="M140 0h54c48 0 76 18 76 54 0 21-11 37-33 47 29 8 44 27 44 55 0 42-31 64-88 64h-53V0Zm47 38v48h15c17 0 26-8 26-24 0-16-9-24-27-24h-14Zm0 84v60h19c21 0 31-10 31-30 0-20-11-30-32-30h-18Z" fill="#078c9a" />
          <path d="M276 25h48l-25 54h39l-79 116 20-78h-39Z" fill="#87d92f" />
        </g>
        <text x="512" y="1020" fill="#111712" fontWeight="900" fontSize="57" letterSpacing="-2">BlastBody<tspan fill="#078c9a">Rx</tspan></text>
        <path d="M326 1055h372" stroke="#87d92f" strokeWidth="7" strokeLinecap="round" />
        <text x="512" y="1130" fill="#111712" fontWeight="900" fontSize={productFontSize}>{name.toUpperCase()}</text>
        <text x="512" y="1202" fill="#078c9a" fontWeight="900" fontSize="57">{strength.toUpperCase()}</text>
        <text x="512" y="1260" fill="#2d382f" fontWeight="800" fontSize="25" letterSpacing="5">RESEARCH USE ONLY</text>
      </g>
    </svg>
  );
}
