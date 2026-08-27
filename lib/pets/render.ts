import { stageProgress, type Stage } from "./growth";
import { moodFor, type Mood } from "./mood";

// Hand-authored fox illustration, one variant per growth stage. Colors and
// paths are fixed art assets, not derived from pet data — see docs/adr/006
// (Badge/Widget) for why this is a plain unauthenticated SVG rather than a
// generated chart.
//
// Each stage's art fills/strokes reference two shared gradients (furGrad,
// bellyGrad) rather than flat hex colors, so mood tinting (see MOOD_GRADIENTS
// below) is just swapping gradient stops instead of string-replacing hex
// values through the markup. Every stage shares the same 300x380 canvas the
// source art was authored in, headed by ears/tail/body groups and a fox head
// with eyes.

// Gradients/filters shared byte-for-byte across every stage. Kept as bare ids
// here and scoped per-instance in buildPet() below, alongside each stage's
// own local ids (tail shapes, egg body/tail clips) — mirrors how a page can
// render several pets (dashboard grid) as sibling inline <svg>s, where a
// literal duplicate id would collide across instances.
const SHARED_IDS = [
  "furGrad",
  "bellyGrad",
  "earDark",
  "softShadow",
  "groundShadow",
];

function sharedDefs(mood: Mood): string {
  const g = MOOD_GRADIENTS[mood];
  return `<linearGradient id="furGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${g.furTop}"/><stop offset="100%" stop-color="${g.furBottom}"/></linearGradient>
<linearGradient id="bellyGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${g.bellyTop}"/><stop offset="100%" stop-color="${g.bellyBottom}"/></linearGradient>
<linearGradient id="earDark" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#332A24"/><stop offset="100%" stop-color="#1A1512"/></linearGradient>
<filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#7A2D00" flood-opacity="0.3"/></filter>
<filter id="groundShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#000000" flood-opacity="0.5"/></filter>`;
}

const EGG_LOCAL_IDS = ["eggShape", "eggClip", "eggTailShape", "eggTailClip"];
const EGG_LOCAL_DEFS = `<path id="eggShape" d="M150,100 C100,100 75,170 75,235 C75,305 110,340 150,340 C190,340 225,305 225,235 C225,170 200,100 150,100 Z" />
<clipPath id="eggClip"><use href="#eggShape" /></clipPath>
<path id="eggTailShape" d="M 60 290 C 130 350, 220 310, 210 180 C 180 230, 130 250, 60 250 Z" />
<clipPath id="eggTailClip"><use href="#eggTailShape" /></clipPath>`;
const EGG = `<ellipse cx="150" cy="335" rx="55" ry="9" fill="#111115" fill-opacity="0.3" filter="url(#groundShadow)" />
<g>
<use href="#eggShape" fill="url(#furGrad)" />
<g clip-path="url(#eggClip)">
<ellipse cx="150" cy="305" rx="50" ry="65" fill="url(#bellyGrad)" />
<path d="M 90 150 L 110 110 L 130 140 Z" fill="#1A1512" opacity="0.6" />
<path d="M 210 150 L 190 110 L 170 140 Z" fill="#1A1512" opacity="0.6" />
<use href="#eggTailShape" fill="url(#furGrad)" filter="drop-shadow(0px 4px 4px rgba(122,45,0,0.4))" />
<path d="M 195 180 Q 205 185 200 195 Q 212 190 210 205 Q 220 200 225 215 L 250 215 L 250 150 L 195 150 Z" fill="url(#bellyGrad)" clip-path="url(#eggTailClip)" />
</g>
<path d="M100,135 C100,135 120,115 150,115 C130,125 110,160 100,200 C95,170 95,145 100,135 Z" fill="#FFFFFF" opacity="0.3" />
</g>`;

