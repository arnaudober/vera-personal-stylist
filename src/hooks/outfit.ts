import { useState, useEffect } from "react";
import type { Outfit } from "../models/outfit.ts";
import { useCloset } from "./closet.ts";
import type { Color } from "../models/color.ts";
import { differenceCiede2000 } from "culori";

const OUTFIT_LOCAL_STORAGE_KEY = "outfit";

// Private singleton state reused through the app
let state: Outfit | null = null;
let isInitialized = false;
const listeners = new Set<(s: Outfit | null) => void>();

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

const isSameOutfit = (a: Outfit | null, b: Outfit | null): boolean => {
  if (!a || !b) {
    return false;
  }

  return a.top.id === b.top.id && a.bottom.id === b.bottom.id;
};

const initialize = () => {
  if (isInitialized) {
    return;
  }

  try {
    const raw = localStorage.getItem(OUTFIT_LOCAL_STORAGE_KEY);
    if (raw) {
      state = JSON.parse(raw) as Outfit | null;
    } else {
      state = null;
    }
  } catch {
    state = null;
  }

  isInitialized = true;
};
initialize();

export const useOutfit = () => {
  // Subscribe to the singleton state
  const [outfit, setOutfit] = useState(state);
  const { items } = useCloset();

  useEffect(() => {
    const listener = (s: Outfit | null) => setOutfit(s);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const generateOutfit = (): Outfit | null => {
    const cleanItems = items.filter((i) => i.isClean);
    if (!cleanItems || cleanItems.length === 0) {
      return null;
    }

    const availableTops = cleanItems.filter((i) => i.category === "top");
    const availableBottoms = cleanItems.filter((i) => i.category === "bottom");
    if (availableTops.length === 0 || availableBottoms.length === 0) {
      return null;
    }

    // Prefer the best-scoring outfit among all valid combinations,
    // but never return the exact same (top+bottom) as the current one.
    let bestOutfit: Outfit | null = null;
    let highestScore = -1;

    for (const top of availableTops) {
      for (const bottom of availableBottoms) {
        const candidate: Outfit = { top, bottom };
        if (isSameOutfit(candidate, outfit)) {
          continue;
        }

        const score = scoreColors({ a: top.color, b: bottom.color });
        if (score && score > highestScore) {
          highestScore = score;
          bestOutfit = candidate;
        }
      }
    }

    // If there is no alternative outfit, don't change the current one.
    if (!bestOutfit) {
      return null;
    }

    emitChange(bestOutfit);
    return bestOutfit;
  };

  const clearOutfit = (): void => emitChange(null);

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

  function emitChange(newOutfit: Outfit | null): void {
    listeners.forEach((listener) => listener(newOutfit));
    localStorage.setItem(OUTFIT_LOCAL_STORAGE_KEY, JSON.stringify(newOutfit));
    state = newOutfit;
  }

  return { outfit, generateOutfit, clearOutfit, canGenerateOutfit };
};
