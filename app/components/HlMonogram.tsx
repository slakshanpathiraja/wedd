import React from "react";

export type HlMonogramFont = "great-vibes" | "pinyon" | "garamond";

interface HlMonogramProps {
  size?: number | string;
  className?: string;
  showRings?: boolean;
  font?: HlMonogramFont;
  idPrefix?: string;
}

export default function HlMonogram({
  size = 84,
  className = "",
  showRings = true,
  font = "great-vibes",
  idPrefix = "hl",
}: HlMonogramProps) {
  const gradId = `${idPrefix}-gold`;
  const shadowId = `${idPrefix}-shadow`;

  // Font family definitions mapping to app layout css variables
  const fontFamilies: Record<HlMonogramFont, string> = {
    "great-vibes": "var(--font-great-vibes), 'Great Vibes', 'Alex Brush', cursive",
    "pinyon": "var(--font-pinyon), 'Pinyon Script', cursive",
    "garamond": "var(--font-garamond), 'Cormorant Garamond', Georgia, serif",
  };

  const selectedFont = fontFamilies[font] || fontFamilies["great-vibes"];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`select-none overflow-visible ${className}`}
      aria-label="Hansani and Lakshan Monogram"
    >
      <defs>
        <linearGradient id={gradId} x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#F9E8CA" />
          <stop offset="30%" stopColor="#D9B45B" />
          <stop offset="65%" stopColor="#B4914F" />
          <stop offset="100%" stopColor="#7E5C1B" />
        </linearGradient>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2.5"
            floodColor="#5A3E09"
            floodOpacity="0.28"
          />
        </filter>
      </defs>

      {/* Optional Outer Fine Royal Rings & Cardinal Accents */}
      {showRings && (
        <g>
          {/* Subtle Outer Dashed Halo */}
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.4"
          />
          {/* Primary Solid Gold Ring */}
          <circle
            cx="100"
            cy="100"
            r="86"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="1.5"
            opacity="0.8"
          />
          {/* Inner Delicate Inset Ring */}
          <circle
            cx="100"
            cy="100"
            r="81"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="0.7"
            opacity="0.35"
          />

          {/* Compass / Diamond Cardinal Points */}
          <polygon
            points="100,16 102.5,22 100,28 97.5,22"
            fill={`url(#${gradId})`}
          />
          <polygon
            points="100,172 102.5,178 100,184 97.5,178"
            fill={`url(#${gradId})`}
          />
          <circle
            cx="18"
            cy="100"
            r="2"
            fill={`url(#${gradId})`}
            opacity="0.6"
          />
          <circle
            cx="182"
            cy="100"
            r="2"
            fill={`url(#${gradId})`}
            opacity="0.6"
          />
        </g>
      )}

      {/* Center Connected Calligraphic Monogram Mark (No &) */}
      <g filter={`url(#${shadowId})`}>
        {font === "great-vibes" ? (
          <>
            {/* H Letter */}
            <text
              x="80"
              y="124"
              textAnchor="middle"
              fill={`url(#${gradId})`}
              style={{
                fontFamily: selectedFont,
                fontSize: "76px",
                fontWeight: 400,
              }}
            >
              H
            </text>

            {/* L Letter - Tightly nested & intertwined */}
            <text
              x="122"
              y="126"
              textAnchor="middle"
              fill={`url(#${gradId})`}
              style={{
                fontFamily: selectedFont,
                fontSize: "76px",
                fontWeight: 400,
              }}
            >
              L
            </text>

            {/* Connecting Ribbon flourish seamlessly binding H and L together */}
            <path
              d="M 92 104 C 102 98, 112 98, 120 106"
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            {/* Delicate baseline accent cradling the letters */}
            <path
              d="M 68 136 C 88 144, 116 144, 136 136"
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth="1.2"
              strokeDasharray="18 4"
              opacity="0.6"
            />
          </>
        ) : font === "pinyon" ? (
          <>
            {/* Pinyon Script High Slant Luxury */}
            <text
              x="76"
              y="128"
              textAnchor="middle"
              fill={`url(#${gradId})`}
              style={{
                fontFamily: selectedFont,
                fontSize: "82px",
                fontWeight: 400,
              }}
            >
              H
            </text>
            <text
              x="124"
              y="130"
              textAnchor="middle"
              fill={`url(#${gradId})`}
              style={{
                fontFamily: selectedFont,
                fontSize: "82px",
                fontWeight: 400,
              }}
            >
              L
            </text>
            <path
              d="M 88 108 C 98 102, 110 102, 118 108"
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            {/* Cormorant Garamond Italic Luxury Serif */}
            <text
              x="78"
              y="126"
              textAnchor="middle"
              fill={`url(#${gradId})`}
              style={{
                fontFamily: selectedFont,
                fontSize: "72px",
                fontStyle: "italic",
                fontWeight: 600,
              }}
            >
              H
            </text>
            <text
              x="122"
              y="126"
              textAnchor="middle"
              fill={`url(#${gradId})`}
              style={{
                fontFamily: selectedFont,
                fontSize: "72px",
                fontStyle: "italic",
                fontWeight: 600,
              }}
            >
              L
            </text>
            <path
              d="M 88 102 L 112 102"
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </>
        )}
      </g>
    </svg>
  );
}