const HATCHLING_LOCAL_IDS = ["tailShapeBaby", "tailClipBaby"];
const HATCHLING_LOCAL_DEFS = `<path id="tailShapeBaby" d="M 165 260 C 215 295, 245 240, 195 210 C 185 220, 175 240, 165 260 Z" />
<clipPath id="tailClipBaby"><use href="#tailShapeBaby" /></clipPath>`;
const HATCHLING = `<ellipse cx="150" cy="325" rx="42" ry="7" fill="#111115" fill-opacity="0.3" filter="url(#groundShadow)" />
<g filter="url(#softShadow)">
<use href="#tailShapeBaby" fill="url(#furGrad)" />
<path d="M 175 215 Q 190 220 185 235 Q 200 225 195 245 Q 215 235 220 255 L 260 255 L 260 180 L 175 180 Z" fill="url(#bellyGrad)" clip-path="url(#tailClipBaby)" />
</g>
<g>
<path d="M 100 130 C 80 90, 95 75, 110 85 C 120 95, 125 105, 130 115 Z" fill="url(#furGrad)" />
<path d="M 105 120 C 92 100, 102 93, 110 100 Z" fill="url(#earDark)" />
<path d="M 200 130 C 220 90, 205 75, 190 85 C 180 95, 175 105, 170 115 Z" fill="url(#furGrad)" />
<path d="M 195 120 C 208 100, 198 93, 190 100 Z" fill="url(#earDark)" />
</g>
<g>
<ellipse cx="125" cy="305" rx="12" ry="16" fill="url(#furGrad)" />
<ellipse cx="175" cy="305" rx="12" ry="16" fill="url(#furGrad)" />
</g>
<g>
<circle cx="150" cy="260" r="45" fill="url(#furGrad)" />
<ellipse cx="150" cy="265" rx="28" ry="34" fill="url(#bellyGrad)" />
</g>
<g filter="url(#softShadow)">
<path d="M 118 240 C 105 260, 110 275, 122 282" fill="none" stroke="url(#furGrad)" stroke-width="14" stroke-linecap="round" />
<circle cx="122" cy="282" r="8" fill="url(#bellyGrad)" />
<path d="M 182 240 C 195 260, 190 275, 178 282" fill="none" stroke="url(#furGrad)" stroke-width="14" stroke-linecap="round" />
<circle cx="178" cy="282" r="8" fill="url(#bellyGrad)" />
</g>
<g filter="url(#softShadow)">
<circle cx="150" cy="165" r="65" fill="url(#furGrad)" />
<ellipse cx="150" cy="195" rx="26" ry="18" fill="url(#bellyGrad)" />
<path d="M 145 192 C 145 189, 155 189, 155 192 C 155 197, 152 199, 150 199 C 148 199, 145 197, 145 192 Z" fill="#1A1512" />
<g>
<ellipse cx="118" cy="165" rx="16" ry="20" fill="#FFFFFF" />
<ellipse cx="120" cy="165" rx="11" ry="14" fill="#1A1512" />
<circle cx="116" cy="159" r="4.5" fill="#FFFFFF" />
<ellipse cx="182" cy="165" rx="16" ry="20" fill="#FFFFFF" />
<ellipse cx="180" cy="165" rx="11" ry="14" fill="#1A1512" />
<circle cx="176" cy="159" r="4.5" fill="#FFFFFF" />
</g>
</g>`;

