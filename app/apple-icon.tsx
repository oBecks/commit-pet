import { ImageResponse } from "next/og";

// Same fox-head mark as icon.tsx, scaled up on a filled square — iOS applies
// its own rounding, but a transparent background (fine for a browser-tab
// favicon) would otherwise show as a hard-edged cutout on the home screen.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFF3E0",
        }}
      >
        <svg
          width="150"
          height="150"
          viewBox="-40 -58 80 80"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M -29 -26 L -37 -54 L -12 -35 Z"
            fill="#FB923C"
            stroke="#C2560B"
            strokeWidth="1.5"
          />
          <path d="M -30 -43 L -34 -54 L -24 -45 Z" fill="#1F2937" />
          <path d="M -28 -32 L -31 -45 L -18 -36 Z" fill="#FFD9B8" />
          <path
            d="M 29 -26 L 37 -54 L 12 -35 Z"
            fill="#FB923C"
            stroke="#C2560B"
            strokeWidth="1.5"
          />
          <path d="M 30 -43 L 34 -54 L 24 -45 Z" fill="#1F2937" />
          <path d="M 28 -32 L 31 -45 L 18 -36 Z" fill="#FFD9B8" />
          <circle cx="0" cy="-10" r="31" fill="#FB923C" stroke="#C2560B" strokeWidth="2" />
          <ellipse cx="0" cy="9" rx="16" ry="12" fill="#FFF3E0" />
          <path d="M -3.5 5 L 3.5 5 L 0 9.5 Z" fill="#1F2937" />
          <circle cx="-12" cy="-9" r="9" fill="#fff" />
          <circle cx="12" cy="-9" r="9" fill="#fff" />
          <circle cx="-12" cy="-9" r="5.6" fill="#111827" />
          <circle cx="12" cy="-9" r="5.6" fill="#111827" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
