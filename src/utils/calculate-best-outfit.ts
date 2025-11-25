import type { ClothingItem } from "../models/clothing-item.ts";
import type { Outfit } from "../models/outfit.ts";
import { differenceCiede2000 } from "culori";
import type { Color } from "../models/color.ts";

const scoreColors = ({ a, b }: { a: Color; b: Color }): number | null => {
  if (!a || !b) {
    return null;
  }

  // Simple scoring: higher score for closer colours
  const distance = differenceCiede2000()(a, b);
  if (!distance) {
    throw new Error(
      "An error occurred while calculating the outfit color score.",
    );
  }

  // Convert distance to score (0-1, where 1 is closest). Delta E of 100 is quite different, 0 is identical
  return 1 - Math.min(distance / 100, 1);
};

const findBestMatch = ({
  candidates,
  anchor,
}: {
  candidates: ClothingItem[];
  anchor: ClothingItem;
}): ClothingItem => {
  let bestItem: Partial<ClothingItem> = {};
  let bestScore = -1;

  for (const candidate of candidates) {
    const score = scoreColors({
      a: anchor.color,
      b: candidate.color,
    });

    if (score && score > bestScore) {
      bestScore = score;
      bestItem = candidate;
    }
  }

  // bestItem is now fully defined so we can cast it safely
  return bestItem as ClothingItem;
};

export const calculateBestOutfit = (items: ClothingItem[]): Outfit | null => {
  const cleanItems = items.filter((i) => i.isClean);
  if (!cleanItems || cleanItems.length === 0) {
    return null;
  }

  const availableTops = cleanItems.filter((i) => i.category === "top");
  const availableBottoms = cleanItems.filter((i) => i.category === "bottom");
  if (availableTops.length === 0 || availableBottoms.length === 0) {
    return null;
  }

  const maxAttempts = cleanItems.length;
  let bestOutfit = {} as Outfit;
  let highestScore = -1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const item = cleanItems[Math.floor(Math.random() * cleanItems.length)];
    const currentOutfit: Partial<Outfit> = {
      top: item.category === "top" ? item : undefined,
      bottom: item.category === "bottom" ? item : undefined,
    };

    if (!currentOutfit.bottom) {
      currentOutfit.bottom = findBestMatch({
        candidates: availableBottoms,
        anchor: currentOutfit.top!,
      });
    }

    if (!currentOutfit.top) {
      currentOutfit.top = findBestMatch({
        candidates: availableTops,
        anchor: currentOutfit.bottom!,
      });
    }

    const score = scoreColors({
      a: currentOutfit.top.color,
      b: currentOutfit.bottom.color,
    });

    if (score && score > highestScore) {
      highestScore = score;
      bestOutfit = currentOutfit as Outfit; // Outfit is now fully defined so we can cast it safely
    }
  }

  return bestOutfit;
};