const JUVENILE_LOCAL_IDS = ["tailShapeJuv", "tailClipJuv"];
const JUVENILE_LOCAL_DEFS = `<path id="tailShapeJuv" d="M 160 250 C 220 300, 280 230, 230 150 C 215 175, 205 210, 155 215 Z" />
<clipPath id="tailClipJuv"><use href="#tailShapeJuv" /></clipPath>`;
const JUVENILE = `<ellipse cx="150" cy="330" rx="48" ry="8" fill="#111115" fill-opacity="0.3" filter="url(#groundShadow)" />
<g filter="url(#softShadow)">
<use href="#tailShapeJuv" fill="url(#furGrad)" />
<path d="M 195 140 Q 215 155 205 175 Q 230 160 225 190 Q 250 180 255 215 L 300 215 L 300 120 L 195 120 Z" fill="url(#bellyGrad)" clip-path="url(#tailClipJuv)" />
</g>
<g>
<path d="M 105 110 C 70 50, 85 30, 105 45 C 115 55, 120 70, 125 85 Z" fill="url(#furGrad)" />
<path d="M 105 95 C 85 55, 95 45, 105 52 C 112 58, 115 72, 118 85 Z" fill="url(#earDark)" />
<path d="M 195 110 C 230 50, 215 30, 195 45 C 185 55, 180 70, 175 85 Z" fill="url(#furGrad)" />
<path d="M 195 95 C 215 55, 205 45, 195 52 C 188 58, 185 72, 182 85 Z" fill="url(#earDark)" />
</g>
<g>
<ellipse cx="120" cy="308" rx="14" ry="20" fill="url(#furGrad)" />
<ellipse cx="180" cy="308" rx="14" ry="20" fill="url(#furGrad)" />
</g>
<g>
<ellipse cx="150" cy="245" rx="42" ry="65" fill="url(#furGrad)" />
<ellipse cx="150" cy="250" rx="28" ry="48" fill="url(#bellyGrad)" />
</g>
<g filter="url(#softShadow)">
<path d="M 120 200 C 105 225, 105 250, 115 270" fill="none" stroke="url(#furGrad)" stroke-width="18" stroke-linecap="round" />
<circle cx="115" cy="270" r="10" fill="url(#bellyGrad)" />
<path d="M 180 200 C 195 225, 195 250, 185 270" fill="none" stroke="url(#furGrad)" stroke-width="18" stroke-linecap="round" />
<circle cx="185" cy="270" r="10" fill="url(#bellyGrad)" />
</g>
<g filter="url(#softShadow)">
<circle cx="150" cy="135" r="55" fill="url(#furGrad)" />
<path d="M 115 152 Q 95 148 75 152" fill="none" stroke="#C44A00" stroke-width="2" stroke-linecap="round" opacity="0.6" />
<path d="M 185 152 Q 205 148 225 152" fill="none" stroke="#C44A00" stroke-width="2" stroke-linecap="round" opacity="0.6" />
<ellipse cx="150" cy="160" rx="30" ry="22" fill="url(#bellyGrad)" />
<path d="M 145 156 C 145 152, 155 152, 155 156 C 155 162, 152 164, 150 164 C 148 164, 145 162, 145 156 Z" fill="#1A1512" />
<g>
<ellipse cx="125" cy="132" rx="12" ry="15" fill="#FFFFFF" />
<ellipse cx="127" cy="132" rx="8" ry="11" fill="#1A1512" />
<circle cx="124" cy="127" r="3" fill="#FFFFFF" />
<ellipse cx="175" cy="132" rx="12" ry="15" fill="#FFFFFF" />
<ellipse cx="173" cy="132" rx="8" ry="11" fill="#1A1512" />
<circle cx="170" cy="127" r="3" fill="#FFFFFF" />
</g>
</g>`;

