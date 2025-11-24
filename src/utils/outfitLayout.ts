import type { Outfit } from "../models/outfit.ts";

// TODO: Refactor this. It looks very complicated so we could probably simplify it somehow.
//  Then move to `suggest.tsx` as private functions with clear logic.

interface OutfitItem {
  key: string;
}

interface ItemPosition {
  left: string;
  top: string;
  rotate: string;
  scale: number;
  zIndex: number;
}

interface OutfitLayout {
  centerPosition: { x: number; y: number };
  centerScale: number;
  centerZIndex: number;
  others: OutfitItem[];
  positions: ItemPosition[];
}

// Deterministic PRNG helpers
function hashSeed(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function calculateOutfitLayout(outfit: Outfit): OutfitLayout {
  const others: OutfitItem[] = [...(outfit.bottom ? [{ key: "bottom" }] : [])];

  const seedStr = [outfit.top?.id ?? "", outfit.bottom?.id ?? ""].join("|");
  const rng = mulberry32(hashSeed(seedStr));

  // ---- center sizing
  const centerScale = 1.18 + rng() * 0.22; // 1.18–1.40
  const centerZIndex = 10;

  // ---- ring + spacing
  const n = others.length;
  // start farther out; we’ll contract if needed
  const baseRadius = n <= 1 ? 36 : n === 2 ? 40 : n === 3 ? 38 : 34;
  const minDisc = 14; // base Poisson-disc distance in "percent"
  const safeMinX = 10,
    safeMaxX = 90,
    safeMinY = 10,
    safeMaxY = 90;

  // evenly spaced angles with tiny jitter (prevents perfect symmetry)
  const step = n ? 360 / n : 0;
  const baseAngles = Array.from({ length: n }, (_, i) => {
    const jitter = (rng() - 0.5) * 12; // ±6°
    return i * step + jitter;
  });

  type Node = {
    x: number;
    y: number;
    scale: number;
    zIndex: number;
    rot: string;
    rVis: number;
  };

  // initial positions on a ring, deterministic per item but with scale variety
  const nodes: Node[] = baseAngles.map((deg) => {
    const rad = (deg * Math.PI) / 180;
    // tri‑modal scale
    const v = rng();
    const scale =
      v < 0.25
        ? 0.68 + rng() * 0.12
        : v < 0.7
          ? 0.82 + rng() * 0.16
          : 1.02 + rng() * 0.2;

    // visual radius ~ footprint (affects spacing)
    const rVis = 5.5 * scale; // tune: bigger => stronger repulsion
    const x = 50 + baseRadius * Math.cos(rad);
    const y = 50 + baseRadius * Math.sin(rad);
    const rot = `rotate(${Math.floor(rng() * 14 - 7)}deg)`;
    const zIndex = Math.round(scale * 6);
    return { x, y, scale, zIndex, rot, rVis };
  });

  // ---- expand ring until coarse Poisson distance satisfied
  const minRequired = (a: Node, b: Node) => minDisc + 1.1 * (a.rVis + b.rVis); // bigger items need more space

  function minPairwise(nodes: Node[]) {
    let m = Infinity;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const distance = Math.sqrt(
          (nodes[j].x - nodes[i].x) ** 2 + (nodes[j].y - nodes[i].y) ** 2,
        );
        m = Math.min(m, distance / minRequired(nodes[i], nodes[j]));
      }
    }
    return m; // <1 means collisions
  }

  // expand outward if too packed
  if (nodes.length >= 2) {
    let expand = 1.0;
    let attempts = 0;
    while (minPairwise(nodes) < 1 && attempts < 12) {
      expand *= 1.08;
      for (const node of nodes) {
        const ang = Math.atan2(node.y - 50, node.x - 50);
        node.x = 50 + Math.cos(ang) * baseRadius * expand;
        node.y = 50 + Math.sin(ang) * baseRadius * expand;
      }
      attempts++;
    }
  }

  // ---- force relaxation: inverse‑square repulsion + gentle radial spring
  {
    const ITER = 28;
    for (let it = 0; it < ITER; it++) {
      // pairwise repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i],
            b = nodes[j];
          const dx = b.x - a.x,
            dy = b.y - a.y;
          let d = Math.hypot(dx, dy);
          if (d < 0.0001) d = 0.0001;
          const req = minRequired(a, b);
          if (d < req) {
            const push = (req - d) * 0.55; // strength
            const ux = dx / d,
              uy = dy / d;
            a.x -= ux * push;
            a.y -= uy * push;
            b.x += ux * push;
            b.y += uy * push;
          } else {
            // small falloff to keep them airy
            const pull = Math.min((d - req) * 0.02, 0.4);
            const ux = dx / d,
              uy = dy / d;
            a.x += ux * pull;
            a.y += uy * pull;
            b.x -= ux * pull;
            b.y -= uy * pull;
          }
        }
      }
      // radial spring (keeps a ring-ish shape, spreads toward edges)
      for (const n of nodes) {
        const ang = Math.atan2(n.y - 50, n.x - 50);
        const targetR = baseRadius * 1.2; // a bit larger than start
        const r = Math.hypot(n.x - 50, n.y - 50);
        const delta = (targetR - r) * 0.12;
        n.x += Math.cos(ang) * delta;
        n.y += Math.sin(ang) * delta;
      }
    }
  }

  let minX = 50 - 8 * centerScale,
    maxX = 50 + 8 * centerScale;
  let minY = 50 - 8 * centerScale,
    maxY = 50 + 8 * centerScale;
  for (const p of nodes) {
    minX = Math.min(minX, p.x - 6 * p.scale);
    maxX = Math.max(maxX, p.x + 6 * p.scale);
    minY = Math.min(minY, p.y - 6 * p.scale);
    maxY = Math.max(maxY, p.y + 6 * p.scale);
  }
  const scaleX = (safeMaxX - safeMinX) / (maxX - minX);
  const scaleY = (safeMaxY - safeMinY) / (maxY - minY);
  // We *expand* if there’s extra room to avoid crowding
  const fitScale = Math.min(Math.max(0.9, Math.min(scaleX, scaleY)), 1.25);

  const cx = (minX + maxX) / 2,
    cy = (minY + maxY) / 2;
  const offX = 50 - cx,
    offY = 50 - cy;

  const centerPosition = { x: 50 + offX * fitScale, y: 50 + offY * fitScale };

  const positions = nodes.map((n) => ({
    left: `${n.x + offX * fitScale}%`,
    top: `${n.y + offY * fitScale}%`,
    rotate: n.rot,
    scale: n.scale * fitScale,
    zIndex: n.zIndex,
  }));

  return {
    centerPosition,
    centerScale: centerScale * fitScale,
    centerZIndex,
    others,
    positions,
  };
}
