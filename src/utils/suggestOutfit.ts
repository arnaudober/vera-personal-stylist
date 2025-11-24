import {prepareColor, scoreOutfitColor} from "./colorScore.ts";
import type { ClothingItem } from "../models/clothing-item.ts";
import type { Outfit } from "../models/outfit.ts";

export function suggestOutfit(items: ClothingItem[]): Outfit | null {
    const cleanItems = items.filter(i => i.isClean);
    if (cleanItems.length === 0) return null;

    // helper: convert ClothingItem -> colorScore.Item
    const toColorItem = (ci: ClothingItem) => ({
        id: ci.id, color: prepareColor(ci.color)
    });

    const byCategory = {
        top: cleanItems.filter(i => i.category === 'top'), bottom: cleanItems.filter(i => i.category === 'bottom'),
    } as const;

    if (byCategory.bottom.length === 0 && byCategory.top.length === 0) return null;

    // Try a few random seeds to find a possible high-score outfit
    const attempts = Math.min(8, cleanItems.length);
    let best: { outfit: Outfit; score: number } | null = null;

    for (let k = 0; k < attempts; k++) {
        const seed = cleanItems[Math.floor(Math.random() * cleanItems.length)];
        const current: Outfit = {};
        const chosen: ClothingItem[] = [seed];

        // Determine the path to complete outfit based on categories
        let needTop = seed.category === 'bottom';

        // Place seed in the correct slot
        if (seed.category === 'top') current.top = seed;
        if (seed.category === 'bottom') current.bottom = seed;

        // Ensure we have a bottom (since it affects whether we need a top)
        if (!current.bottom) {
            if (byCategory.bottom.length === 0) continue;
            let bestBottom: ClothingItem | null = null;
            let bestScore = -1;
            for (const candidate of byCategory.bottom) {
                const set = [...chosen, candidate].map(toColorItem);
                const s = scoreOutfitColor(set);
                if (s > bestScore) {
                    bestScore = s;
                    bestBottom = candidate;
                }
            }
            if (!bestBottom) continue;
            current.bottom = bestBottom;
            chosen.push(bestBottom);
        }

        // Now decide the `needTop`, according to bottom type, if not set
        if (seed.category !== 'bottom') {
            needTop = true;
        }

        // Ensure top if needed
        if (needTop && !current.top) {
            if (byCategory.top.length === 0) continue;
            let bestTop: ClothingItem | null = null;
            let bestScore = -1;
            for (const candidate of byCategory.top) {
                const set = [...chosen, candidate].map(toColorItem);
                const s = scoreOutfitColor(set);
                if (s > bestScore) {
                    bestScore = s;
                    bestTop = candidate;
                }
            }
            if (!bestTop) continue;
            current.top = bestTop;
            chosen.push(bestTop);
        }

        // Validate minimums
        if (!current.top && current.bottom) {
            continue;
        }

        const finalScore = scoreOutfitColor(chosen.map(toColorItem));
        if (!best || finalScore > best.score) {
            best = {outfit: current, score: finalScore};
        }
    }

    return best ? best.outfit : null;
}