const ADULT_LOCAL_IDS = ["tailShapeAdult", "tailClipAdult"];
const ADULT_LOCAL_DEFS = `<path id="tailShapeAdult" d="M 175 255 C 245 285, 310 200, 260 120 C 235 150, 220 200, 165 210 Z" />
<clipPath id="tailClipAdult"><use href="#tailShapeAdult" /></clipPath>`;
const ADULT = `<ellipse cx="150" cy="335" rx="50" ry="8" fill="#111115" fill-opacity="0.3" filter="url(#groundShadow)" />
<g filter="url(#softShadow)">
<use href="#tailShapeAdult" fill="url(#furGrad)" />
<path d="M 205 120 Q 225 135 220 160 Q 245 150 245 180 Q 270 170 280 210 L 330 210 L 330 80 L 205 80 Z" fill="url(#bellyGrad)" clip-path="url(#tailClipAdult)" />
</g>
<g>
<path d="M 95 140 C 60 70, 75 35, 85 35 C 100 35, 120 70, 135 100 Z" fill="url(#furGrad)" />
<path d="M 100 120 C 75 70, 82 45, 87 45 C 95 45, 110 70, 125 90 Z" fill="url(#earDark)" />
<path d="M 205 140 C 240 70, 225 35, 215 35 C 200 35, 180 70, 165 100 Z" fill="url(#furGrad)" />
<path d="M 200 120 C 225 70, 218 45, 213 45 C 205 45, 190 70, 175 90 Z" fill="url(#earDark)" />
</g>
<g>
<ellipse cx="115" cy="295" rx="16" ry="22" fill="url(#furGrad)" />
<ellipse cx="185" cy="295" rx="16" ry="22" fill="url(#furGrad)" />
</g>
<g>
<circle cx="150" cy="230" r="62" fill="url(#furGrad)" />
<ellipse cx="150" cy="235" rx="36" ry="44" fill="url(#bellyGrad)" />
</g>
<g filter="url(#softShadow)">
<path d="M 95 195 C 80 220, 80 245, 95 260" fill="none" stroke="url(#furGrad)" stroke-width="22" stroke-linecap="round" />
<circle cx="95" cy="260" r="12" fill="url(#bellyGrad)" />
<path d="M 205 195 C 220 220, 220 245, 205 260" fill="none" stroke="url(#furGrad)" stroke-width="22" stroke-linecap="round" />
<circle cx="205" cy="260" r="12" fill="url(#bellyGrad)" />
</g>
<g filter="url(#softShadow)">
<circle cx="150" cy="115" r="62" fill="url(#furGrad)" />
<path d="M 115 136 Q 95 130 75 135" fill="none" stroke="#C44A00" stroke-width="2.5" stroke-linecap="round" opacity="0.6" />
<path d="M 115 148 Q 95 152 78 148" fill="none" stroke="#C44A00" stroke-width="2.5" stroke-linecap="round" opacity="0.6" />
<path d="M 185 136 Q 205 130 225 135" fill="none" stroke="#C44A00" stroke-width="2.5" stroke-linecap="round" opacity="0.6" />
<path d="M 185 148 Q 205 152 222 148" fill="none" stroke="#C44A00" stroke-width="2.5" stroke-linecap="round" opacity="0.6" />
<ellipse cx="150" cy="144" rx="34" ry="26" fill="url(#bellyGrad)" />
<path d="M 144 139 C 144 135, 156 135, 156 139 C 156 146, 151 149, 150 149 C 149 149, 144 146, 144 139 Z" fill="#1A1512" />
<path d="M 150 149 L 150 152" fill="none" stroke="#1A1512" stroke-width="2" stroke-linecap="round" />
<path d="M 143 151 Q 146.5 155 150 152 Q 153.5 155 157 151" fill="none" stroke="#1A1512" stroke-width="2" stroke-linecap="round" />
<g>
<ellipse cx="123" cy="112" rx="13" ry="16" fill="#FFFFFF" />
<ellipse cx="125" cy="112" rx="9" ry="12" fill="#1A1512" />
<circle cx="122" cy="107" r="3.5" fill="#FFFFFF" />
<circle cx="128" cy="116" r="1.5" fill="#FFFFFF" />
<ellipse cx="177" cy="112" rx="13" ry="16" fill="#FFFFFF" />
<ellipse cx="175" cy="112" rx="9" ry="12" fill="#1A1512" />
<circle cx="172" cy="107" r="3.5" fill="#FFFFFF" />
<circle cx="178" cy="116" r="1.5" fill="#FFFFFF" />
</g>
</g>`;

// Every stage was authored on the same 300x380 canvas.
const VIEWBOX: Record<Stage, string> = {
  egg: "0 0 300 380",
  hatchling: "0 0 300 380",
  juvenile: "0 0 300 380",
  adult: "0 0 300 380",
};

const CONTENT: Record<Stage, string> = {
  egg: EGG,
  hatchling: HATCHLING,
  juvenile: JUVENILE,
  adult: ADULT,
};

const LOCAL_DEFS: Record<Stage, string> = {
  egg: EGG_LOCAL_DEFS,
  hatchling: HATCHLING_LOCAL_DEFS,
  juvenile: JUVENILE_LOCAL_DEFS,
  adult: ADULT_LOCAL_DEFS,
};

