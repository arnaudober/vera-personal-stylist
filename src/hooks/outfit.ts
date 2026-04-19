import { useState, useEffect } from "react";
import type { Outfit } from "../models/outfit.ts";
import { getSessionId, useCloset } from "./closet.ts";
import type { ClothingItem } from "../models/clothing-item.ts";
import type { Color } from "../models/color.ts";
import { differenceCiede2000 } from "culori";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase.ts";
import { useOutfitHistory } from "./outfit-history.ts";

// Private singleton state reused through the app
let state: Outfit | null = null;
let isInitialized = false;
const listeners = new Set<(s: Outfit | null) => void>();

const COLOR_MATCH_THRESHOLD = 0.75;

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

const initialize = async (): Promise<void> => {
  if (isInitialized) {
    return;
  }

  try {
    const sessionId = getSessionId();
    const docRef = doc(db, "outfits", sessionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      state = data.outfit || null;
    } else {
      state = null;
    }
  } catch (error) {
    console.error("Error loading outfit from Firestore:", error);
    state = null;
  }

  isInitialized = true;
};
await initialize();

export const useOutfit = () => {
  // Subscribe to the singleton state
  const [outfit, setOutfit] = useState(state);
  const { items } = useCloset();
  const { getRecencyPenalty } = useOutfitHistory();

  useEffect(() => {
    const listener = (s: Outfit | null) => setOutfit(s);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const generateOutfit = async (): Promise<Outfit | null> => {
    const cleanItems = items.filter((i) => i.isClean);
    if (!cleanItems || cleanItems.length === 0) {
      return null;
    }

    const availableTops = cleanItems.filter((i) => i.category === "top");
    const availableBottoms = cleanItems.filter((i) => i.category === "bottom");
    const availableOuterwear = cleanItems.filter(
      (i) => i.category === "outerwear",
    );
    const availableShoes = cleanItems.filter((i) => i.category === "shoes");
    const availableAccessories = cleanItems.filter(
      (i) => i.category === "accessories",
    );

    if (availableTops.length === 0 || availableBottoms.length === 0) {
      return null;
    }

    const maxAttempts = cleanItems.length;
    let bestOutfit: Outfit | null = null;
    let highestScore = -1;

    // Try to find the best scoring outfit, but ensure it's different if possible
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const pivots = [...availableTops, ...availableBottoms];
      const pivot = pivots[Math.floor(Math.random() * pivots.length)];

      const currentOutfit: Outfit = {
        top:
          pivot.category === "top"
            ? pivot
            : findBestMatch({ candidates: availableTops, anchor: pivot }),
        bottom:
          pivot.category === "bottom"
            ? pivot
            : findBestMatch({ candidates: availableBottoms, anchor: pivot }),
      };

      // If we have an existing outfit, skip this candidate if it's the exact same duo
      if (
        outfit &&
        currentOutfit.top.id === outfit.top.id &&
        currentOutfit.bottom.id === outfit.bottom.id
      ) {
        continue;
      }

      // Add optional layers based on threshold
      const optionalCategories: {
        key: keyof Outfit;
        candidates: ClothingItem[];
      }[] = [
        { key: "outerwear", candidates: availableOuterwear },
        { key: "shoes", candidates: availableShoes },
        { key: "accessories", candidates: availableAccessories },
      ];

      for (const { key, candidates } of optionalCategories) {
        if (candidates.length > 0) {
          const bestMatch = findBestMatch({ candidates, anchor: pivot });
          const matchScore = scoreColors({
            a: pivot.color,
            b: bestMatch.color,
          });
          if (matchScore !== null && matchScore >= COLOR_MATCH_THRESHOLD) {
            currentOutfit[key] = bestMatch;
          }
        }
      }

      // Calculate average score of all items in outfit relative to pivot
      const itemsInOutfit = [
        currentOutfit.top,
        currentOutfit.bottom,
        currentOutfit.outerwear,
        currentOutfit.shoes,
        currentOutfit.accessories,
      ].filter(Boolean) as ClothingItem[];

      let totalScore = 0;
      let scoreCount = 0;

      for (const item of itemsInOutfit) {
        if (item.id !== pivot.id) {
          const s = scoreColors({ a: pivot.color, b: item.color });
          if (s !== null) {
            totalScore += s;
            scoreCount++;
          }
        }
      }

      const avgScore = scoreCount > 0 ? totalScore / scoreCount : 0;
      const itemIds = itemsInOutfit.map((i) => i.id);
      const recencyPenalty = getRecencyPenalty(itemIds);
      const adjustedScore = avgScore * recencyPenalty;

      if (adjustedScore > highestScore) {
        highestScore = adjustedScore;
        bestOutfit = currentOutfit;
      }
    }

    const finalOutfit = bestOutfit ?? state;
    await emitChange(finalOutfit);
    return finalOutfit;
  };

  const clearOutfit = async (): Promise<void> => await emitChange(null);

  const canGenerateOutfit = (): boolean => {
    const cleanItems = items.filter((i) => i.isClean);
    const availableTops = cleanItems.filter((i) => i.category === "top");
    const availableBottoms = cleanItems.filter((i) => i.category === "bottom");

    if (availableTops.length === 0 || availableBottoms.length === 0) {
      return false;
    }
    if (!outfit) {
      // If there is no current outfit yet, regenerating/generating is possible.
      return true;
    }

    // Only if there is another available outfit.
    return availableTops.some((topItem) =>
      availableBottoms.some(
        (bottomItem) =>
          topItem.id !== outfit.top.id || bottomItem.id !== outfit.bottom.id,
      ),
    );
  };

  async function emitChange(newOutfit: Outfit | null): Promise<void> {
    const sessionId = getSessionId();
    const docRef = doc(db, "outfits", sessionId);

    // Save to Firestore, removing undefined properties
    const outfitToSave = newOutfit
      ? JSON.parse(JSON.stringify(newOutfit))
      : null;

    await setDoc(docRef, {
      outfit: outfitToSave,
      sessionId: sessionId,
      updatedAt: new Date(),
    });

    // Update local state
    listeners.forEach((listener) => listener(newOutfit));
    state = newOutfit;
  }

  return { outfit, generateOutfit, clearOutfit, canGenerateOutfit };
};
