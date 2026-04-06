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
  ): Promise<void> => {
    const sessionId = getSessionId();
    const entryId = `${sessionId}_${Date.now()}`;

    const newEntry: OutfitHistoryEntry = {
      id: entryId,
      topId,
      bottomId,
      wornAt: new Date(),
      sessionId,
    };

    await setDoc(doc(db, "outfitHistory", entryId), {
      topId: newEntry.topId,
      bottomId: newEntry.bottomId,
      wornAt: newEntry.wornAt,
      sessionId: newEntry.sessionId,
    });

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

  const getRecencyPenalty = (topId: string, bottomId: string): number => {
    const match = state.find(
      (h) => h.topId === topId && h.bottomId === bottomId,
    );
    if (!match) {
      return 1.0;
    }

    const daysSince =
      (Date.now() - match.wornAt.getTime()) / (1000 * 60 * 60 * 24);
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