// ids local to one stage's art (tail shapes, egg body/tail clips) — combined
// with SHARED_IDS above to know what needs per-instance scoping.
const STAGE_LOCAL_IDS: Record<Stage, string[]> = {
  egg: EGG_LOCAL_IDS,
  hatchling: HATCHLING_LOCAL_IDS,
  juvenile: JUVENILE_LOCAL_IDS,
  adult: ADULT_LOCAL_IDS,
};

// Gradient stops per mood. furGrad/bellyGrad drive the creature's actual fur
// and belly color; earDark and the ink/outline colors used directly in the
// art (e.g. "#1A1512") intentionally stay fixed across moods.
const MOOD_GRADIENTS: Record<
  Mood,
  { furTop: string; furBottom: string; bellyTop: string; bellyBottom: string }
> = {
  healthy: {
    furTop: "#FF9333",
    furBottom: "#D85C00",
    bellyTop: "#FFFFFF",
    bellyBottom: "#FCE6CA",
  },
  tired: {
    furTop: "#C9A072",
    furBottom: "#9C6B3E",
    bellyTop: "#F5EFE4",
    bellyBottom: "#E8D6C2",
  },
  sick: {
    furTop: "#C4B454",
    furBottom: "#8FA23E",
    bellyTop: "#F0EDD6",
    bellyBottom: "#D9D3A8",
  },
};

// Eye/mouth anchor points, hand-measured from each stage's CONTENT above
// (all stages share centerX=150), so the mood overlay lines up with the
// actual art instead of guessing. eyeRx/eyeRy match the actual white-sclera
// ellipse dimensions (which fully bound the pupil and highlight dot drawn
// inside it), plus a little padding, so the tired eyelid patch below fully
// covers the eye instead of just its top. Egg has no face, so it only gets
// the gradient recolor.
const FACE: Record<
  Exclude<Stage, "egg">,
  {
    eyeXs: [number, number];
    eyeY: number;
    eyeRx: number;
    eyeRy: number;
    mouthY: number;
    mouthRx: number;
    mouthRy: number;
  }
> = {
  hatchling: {
    eyeXs: [118, 182],
    eyeY: 165,
    eyeRx: 18,
    eyeRy: 22,
    mouthY: 205,
    mouthRx: 6,
    mouthRy: 3,
  },
  juvenile: {
    eyeXs: [125, 175],
    eyeY: 132,
    eyeRx: 14,
    eyeRy: 17,
    mouthY: 172,
    mouthRx: 6,
    mouthRy: 3,
  },
  adult: {
    eyeXs: [123, 177],
    eyeY: 112,
    eyeRx: 15,
    eyeRy: 18,
    mouthY: 152,
    mouthRx: 9,
    mouthRy: 6,
  },
};

const FACE_CENTER_X = 150;

