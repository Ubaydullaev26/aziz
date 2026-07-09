import { NextResponse } from "next/server";

// Deterministic gradient "photo" placeholders, generated locally so the demo
// never depends on an external image CDN. Swap `coverImage`/`avatar` values
// for real photography via the admin panel — nothing else has to change.

function hashSeed(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const PALETTES: [string, string][] = [
  ["#0EA5A4", "#0B7285"],
  ["#F97316", "#DC2626"],
  ["#6366F1", "#4338CA"],
  ["#EC4899", "#A21CAF"],
  ["#14B8A6", "#0369A1"],
  ["#F59E0B", "#B45309"],
  ["#0284C7", "#1E3A8A"],
  ["#A855F7", "#6B21A8"],
];

function monogram(seed: string) {
  const words = seed.replace(/[-_]/g, " ").trim().split(/\s+/);
  const letters = words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return letters || "A";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ seed: string }> },
) {
  const { seed } = await params;
  const { searchParams } = new URL(request.url);
  const w = Math.min(Number(searchParams.get("w")) || 800, 2000);
  const h = Math.min(Number(searchParams.get("h")) || 600, 2000);

  const hash = hashSeed(seed);
  const [from, to] = PALETTES[hash % PALETTES.length]!;
  const angle = hash % 360;
  const label = monogram(seed);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="g" gradientTransform="rotate(${angle})">
        <stop offset="0%" stop-color="${from}" />
        <stop offset="100%" stop-color="${to}" />
      </linearGradient>
      <pattern id="p" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle % 45})">
        <circle cx="8" cy="8" r="1.4" fill="white" fill-opacity="0.16" />
      </pattern>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)" />
    <rect width="${w}" height="${h}" fill="url(#p)" />
    <text
      x="50%"
      y="53%"
      text-anchor="middle"
      dominant-baseline="middle"
      font-family="Georgia, 'Times New Roman', serif"
      font-size="${Math.min(w, h) * 0.32}"
      fill="white"
      fill-opacity="0.35"
      font-weight="600"
    >${label}</text>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
