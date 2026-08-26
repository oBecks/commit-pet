import { NextResponse } from "next/server";
import { getPetByRepoId, getRepoById } from "@/lib/pets/service";
import { renderPetSvg } from "@/lib/pets/render";

// Public, unauthenticated by design (docs/adr/006-presentation-surfaces.md).
// A private repo's badge must not confirm the repo's existence or state, so
// it gets the same 404 as an unknown repo id rather than a distinct response
// (see the "Private repo badges" open question in docs/open-questions.md).
export async function GET(_req: Request, { params }: { params: Promise<{ repoId: string }> }) {
  const { repoId: repoIdParam } = await params;
  const repoId = Number(repoIdParam);
  if (!Number.isInteger(repoId)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const repo = await getRepoById(repoId);
  if (!repo || repo.isPrivate) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const pet = await getPetByRepoId(repoId);
  if (!pet) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const svg = renderPetSvg(pet.xp);
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-cache",
    },
  });
}
