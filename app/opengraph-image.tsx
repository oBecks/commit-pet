import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Commit Pet — a pet that lives off your commits.";

// Same fox-head mark as icon.tsx/apple-icon.tsx, reused at hero size.
function FoxMark() {
  return (
    <svg
      width="260"
      height="260"
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
  );
}

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 64,
          background: "#F6EEDF",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 320,
            height: 320,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 32,
            background: "#FFFBF5",
            border: "3px solid #E8D9BE",
          }}
        >
          <FoxMark />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              color: "#2B2115",
            }}
          >
            Commit Pet
          </div>
          <div style={{ fontSize: 32, color: "#57534E" }}>
            A pet that lives off your commits.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