function moodOverlay(stage: Stage, mood: Mood): string {
  if (stage === "egg" || mood === "healthy") return "";
  const face = FACE[stage];

  if (mood === "tired") {
    // Closed, sleepy eyes: an ellipse fully covers the eye (sized from its
    // actual sclera bounds, so nothing peeks out at the edges), filled with
    // the same furGrad the surrounding head uses so it blends in rather than
    // sitting on top as a flat patch. A shallow downward curve on top reads
    // as a relaxed shut eyelid. buildPet() scopes this "furGrad" reference
    // to the instance alongside the rest of CONTENT.
    return face.eyeXs
      .map(
        (x) =>
          `<ellipse cx="${x}" cy="${face.eyeY}" rx="${face.eyeRx}" ry="${face.eyeRy}" fill="url(#furGrad)"/>
<path d="M ${x - face.eyeRx + 2} ${face.eyeY} Q ${x} ${face.eyeY + 5} ${x + face.eyeRx - 2} ${face.eyeY}" stroke="#1A1512" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
      )
      .join("");
  }

  // Sick: the mouth sits on the cream muzzle patch (bellyGrad), not the fur,
  // so mask it with bellyGrad too — then draw a queasy wavy mouth on top.
  const cx = FACE_CENTER_X;
  return `<ellipse cx="${cx}" cy="${face.mouthY - 1}" rx="${face.mouthRx}" ry="${face.mouthRy}" fill="url(#bellyGrad)"/>
<path d="M ${cx - face.mouthRx + 1} ${face.mouthY} Q ${cx - face.mouthRx / 2} ${face.mouthY + 4} ${cx} ${face.mouthY} Q ${cx + face.mouthRx / 2} ${face.mouthY - 4} ${cx + face.mouthRx - 1} ${face.mouthY}" stroke="#1A1512" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
}

function scopeIds(text: string, ids: string[], instanceId: string): string {
  let result = text;
  for (const id of ids) {
    result = result.replaceAll(id, `${id}-${instanceId}`);
  }
  return result;
}

function buildPet(
  stage: Stage,
  mood: Mood,
  instanceId: string,
): { viewBox: string; defs: string; body: string } {
  const ids = [...SHARED_IDS, ...STAGE_LOCAL_IDS[stage]];
  const defs = scopeIds(sharedDefs(mood) + LOCAL_DEFS[stage], ids, instanceId);
  const rawBody = CONTENT[stage] + moodOverlay(stage, mood);
  const body = scopeIds(rawBody, ids, instanceId);
  return { viewBox: VIEWBOX[stage], defs, body };
}

// Reusable across any surface that needs just the creature (Dashboard cards),
// as opposed to the full badge composition below (card frame + xp bar +
// label). instanceId scopes every def id (gradients, filters, tail/egg
// clips) so multiple pets rendered as sibling inline <svg>s on one page
// don't collide on a shared literal id (SVG ids aren't scoped per <svg> in
// the DOM) — renderPetSvg doesn't need this since it only ever renders one
// pet per response.
export function petArtwork(
  stage: Stage,
  mood: Mood,
  instanceId: string,
): { viewBox: string; defs: string; body: string } {
  return buildPet(stage, mood, instanceId);
}

// Extra viewBox space reserved below the art for the xp progress bar + label.
const BAR_AREA_HEIGHT = 46;
const BAR_HEIGHT = 12;
const BAR_INSET_X = 14;
const BAR_GAP_FROM_ART = 24;

export function renderPetSvg(
  xp: number,
  health: number,
  sick: boolean,
): string {
  const { stage, floor, ceiling } = stageProgress(xp);
  const progress =
    ceiling === null
      ? 1
      : Math.max(0, Math.min(1, (xp - floor) / (ceiling - floor)));
  const label = ceiling === null ? `${xp} XP (max)` : `${xp} / ${ceiling} XP`;
  const mood = moodFor(health, sick);

  const [x0, y0, w, artHeight] = VIEWBOX[stage].split(" ").map(Number);
  const totalHeight = artHeight + BAR_AREA_HEIGHT;
  const barX = x0 + BAR_INSET_X;
  const barWidth = w - BAR_INSET_X * 2;
  const barY = y0 + artHeight + BAR_GAP_FROM_ART;

  const height = 220;
  const width = Math.round((height * w) / totalHeight);
  const titleMood = mood === "healthy" ? "" : `, ${mood}`;

  const { defs, body } = buildPet(stage, mood, "badge");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${x0} ${y0} ${w} ${totalHeight}" role="img">
<title>commit-pet (${stage}, ${xp} xp${titleMood})</title>
<defs>${defs}</defs>
<rect x="${x0 + 2}" y="${y0 + 2}" width="${w - 4}" height="${totalHeight - 4}" rx="16" fill="#FFFBF5" stroke="#E8D9BE" stroke-width="2"/>
${body}
<rect x="${barX}" y="${barY}" width="${barWidth}" height="${BAR_HEIGHT}" rx="6" fill="#F0DEC4"/>
<rect x="${barX}" y="${barY}" width="${barWidth * progress}" height="${BAR_HEIGHT}" rx="6" fill="#FB923C"/>
<text x="${x0 + w / 2}" y="${barY - 8}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#57534E">${label}</text>
</svg>`;
}
