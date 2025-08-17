import type { Outfit } from "../model";

interface OutfitItem {
    key: string;
    emoji: string;
}

interface ItemPosition {
    left: string;
    top: string;
    rotate: string;
    scale: number;
}

interface OutfitLayout {
    centerEmoji: string;
    centerPosition: { x: number; y: number };
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
    return (h >>> 0);
}

function mulberry32(a: number) {
    return () => {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export default function calculateOutfitLayout(outfit: Outfit): OutfitLayout {
    const centerEmoji = outfit.top?.emoji ?? "👚";
    const others: OutfitItem[] = [
        ...(outfit.outerwear ? [{ key: "outerwear", emoji: outfit.outerwear.emoji ?? "🧥" }] : []),
        ...(outfit.bottom ? [{ key: "bottom", emoji: outfit.bottom.emoji ?? "👖" }] : []),
        ...(outfit.footwear ? [{ key: "footwear", emoji: outfit.footwear.emoji ?? "👟" }] : []),
    ];

    // Seed for stable randomness across renders for the same outfit
    const seedStr = [
        outfit.top?.id ?? "",
        outfit.bottom?.id ?? "",
        outfit.footwear?.id ?? "",
        outfit.outerwear?.id ?? "",
    ].join("|");

    const rng = mulberry32(hashSeed(seedStr));

    // Choose angles around a ring and lightly jitter them
    const baseAngles = [20, 110, 200, 290, 340, 60];
    for (let i = baseAngles.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [baseAngles[i], baseAngles[j]] = [baseAngles[j], baseAngles[i]];
    }

    const radiusPercent = 36; // distance from center - balanced for good spread with safe margins
    const rawPositions = others.map((_, idx) => {
        const angle = baseAngles[idx % baseAngles.length] + Math.floor(rng() * 25 - 12);
        const rad = (angle * Math.PI) / 180;
        const x = 50 + radiusPercent * Math.cos(rad);
        const y = 50 + radiusPercent * Math.sin(rad);
        const rot = Math.floor(rng() * 16 - 8);
        const scale = 0.85 + rng() * 0.3; // slightly more size variance
        return { x, y, rotate: `rotate(${rot}deg)`, scale };
    });

    // Calculate centroid of all items (center emoji + surrounding items)
    const allItems = [{ x: 50, y: 50, scale: 1 }, ...rawPositions];
    const centroidX = allItems.reduce((sum, item) => sum + item.x * item.scale, 0) / allItems.reduce((sum, item) => sum + item.scale, 0);
    const centroidY = allItems.reduce((sum, item) => sum + item.y * item.scale, 0) / allItems.reduce((sum, item) => sum + item.scale, 0);

    // Calculate offset to center the group
    const offsetX = 50 - centroidX;
    const offsetY = 50 - centroidY;

    // Apply centering offset to all positions
    const centerPosition = { x: 50 + offsetX, y: 50 + offsetY };
    const positions = rawPositions.map(pos => ({
        left: `${pos.x + offsetX}%`,
        top: `${pos.y + offsetY}%`,
        rotate: pos.rotate,
        scale: pos.scale
    }));

    return {
        centerEmoji,
        centerPosition,
        others,
        positions
    };
}
