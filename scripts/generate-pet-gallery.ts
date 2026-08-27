import fs from "node:fs";
import path from "node:path";
import { petArtwork } from "../lib/pets/render";
import type { Stage } from "../lib/pets/growth";
import type { Mood } from "../lib/pets/mood";

// Regenerates the static "what does my pet look like" gallery embedded in
// the README. Run with `pnpm dlx tsx scripts/generate-pet-gallery.ts`
// whenever lib/pets/render.ts's art changes.

const STAGES: Stage[] = ["egg", "hatchling", "juvenile", "adult"];
const MOODS: Mood[] = ["healthy", "tired", "sick"];

const outDir = path.join(__dirname, "..", "docs", "pet-gallery");
fs.mkdirSync(outDir, { recursive: true });

for (const stage of STAGES) {
  for (const mood of MOODS) {
    const { viewBox, defs, body } = petArtwork(stage, mood, `${stage}-${mood}`);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="180" height="228" role="img">
<title>commit-pet (${stage}, ${mood})</title>
<defs>${defs}</defs>
${body}
</svg>`;
    fs.writeFileSync(path.join(outDir, `${stage}-${mood}.svg`), svg);
  }
}

console.log(`Wrote ${STAGES.length * MOODS.length} SVGs to ${outDir}`);
