import { stageProgress, type Stage } from "./growth";

// Hand-authored fox illustration, one variant per growth stage. Colors and
// paths are fixed art assets, not derived from pet data — see docs/adr/006
// (Badge/Widget) for why this is a plain unauthenticated SVG rather than a
// generated chart. Mood variants (health/sick) are future work.

const EGG = `<ellipse cx="0" cy="70" rx="28" ry="7" fill="#000000" fill-opacity="0.08"/>
<ellipse cx="0" cy="10" rx="38" ry="52" fill="#FFF3E0" stroke="#E8B778" stroke-width="2"/>
<circle cx="-14" cy="-10" r="3" fill="#E8B778" fill-opacity="0.6"/>
<circle cx="12" cy="6" r="2.5" fill="#E8B778" fill-opacity="0.6"/>
<circle cx="-6" cy="22" r="2" fill="#E8B778" fill-opacity="0.6"/>
<circle cx="18" cy="-22" r="2.5" fill="#E8B778" fill-opacity="0.6"/>
<circle cx="-20" cy="16" r="2" fill="#E8B778" fill-opacity="0.6"/>
<circle cx="8" cy="-32" r="2" fill="#E8B778" fill-opacity="0.6"/>
<circle cx="-10" cy="34" r="2.2" fill="#E8B778" fill-opacity="0.6"/>
<path d="M -8 -34 L -2 -24 L -10 -17 L -2 -6" stroke="#C98A3E" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

const HATCHLING = `<ellipse cx="0" cy="90" rx="30" ry="7" fill="#000000" fill-opacity="0.08"/>
<path d="M 18 56 C 38 62, 42 44, 34 30 C 30 40, 26 52, 17 50 Z" fill="#F97316"/>
<polygon points="26,24 42,24 42,38 37,36 34,42 29,36 26,40" fill="#FFF3E0" clip-path="url(#tailclipHatch)"/>
<path d="M 18 56 C 38 62, 42 44, 34 30 C 30 40, 26 52, 17 50 Z" fill="none" stroke="#C2560B" stroke-width="1.3"/>
<ellipse cx="-14" cy="70" rx="7" ry="12" fill="#F97316"/>
<ellipse cx="14" cy="70" rx="7" ry="12" fill="#F97316"/>
<ellipse cx="0" cy="42" rx="24" ry="26" fill="#FB923C" stroke="#C2560B" stroke-width="2"/>
<ellipse cx="0" cy="50" rx="13" ry="16" fill="#FFF3E0"/>
<path d="M -24 -28 L -32 -52 L -11 -35 Z" fill="#FB923C" stroke="#C2560B" stroke-width="1.5"/>
<path d="M -23 -32 L -27 -44 L -16 -35 Z" fill="#FFD9B8"/>
<path d="M 24 -28 L 32 -52 L 11 -35 Z" fill="#FB923C" stroke="#C2560B" stroke-width="1.5"/>
<path d="M 23 -32 L 27 -44 L 16 -35 Z" fill="#FFD9B8"/>
<circle cx="0" cy="-6" r="33" fill="#FB923C" stroke="#C2560B" stroke-width="2"/>
<ellipse cx="-18" cy="6" rx="5" ry="3" fill="#FCA5A5" fill-opacity="0.6"/>
<ellipse cx="18" cy="6" rx="5" ry="3" fill="#FCA5A5" fill-opacity="0.6"/>
<ellipse cx="0" cy="12" rx="14" ry="10" fill="#FFF3E0"/>
<path d="M -3 8 L 3 8 L 0 12 Z" fill="#1F2937"/>
<circle cx="-12" cy="-8" r="9" fill="#fff"/>
<circle cx="12" cy="-8" r="9" fill="#fff"/>
<circle cx="-12" cy="-8" r="5.5" fill="#111827"/>
<circle cx="12" cy="-8" r="5.5" fill="#111827"/>
<circle cx="-14" cy="-9.5" r="1.8" fill="#fff"/>
<circle cx="10" cy="-9.5" r="1.8" fill="#fff"/>`;

const JUVENILE = `<ellipse cx="0" cy="90" rx="34" ry="7" fill="#000000" fill-opacity="0.08"/>
<path d="M 22 52 C 46 58, 50 34, 40 18 C 34 28, 28 42, 19 44 Z" fill="#F97316"/>
<polygon points="34,14 52,14 52,28 47,26 44,32 39,26 34,30" fill="#FFF3E0" clip-path="url(#tailclipJuv)"/>
<path d="M 22 52 C 46 58, 50 34, 40 18 C 34 28, 28 42, 19 44 Z" fill="none" stroke="#C2560B" stroke-width="1.5"/>
<ellipse cx="-14" cy="70" rx="8" ry="13" fill="#EA711C" stroke="#C2560B" stroke-width="1.5"/>
<ellipse cx="14" cy="70" rx="8" ry="13" fill="#EA711C" stroke="#C2560B" stroke-width="1.5"/>
<ellipse cx="0" cy="38" rx="30" ry="28" fill="#FB923C" stroke="#C2560B" stroke-width="2"/>
<ellipse cx="0" cy="45" rx="16" ry="18" fill="#FFF3E0"/>
<path d="M -21 22 C -29 28, -29 34, -23 38" fill="none" stroke="#C2560B" stroke-width="15" stroke-linecap="round"/>
<path d="M -21 22 C -29 28, -29 34, -23 38" fill="none" stroke="#FB923C" stroke-width="11" stroke-linecap="round"/>
<circle cx="-23" cy="39" r="6" fill="#FFF3E0" stroke="#C2560B" stroke-width="2"/>
<path d="M 21 22 C 29 28, 29 34, 23 38" fill="none" stroke="#C2560B" stroke-width="15" stroke-linecap="round"/>
<path d="M 21 22 C 29 28, 29 34, 23 38" fill="none" stroke="#FB923C" stroke-width="11" stroke-linecap="round"/>
<circle cx="23" cy="39" r="6" fill="#FFF3E0" stroke="#C2560B" stroke-width="2"/>
<path d="M -26 -24 L -33 -50 L -10 -32 Z" fill="#FB923C" stroke="#C2560B" stroke-width="1.5"/>
<path d="M -27 -40 L -30 -50 L -22 -42 Z" fill="#1F2937"/>
<path d="M -25 -30 L -28 -42 L -17 -33 Z" fill="#FFD9B8"/>
<path d="M 26 -24 L 33 -50 L 10 -32 Z" fill="#FB923C" stroke="#C2560B" stroke-width="1.5"/>
<path d="M 27 -40 L 30 -50 L 22 -42 Z" fill="#1F2937"/>
<path d="M 25 -30 L 28 -42 L 17 -33 Z" fill="#FFD9B8"/>
<circle cx="0" cy="-8" r="29" fill="#FB923C" stroke="#C2560B" stroke-width="2"/>
<ellipse cx="0" cy="10" rx="15" ry="11" fill="#FFF3E0"/>
<path d="M -3 6 L 3 6 L 0 10 Z" fill="#1F2937"/>
<line x1="-15" y1="7" x2="-30" y2="4" stroke="#C2560B" stroke-width="1"/>
<line x1="-15" y1="10" x2="-30" y2="10" stroke="#C2560B" stroke-width="1"/>
<line x1="15" y1="7" x2="30" y2="4" stroke="#C2560B" stroke-width="1"/>
<line x1="15" y1="10" x2="30" y2="10" stroke="#C2560B" stroke-width="1"/>
<circle cx="-11" cy="-8" r="7.5" fill="#fff"/>
<circle cx="11" cy="-8" r="7.5" fill="#fff"/>
<circle cx="-11" cy="-8" r="4.6" fill="#111827"/>
<circle cx="11" cy="-8" r="4.6" fill="#111827"/>
<circle cx="-13" cy="-9.5" r="1.5" fill="#fff"/>
<circle cx="9" cy="-9.5" r="1.5" fill="#fff"/>`;

const ADULT = `<ellipse cx="0" cy="95" rx="38" ry="8" fill="#000000" fill-opacity="0.08"/>
<g transform="rotate(15 20 50)">
<path d="M 24 58 C 48 64, 46 -4, 32 -20 C 18 -36, 10 10, 16 42 Z" fill="#F97316"/>
<polygon points="14,-30 50,-30 50,-8 43,-12 38,-4 31,-12 24,-4 17,-10" fill="#FFF3E0" clip-path="url(#tailclipAdult)"/>
<path d="M 24 58 C 48 64, 46 -4, 32 -20 C 18 -36, 10 10, 16 42 Z" fill="none" stroke="#C2560B" stroke-width="2"/>
</g>
<ellipse cx="-18" cy="78" rx="9" ry="15" fill="#EA711C" stroke="#C2560B" stroke-width="1.5"/>
<ellipse cx="18" cy="78" rx="9" ry="15" fill="#EA711C" stroke="#C2560B" stroke-width="1.5"/>
<ellipse cx="0" cy="42" rx="34" ry="30" fill="#FB923C" stroke="#C2560B" stroke-width="2"/>
<ellipse cx="0" cy="48" rx="18" ry="20" fill="#FFF3E0"/>
<path d="M -25 22 C -34 28, -34 38, -28 44" fill="none" stroke="#C2560B" stroke-width="18" stroke-linecap="round"/>
<path d="M -25 22 C -34 28, -34 38, -28 44" fill="none" stroke="#FB923C" stroke-width="13" stroke-linecap="round"/>
<circle cx="-28" cy="45" r="8" fill="#FFF3E0" stroke="#C2560B" stroke-width="2"/>
<path d="M 25 22 C 34 28, 34 38, 28 44" fill="none" stroke="#C2560B" stroke-width="18" stroke-linecap="round"/>
<path d="M 25 22 C 34 28, 34 38, 28 44" fill="none" stroke="#FB923C" stroke-width="13" stroke-linecap="round"/>
<circle cx="28" cy="45" r="8" fill="#FFF3E0" stroke="#C2560B" stroke-width="2"/>
<path d="M -29 -26 L -37 -54 L -12 -35 Z" fill="#FB923C" stroke="#C2560B" stroke-width="1.5"/>
<path d="M -30 -43 L -34 -54 L -24 -45 Z" fill="#1F2937"/>
<path d="M -28 -32 L -31 -45 L -18 -36 Z" fill="#FFD9B8"/>
<path d="M 29 -26 L 37 -54 L 12 -35 Z" fill="#FB923C" stroke="#C2560B" stroke-width="1.5"/>
<path d="M 30 -43 L 34 -54 L 24 -45 Z" fill="#1F2937"/>
<path d="M 28 -32 L 31 -45 L 18 -36 Z" fill="#FFD9B8"/>
<circle cx="0" cy="-10" r="31" fill="#FB923C" stroke="#C2560B" stroke-width="2"/>
<ellipse cx="0" cy="9" rx="16" ry="12" fill="#FFF3E0"/>
<path d="M -3.5 5 L 3.5 5 L 0 9.5 Z" fill="#1F2937"/>
<path d="M -5 11.5 Q -1 12.5 1.5 11 Q 3.5 9.5 5 7" stroke="#1F2937" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<circle cx="-12" cy="-9" r="9" fill="#fff"/>
<circle cx="12" cy="-9" r="9" fill="#fff"/>
<circle cx="-12" cy="-9" r="5.6" fill="#111827"/>
<circle cx="12" cy="-9" r="5.6" fill="#111827"/>
<circle cx="-14" cy="-10.5" r="1.7" fill="#fff"/>
<circle cx="10" cy="-10.5" r="1.7" fill="#fff"/>`;

// Generous hand-measured bounds per stage (local origin at each creature's
// own center) — padded rather than pixel-tight, since a little extra margin
// around the art is harmless but clipping isn't.
const VIEWBOX: Record<Stage, string> = {
  egg: "-46 -50 92 135",
  hatchling: "-40 -58 80 163",
  juvenile: "-45 -60 115 170",
  adult: "-46 -62 125 175",
};

const CONTENT: Record<Stage, string> = {
  egg: EGG,
  hatchling: HATCHLING,
  juvenile: JUVENILE,
  adult: ADULT,
};

// Clip paths for the bushy tail tips (hatchling/juvenile/adult only) — see
// the tail outline paths above, which double as their own clip shapes.
const TAIL_CLIPS = `<clipPath id="tailclipHatch"><path d="M 18 56 C 38 62, 42 44, 34 30 C 30 40, 26 52, 17 50 Z"/></clipPath>
<clipPath id="tailclipJuv"><path d="M 22 52 C 46 58, 50 34, 40 18 C 34 28, 28 42, 19 44 Z"/></clipPath>
<clipPath id="tailclipAdult"><path d="M 24 58 C 48 64, 46 -4, 32 -20 C 18 -36, 10 10, 16 42 Z"/></clipPath>`;

// Extra viewBox space reserved below the art for the xp progress bar + label.
const BAR_AREA_HEIGHT = 46;
const BAR_HEIGHT = 12;
const BAR_INSET_X = 14;
const BAR_GAP_FROM_ART = 24;

export function renderPetSvg(xp: number): string {
  const { stage, floor, ceiling } = stageProgress(xp);
  const progress = ceiling === null ? 1 : Math.max(0, Math.min(1, (xp - floor) / (ceiling - floor)));
  const label = ceiling === null ? `${xp} XP (max)` : `${xp} / ${ceiling} XP`;

  const [x0, y0, w, artHeight] = VIEWBOX[stage].split(" ").map(Number);
  const totalHeight = artHeight + BAR_AREA_HEIGHT;
  const barX = x0 + BAR_INSET_X;
  const barWidth = w - BAR_INSET_X * 2;
  const barY = y0 + artHeight + BAR_GAP_FROM_ART;

  const height = 220;
  const width = Math.round((height * w) / totalHeight);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${x0} ${y0} ${w} ${totalHeight}" role="img">
<title>commit-pet (${stage}, ${xp} xp)</title>
<defs>${TAIL_CLIPS}</defs>
<rect x="${x0 + 2}" y="${y0 + 2}" width="${w - 4}" height="${totalHeight - 4}" rx="16" fill="#FFFBF5" stroke="#E8D9BE" stroke-width="2"/>
${CONTENT[stage]}
<rect x="${barX}" y="${barY}" width="${barWidth}" height="${BAR_HEIGHT}" rx="6" fill="#F0DEC4"/>
<rect x="${barX}" y="${barY}" width="${barWidth * progress}" height="${BAR_HEIGHT}" rx="6" fill="#FB923C"/>
<text x="${x0 + w / 2}" y="${barY - 8}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#57534E">${label}</text>
</svg>`;
}
