// Reskins Clerk's default widgets (SignIn/SignUp/UserProfile) to the
// dashboard's warm cream/orange palette (app/globals.css --color-dash-*)
// instead of Clerk's stock indigo, so the auth flow doesn't look like a
// bolted-on third-party form. Left untyped (no explicit Appearance
// annotation) since @clerk/types isn't a direct/hoisted dependency here to
// import from — TS still checks this against SignIn/SignUp's `appearance`
// prop structurally wherever it's passed in.
export const clerkAppearance = {
  // Tailwind v4 emits utilities into a native CSS @layer, so without help
  // Clerk's own (unlayered) injected styles win the cascade regardless of
  // specificity. cssLayerName moves Clerk's styles into a named layer, but
  // Tailwind/Turbopack's compiled layer order for that name isn't
  // reliably positioned before `utilities` in this stack — verified by
  // inspecting the compiled stylesheet's @layer order in the browser, the
  // "clerk" layer still lands after "utilities". `!`-important on the
  // `elements` overrides below is what actually guarantees they win.
  cssLayerName: "clerk",
  variables: {
    colorPrimary: "#FB923C",
    colorBackground: "#FFFBF5",
    colorText: "#2B2115",
    colorTextSecondary: "#8A7F6E",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#2B2115",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
  },
  elements: {
    card: "!shadow-none !border !border-dash-border",
    formButtonPrimary:
      "!bg-dash-accent hover:!bg-[#C2560B] !text-white !shadow-none",
    socialButtonsBlockButton:
      "!border-dash-border hover:!bg-dash-bg !text-dash-heading",
    footerActionLink: "!text-dash-accent hover:!text-[#C2560B]",
    formFieldInput: "!border-dash-border",
  },
};
