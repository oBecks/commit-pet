// Same fox-head mark as app/icon.tsx and app/apple-icon.tsx (ADULT head from
// lib/pets/render.ts) — the one shared brand mark reused wherever the app
// needs a small logo (Nav, sign-in/sign-up).
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="60 16 180 180" className={className} aria-hidden="true">
      <path
        d="M 95 140 C 60 70, 75 35, 85 35 C 100 35, 120 70, 135 100 Z"
        fill="#FF9333"
      />
      <path
        d="M 100 120 C 75 70, 82 45, 87 45 C 95 45, 110 70, 125 90 Z"
        fill="#1A1512"
      />
      <path
        d="M 205 140 C 240 70, 225 35, 215 35 C 200 35, 180 70, 165 100 Z"
        fill="#FF9333"
      />
      <path
        d="M 200 120 C 225 70, 218 45, 213 45 C 205 45, 190 70, 175 90 Z"
        fill="#1A1512"
      />
      <circle cx="150" cy="115" r="62" fill="#FF9333" />
      <ellipse cx="150" cy="144" rx="34" ry="26" fill="#FCE6CA" />
      <path
        d="M 144 139 C 144 135, 156 135, 156 139 C 156 146, 151 149, 150 149 C 149 149, 144 146, 144 139 Z"
        fill="#1A1512"
      />
      <ellipse cx="123" cy="112" rx="13" ry="16" fill="#FFFFFF" />
      <ellipse cx="125" cy="112" rx="9" ry="12" fill="#1A1512" />
      <circle cx="122" cy="107" r="3.5" fill="#FFFFFF" />
      <ellipse cx="177" cy="112" rx="13" ry="16" fill="#FFFFFF" />
      <ellipse cx="175" cy="112" rx="9" ry="12" fill="#1A1512" />
      <circle cx="172" cy="107" r="3.5" fill="#FFFFFF" />
    </svg>
  );
}
