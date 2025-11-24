// TODO: Refactor this as well. All utils seem interconnected, and used only in specific pages. 

export type PreparedColor = {
  L: number;
  a: number;
  b: number; // Lab (float)
  h: number;
  s: number;
  v: number; // HSV (0..360, 0..1, 0..1)
};
export type Item = { id: string; color: PreparedColor };
export type ColorSet = Item[];

export function prepareColor(hex: string): PreparedColor {
  const { r, g, b } = hexToRgb(hex);
  const { L, a, b: bLab } = rgbToLab(r, g, b);
  const { h, s, v } = rgbToHsv(r, g, b);
  return {
    L,
    a,
    b: bLab,
    h,
    s,
    v,
  };
}

// Find the two items with the closest colors
export function findClosestColorPair(
  items: ColorSet,
): { item1: Item; item2: Item; distance: number } | null {
  if (items.length < 2) return null;

  let closestPair: { item1: Item; item2: Item; distance: number } | null = null;
  let minDistance = Infinity;

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const distance = colorDistance(items[i].color, items[j].color);
      if (distance < minDistance) {
        minDistance = distance;
        closestPair = {
          item1: items[i],
          item2: items[j],
          distance,
        };
      }
    }
  }

  return closestPair;
}

// Calculate color distance using Delta E 2000 (perceptually uniform)
function colorDistance(color1: PreparedColor, color2: PreparedColor): number {
  return deltaE2000_Lab(
    color1.L,
    color1.a,
    color1.b,
    color2.L,
    color2.a,
    color2.b,
  );
}

export function scoreOutfitColor(outfit: ColorSet): number {
  if (!outfit || outfit.length < 2) return 0.5;

  // Simple scoring: higher score for closer colors
  const closestPair = findClosestColorPair(outfit);
  if (!closestPair) return 0.5;

  // Convert distance to score (0-1, where 1 is closest)
  // Delta E of 100 is quite different, 0 is identical
  const normalizedDistance = Math.min(closestPair.distance / 100, 1);
  return 1 - normalizedDistance;
}

function deltaE2000_Lab(
  L1: number,
  a1: number,
  b1: number,
  L2: number,
  a2: number,
  b2: number,
): number {
  const kL = 1,
    kC = 1,
    kH = 1;
  const avgL = (L1 + L2) / 2;
  const C1 = Math.hypot(a1, b1),
    C2 = Math.hypot(a2, b2);
  const avgC = (C1 + C2) / 2;
  const avgC7 = Math.pow(avgC, 7);
  const G = 0.5 * (1 - Math.sqrt(avgC7 / (avgC7 + Math.pow(25, 7))));
  const a1p = (1 + G) * a1,
    a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1),
    C2p = Math.hypot(a2p, b2);
  const avgCp = (C1p + C2p) / 2;

  const h1p = angleDeg(Math.atan2(b1, a1p));
  const h2p = angleDeg(Math.atan2(b2, a2p));
  let dhp = h2p - h1p;
  if (dhp > 180) dhp -= 360;
  if (dhp < -180) dhp += 360;

  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(toRad(dhp / 2));

  const avgHp =
    Math.abs(h1p - h2p) > 180 ? (h1p + h2p + 360) / 2 : (h1p + h2p) / 2;
  const T =
    1 -
    0.17 * Math.cos(toRad(avgHp - 30)) +
    0.24 * Math.cos(toRad(2 * avgHp)) +
    0.32 * Math.cos(toRad(3 * avgHp + 6)) -
    0.2 * Math.cos(toRad(4 * avgHp - 63));

  const dRo = 30 * Math.exp(-Math.pow((avgHp - 275) / 25, 2));
  const Rc =
    2 * Math.sqrt(Math.pow(avgCp, 7) / (Math.pow(avgCp, 7) + Math.pow(25, 7)));
  const Sl =
    1 +
    (0.015 * Math.pow(avgL - 50, 2)) / Math.sqrt(20 + Math.pow(avgL - 50, 2));
  const Sc = 1 + 0.045 * avgCp;
  const Sh = 1 + 0.015 * avgCp * T;
  const Rt = -Math.sin(toRad(2 * dRo)) * Rc;

  return Math.sqrt(
    Math.pow(dLp / (kL * Sl), 2) +
      Math.pow(dCp / (kC * Sc), 2) +
      Math.pow(dHp / (kH * Sh), 2) +
      Rt * (dCp / (kC * Sc)) * (dHp / (kH * Sh)),
  );
}

const toRad = (d: number) => (d * Math.PI) / 180;
const angleDeg = (r: number) => {
  const d = (r * 180) / Math.PI;
  return d < 0 ? d + 360 : d;
};

// rgb/hsv/lab converters
function hexToRgb(input: string) {
  const s = (input || "").trim();

  // Remove '#' if present
  const raw = s.replace("#", "");

  // Handle both 3-digit (#rgb) and 6-digit (#rrggbb) hex
  const hex =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;

  // Parse hex to number
  const num = parseInt(hex, 16);

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHsv(r255: number, g255: number, b255: number) {
  const r = r255 / 255,
    g = g255 / 255,
    b = b255 / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min;
  let h = 0;
  if (d) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

function rgbToLab(r255: number, g255: number, b255: number) {
  let r = r255 / 255,
    g = g255 / 255,
    b = b255 / 255;
  r = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  g = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  b = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  let X = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  let Y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  let Z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;
  const Xr = 0.95047,
    Yr = 1.0,
    Zr = 1.08883;
  X /= Xr;
  Y /= Yr;
  Z /= Zr;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(X),
    fy = f(Y),
    fz = f(Z);
  const L = 116 * fy - 16,
    a = 500 * (fx - fy),
    bl = 200 * (fy - fz);
  return { L, a, b: bl };
}
