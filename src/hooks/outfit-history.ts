import { useState, useEffect } from "react";
import type { OutfitHistoryEntry } from "../models/outfit-history.ts";
import { getSessionId } from "./closet.ts";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase.ts";

const HISTORY_LIMIT = 10;
const RECENCY_RECOVERY_DAYS = 14;

// Private singleton state reused through the app
let state: OutfitHistoryEntry[] = [];
let isInitialized = false;
const listeners = new Set<(entries: OutfitHistoryEntry[]) => void>();

const initialize = async (): Promise<void> => {
  if (isInitialized) {
    return;
  }

  try {
    const sessionId = getSessionId();
    const q = query(
      collection(db, "outfitHistory"),
      where("sessionId", "==", sessionId),
      orderBy("wornAt", "desc"),
      limit(HISTORY_LIMIT),
    );
    const querySnapshot = await getDocs(q);
    state = querySnapshot.docs.map((d) => ({
      id: d.id,
      topId: d.data().topId,
      bottomId: d.data().bottomId,
      outerwearId: d.data().outerwearId,
      shoesId: d.data().shoesId,
      accessoriesId: d.data().accessoriesId,
      wornAt: d.data().wornAt.toDate(),
      sessionId: d.data().sessionId,
    }));
  } catch (error) {
    console.error("Error loading outfit history:", error);
    state = [];
  }

  isInitialized = true;
};
await initialize();

export function useOutfitHistory() {
  const [history, setHistory] = useState(state);

  useEffect(() => {
    const listener = (entries: OutfitHistoryEntry[]) => setHistory(entries);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const recordOutfit = async (
    topId: string,
    bottomId: string,
    outerwearId?: string,
    shoesId?: string,
    accessoriesId?: string,
  ): Promise<void> => {
    const sessionId = getSessionId();
    const entryId = `${sessionId}_${Date.now()}`;

    const newEntry: OutfitHistoryEntry = {
      id: entryId,
      topId,
      bottomId,
      ...(outerwearId && { outerwearId }),
      ...(shoesId && { shoesId }),
      ...(accessoriesId && { accessoriesId }),
      wornAt: new Date(),
      sessionId,
    };

    await setDoc(doc(db, "outfitHistory", entryId), newEntry);

    const updated = [newEntry, ...state];

    // Prune oldest entries if over limit
    if (updated.length > HISTORY_LIMIT) {
      const toRemove = updated.splice(HISTORY_LIMIT);
      for (const entry of toRemove) {
        await deleteDoc(doc(db, "outfitHistory", entry.id));
      }
    }

    emitChange(updated);
  };

  const getRecencyPenalty = (itemIds: string[]): number => {
    const matchingEntries = state.filter((h) => {
      const entryIds = [
        h.topId,
        h.bottomId,
        h.outerwearId,
        h.shoesId,
        h.accessoriesId,
      ].filter(Boolean) as string[];

      // An entry matches if it contains ANY of the items in the current outfit
      return itemIds.some((id) => entryIds.includes(id));
    });

    if (matchingEntries.length === 0) {
      return 1.0;
    }

    // Find the most recent match among all matching entries
    const mostRecentMatch = matchingEntries[0]; // State is sorted by wornAt desc

    const daysSince =
      (Date.now() - mostRecentMatch.wornAt.getTime()) / (1000 * 60 * 60 * 24);
    return Math.min(1, daysSince / RECENCY_RECOVERY_DAYS);
  };

  const clearHistory = async (): Promise<void> => {
    const batch = writeBatch(db);
    for (const entry of state) {
      batch.delete(doc(db, "outfitHistory", entry.id));
    }
    await batch.commit();
    emitChange([]);
  };

  function emitChange(newEntries: OutfitHistoryEntry[]): void {
    listeners.forEach((listener) => listener(newEntries));
    state = newEntries;
  }

  return { history, recordOutfit, getRecencyPenalty, clearHistory };
}
