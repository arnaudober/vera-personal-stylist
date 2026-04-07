import { useState, useEffect } from "react";
import type { FavouriteOutfit } from "../models/favourite-outfit.ts";
import { getSessionId } from "./closet.ts";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase.ts";

// Private singleton state reused through the app
let state: FavouriteOutfit[] = [];
let isInitialized = false;
const listeners = new Set<(entries: FavouriteOutfit[]) => void>();

const initialize = async (): Promise<void> => {
  if (isInitialized) {
    return;
  }

  try {
    const sessionId = getSessionId();
    const q = query(
      collection(db, "favouriteOutfits"),
      where("sessionId", "==", sessionId),
      orderBy("savedAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    state = querySnapshot.docs.map((d) => ({
      id: d.id,
      topId: d.data().topId,
      bottomId: d.data().bottomId,
      savedAt: d.data().savedAt.toDate(),
      sessionId: d.data().sessionId,
    }));
  } catch (error) {
    console.error("Error loading favourite outfits:", error);
    state = [];
  }

  isInitialized = true;
};
await initialize();

export function useFavouriteOutfits() {
  const [favourites, setFavourites] = useState(state);

  useEffect(() => {
    const listener = (entries: FavouriteOutfit[]) => setFavourites(entries);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const isFavourite = (topId: string, bottomId: string): boolean => {
    return state.some((f) => f.topId === topId && f.bottomId === bottomId);
  };

  const addFavourite = async (
    topId: string,
    bottomId: string,
  ): Promise<void> => {
    if (isFavourite(topId, bottomId)) {
      return;
    }

    const sessionId = getSessionId();
    const entryId = `${sessionId}_${Date.now()}`;

    const newEntry: FavouriteOutfit = {
      id: entryId,
      topId,
      bottomId,
      savedAt: new Date(),
      sessionId,
    };

    await setDoc(doc(db, "favouriteOutfits", entryId), {
      topId: newEntry.topId,
      bottomId: newEntry.bottomId,
      savedAt: newEntry.savedAt,
      sessionId: newEntry.sessionId,
    });

    emitChange([newEntry, ...state]);
  };

  const removeFavourite = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "favouriteOutfits", id));
    emitChange(state.filter((f) => f.id !== id));
  };

  const removeFavouriteByOutfit = async (
    topId: string,
    bottomId: string,
  ): Promise<void> => {
    const match = state.find(
      (f) => f.topId === topId && f.bottomId === bottomId,
    );
    if (match) {
      await removeFavourite(match.id);
    }
  };

  function emitChange(newEntries: FavouriteOutfit[]): void {
    listeners.forEach((listener) => listener(newEntries));
    state = newEntries;
  }

  return {
    favourites,
    addFavourite,
    removeFavourite,
    removeFavouriteByOutfit,
    isFavourite,
  };
}
