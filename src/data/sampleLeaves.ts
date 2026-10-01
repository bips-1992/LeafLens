export interface SampleLeaf {
  id: string;
  name: string;
  species: string;
  tag: string;
  accent: string;
  dataUrl: string;
}

// Generate an SVG data URI for crisp sample leaf images
function makeSampleSvg(options: {
  bg: string;
  bladeColor: string;
  veinColor: string;
  patternType: 'interveinal_mg' | 'edge_scorch_k' | 'pale_n' | 'iron_fe' | 'healthy';
}): string {
  const { bg, bladeColor, veinColor, patternType } = options;

  let patternMarkup = '';
  if (patternType === 'interveinal_mg') {
    // Interveinal yellowing with prominent dark green veins
    patternMarkup = `
      <defs>
        <radialGradient id="mgGrad" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="#facc15" stop-opacity="0.9" />
          <stop offset="60%" stop-color="#fef08a" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#84cc16" stop-opacity="0.3" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="140" fill="url(#mgGrad)" />
      <circle cx="312" cy="250" r="120" fill="url(#mgGrad)" />
      <circle cx="180" cy="320" r="110" fill="url(#mgGrad)" />
    `;
  } else if (patternType === 'edge_scorch_k') {
    // Crispy brown necrotic edges around leaf border
    patternMarkup = `
      <path d="M 256 60 C 140 120 85 240 100 350 C 115 440 210 470 256 480 C 302 470 397 440 412 350 C 427 240 372 120 256 60 Z" 
            fill="none" stroke="#78350f" stroke-width="28" stroke-linejoin="round" opacity="0.9" />
      <path d="M 256 60 C 140 120 85 240 100 350 C 115 440 210 470 256 480 C 302 470 397 440 412 350 C 427 240 372 120 256 60 Z" 
            fill="none" stroke="#eab308" stroke-width="14" opacity="0.85" />
    `;
  } else if (patternType === 'pale_n') {
    // Uniform bleached pale yellow-green fading on bottom
    patternMarkup = `
      <defs>
        <linearGradient id="nGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#a3e635" stop-opacity="0.3" />
          <stop offset="60%" stop-color="#fef08a" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#fef9c3" stop-opacity="0.9" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="512" height="512" fill="url(#nGrad)" />
    `;
  } else if (patternType === 'iron_fe') {
    // Extremely pale ivory/lemon blade with razor-sharp dark green network of veins
    patternMarkup = `
      <rect x="0" y="0" width="512" height="512" fill="#fef08a" opacity="0.8" />
    `;
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Natural garden background -->
  <rect width="512" height="512" fill="${bg}" />
  <circle cx="90" cy="100" r="180" fill="#042f2e" opacity="0.3" />
  <circle cx="450" cy="420" r="220" fill="#064e3b" opacity="0.3" />

  <!-- Base Leaf Blade -->
  <g id="leafGroup">
    <path d="M 256 50 C 130 110 80 230 95 350 C 110 445 210 470 256 480 C 302 470 402 445 417 350 C 432 230 382 110 256 50 Z" 
          fill="${bladeColor}" />

    <!-- Symptom Overlay -->
    ${patternMarkup}

    <!-- Main central stem & vein -->
    <path d="M 256 50 Q 256 260 256 485" stroke="${veinColor}" stroke-width="14" stroke-linecap="round" />

    <!-- Lateral veins -->
    <path d="M 256 140 Q 180 160 135 195" stroke="${veinColor}" stroke-width="8" stroke-linecap="round" />
    <path d="M 256 160 Q 330 180 375 215" stroke="${veinColor}" stroke-width="8" stroke-linecap="round" />
    <path d="M 256 225 Q 165 255 120 300" stroke="${veinColor}" stroke-width="9" stroke-linecap="round" />
    <path d="M 256 250 Q 345 280 390 325" stroke="${veinColor}" stroke-width="9" stroke-linecap="round" />
    <path d="M 256 320 Q 170 360 135 405" stroke="${veinColor}" stroke-width="7" stroke-linecap="round" />
    <path d="M 256 345 Q 340 385 375 425" stroke="${veinColor}" stroke-width="7" stroke-linecap="round" />

    <!-- Sub-veins for fine texture -->
    <path d="M 180 160 Q 150 140 130 130" stroke="${veinColor}" stroke-width="4" stroke-linecap="round" opacity="0.8" />
    <path d="M 330 180 Q 360 160 380 150" stroke="${veinColor}" stroke-width="4" stroke-linecap="round" opacity="0.8" />
    <path d="M 165 255 Q 135 235 115 220" stroke="${veinColor}" stroke-width="4" stroke-linecap="round" opacity="0.8" />
    <path d="M 345 280 Q 375 260 395 245" stroke="${veinColor}" stroke-width="4" stroke-linecap="round" opacity="0.8" />
  </g>
</svg>
  `.trim();

  const encoded =
    typeof btoa !== 'undefined'
      ? btoa(unescape(encodeURIComponent(svg)))
      : Buffer.from(svg, 'utf-8').toString('base64');

  return `data:image/svg+xml;base64,${encoded}`;
}

export const SAMPLE_LEAVES: SampleLeaf[] = [
  {
    id: 'sample-mg',
    name: 'Tomato (Solanum lycopersicum)',
    species: 'Solanum lycopersicum',
    tag: 'Magnesium Deficiency',
    accent: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    dataUrl: makeSampleSvg({
      bg: '#0f172a',
      bladeColor: '#65a30d',
      veinColor: '#14532d',
      patternType: 'interveinal_mg',
    }),
  },
  {
    id: 'sample-k',
    name: 'Bell Pepper (Capsicum annuum)',
    species: 'Capsicum annuum',
    tag: 'Potassium Deficiency',
    accent: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
    dataUrl: makeSampleSvg({
      bg: '#1c1917',
      bladeColor: '#4d7c0f',
      veinColor: '#166534',
      patternType: 'edge_scorch_k',
    }),
  },
  {
    id: 'sample-n',
    name: 'Meyer Lemon (Citrus × meyeri)',
    species: 'Citrus × meyeri',
    tag: 'Nitrogen Deficiency',
    accent: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
    dataUrl: makeSampleSvg({
      bg: '#022c22',
      bladeColor: '#eab308',
      veinColor: '#84cc16',
      patternType: 'pale_n',
    }),
  },
  {
    id: 'sample-fe',
    name: 'Garden Rose (Rosa hybrid)',
    species: 'Rosa hybrid',
    tag: 'Iron Chlorosis',
    accent: 'text-teal-400 border-teal-500/40 bg-teal-500/10',
    dataUrl: makeSampleSvg({
      bg: '#09090b',
      bladeColor: '#fef08a',
      veinColor: '#065f46',
      patternType: 'iron_fe',
    }),
  },
];
