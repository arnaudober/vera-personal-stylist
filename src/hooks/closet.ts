import { useState, useEffect } from "react";
import {
  type ClothingItem,
  type CreateClothingItem,
} from "../models/clothing-item";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase.ts";

export const SESSION_ID_KEY = "closet_session_id";
const ITEMS_UPLOAD_LIMIT = 10;

export const getSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

// Private singleton state reused through the app
let state: ClothingItem[] = [];
let isInitialized = false;
const listeners = new Set<(items: ClothingItem[]) => void>();

const initialize = async () => {
  if (isInitialized) {
    return;
  }

  try {
    const sessionId = getSessionId();
    // Query only items belonging to the current session
    const q = query(
      collection(db, "clothingItems"),
      where("sessionId", "==", sessionId),
    );
    const querySnapshot = await getDocs(q);
    state = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as ClothingItem,
    );
  } catch (error) {
    console.error("Error loading clothing items:", error);
    state = [];
  }

  isInitialized = true;
};
await initialize();

export function useCloset() {
  // We "subscribe" to the singleton state
  const [items, setItems] = useState(state);

  useEffect(() => {
    const listener = (newItems: ClothingItem[]) => setItems(newItems);
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const addClothingItem = async (
    item: CreateClothingItem,
  ): Promise<ClothingItem> => {
    const sessionId = getSessionId();
    const newItem: ClothingItem = {
      id: `${sessionId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: item.name,
      category: item.category,
      color: item.color,
      isClean: true,
    };

    await setDoc(doc(db, "clothingItems", newItem.id), {
      name: newItem.name,
      category: newItem.category,
      color: newItem.color,
      isClean: newItem.isClean,
      sessionId: sessionId, // Add session ID to isolate data
    });

    emitChange([newItem, ...state]);

    return newItem;
  };
  const removeClothingItem = async (id: string): Promise<string> => {
    await deleteDoc(doc(db, "clothingItems", id));
    emitChange(state.filter((i) => i.id !== id));
    return id;
  };
  const markLaundryDone = async (): Promise<void> => {
    const batch = writeBatch(db);
    const dirtyItems = state.filter((item) => !item.isClean);

    dirtyItems.forEach((item) => {
      const itemRef = doc(db, "clothingItems", item.id);
      batch.update(itemRef, { isClean: true });
    });

    await batch.commit();
    emitChange(state.map((i) => ({ ...i, isClean: true })));
  };
  const markWorn = async (item: ClothingItem): Promise<ClothingItem> => {
    const itemRef = doc(db, "clothingItems", item.id);
    await updateDoc(itemRef, { isClean: false });

    emitChange(
      state.map((i) => (item.id === i.id ? { ...i, isClean: false } : i)),
    );

    return { ...item, isClean: false };
  };
  const isItemClean = (id: string): boolean => {
    return state.find((i) => i.id === id)?.isClean ?? false;
  };
  const areAllItemsClean = (): boolean => {
    return state.every((i) => i.isClean);
  };
  const isUploadLimitReached = (): boolean => {
    return state.length >= ITEMS_UPLOAD_LIMIT;
  };

  function emitChange(newItems: ClothingItem[]): void {
    listeners.forEach((listener) => listener(newItems));
    state = newItems;
  }

  return {
    items,
    addClothingItem,
    removeClothingItem,
    markLaundryDone,
    markWorn,
    isItemClean,
    areAllItemsClean,
    isUploadLimitReached,
  };
}
