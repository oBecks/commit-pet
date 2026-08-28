// Display-only trim of the "owner/repo" fullName down to just "repo" — used
// wherever the surrounding UI (a card, a page heading) already makes the
// context clear. GitHub links still need the owner, so they read fullName
// directly instead of this.
//
// Deliberately its own file with zero imports (not folded into
// dashboard-data.ts, which pulls in the db client) so any component —
// server or client — can use it without dragging in a database dependency.
export function repoShortName(fullName: string): string {
  return fullName.split("/").pop() ?? fullName;
}
