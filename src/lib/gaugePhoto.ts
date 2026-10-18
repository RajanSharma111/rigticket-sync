// ============================================================================
// Generates a realistic simulated tank-gauge / meter readout photo card
// as an SVG data-url with an embedded timestamp + watermark.
// ============================================================================
export function makeGaugePhoto(opts: {
  tankNo: string;
  topGauge: string;
  bottomGauge: string;
  bbls: number;
}): string {
  const ts = new Date().toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='640' height='420'>
    <defs>
      <linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0' stop-color='#1e3a5f'/>
        <stop offset='0.5' stop-color='#c2743b'/>
        <stop offset='1' stop-color='#5b3a1e'/>
      </linearGradient>
    </defs>
    <rect width='640' height='420' fill='url(#sky)'/>
    <!-- ground -->
    <rect y='300' width='640' height='120' fill='#3d2a17'/>
    <!-- tank battery -->
    <g>
      <ellipse cx='210' cy='300' rx='120' ry='22' fill='#2a3340'/>
      <rect x='90' y='120' width='240' height='180' rx='10' fill='#3a4552' stroke='#1c2430' stroke-width='4'/>
      <rect x='90' y='120' width='240' height='24' rx='8' fill='#4a5765'/>
      <rect x='110' y='150' width='200' height='8' fill='#2a333f'/>
      <rect x='110' y='180' width='200' height='8' fill='#2a333f'/>
      <rect x='110' y='210' width='200' height='8' fill='#2a333f'/>
      <rect x='110' y='240' width='200' height='8' fill='#2a333f'/>
      <!-- gauge hatch / thief hatch -->
      <circle cx='300' cy='110' r='16' fill='#c9ced6' stroke='#1c2430' stroke-width='3'/>
      <!-- fluid level marker -->
      <rect x='90' y='200' width='240' height='100' fill='#1f6feb' opacity='0.35'/>
      <line x1='90' y1='200' x2='330' y2='200' stroke='#ffdd55' stroke-width='3' stroke-dasharray='8 6'/>
    </g>
    <!-- vacuum truck silhouette -->
    <g transform='translate(400,210)'>
      <rect x='0' y='30' width='150' height='52' rx='18' fill='#9aa6b3'/>
      <rect x='150' y='24' width='52' height='58' rx='6' fill='#6b7684'/>
      <rect x='160' y='34' width='28' height='22' rx='3' fill='#2a333f'/>
      <circle cx='40' cy='92' r='18' fill='#111'/>
      <circle cx='120' cy='92' r='18' fill='#111'/>
      <circle cx='180' cy='92' r='18' fill='#111'/>
    </g>
    <!-- readout panel -->
    <g>
      <rect x='18' y='18' width='300' height='96' rx='10' fill='#000' opacity='0.72'/>
      <text x='34' y='46' fill='#34d399' font-family='monospace' font-size='18' font-weight='700'>GAUGE READOUT — VERIFIED</text>
      <text x='34' y='72' fill='#e2e8f0' font-family='monospace' font-size='15'>${esc(opts.tankNo)}</text>
      <text x='34' y='96' fill='#fbbf24' font-family='monospace' font-size='15'>TOP ${esc(opts.topGauge)}  BOT ${esc(opts.bottomGauge)}  NET ${opts.bbls} BBL</text>
    </g>
    <!-- timestamp -->
    <rect x='18' y='384' width='420' height='24' rx='5' fill='#000' opacity='0.72'/>
    <text x='28' y='401' fill='#e2e8f0' font-family='monospace' font-size='13'>&#128247; ${esc(ts)}  |  GPS-LOCKED  |  DEVICE-VERIFIED</text>
    <!-- watermark -->
    <text x='620' y='60' text-anchor='end' fill='#ffffff' opacity='0.55' font-family='monospace' font-size='15' font-weight='700'>RIGTICKET SYNC</text>
    <text x='620' y='400' text-anchor='end' fill='#ffffff' opacity='0.4' font-family='monospace' font-size='11'>TAMPER-EVIDENT CAPTURE</text>
  </svg>`.replace(/\n\s*/g, ' ');
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
