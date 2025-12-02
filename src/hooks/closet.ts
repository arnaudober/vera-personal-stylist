import { useState, useEffect } from "react";
import {
  type ClothingItem,
  type CreateClothingItem,
} from "../models/clothing-item";

const ITEMS_LOCAL_STORAGE_KEY = "closet";

// Private singleton state reused through the app
let state: ClothingItem[] = [];
let isInitialized = false;
const listeners = new Set<(items: ClothingItem[]) => void>();

const initialize = () => {
  if (isInitialized) {
    return;
  }

  try {
    const raw = localStorage.getItem(ITEMS_LOCAL_STORAGE_KEY);
    if (raw) {
      state = JSON.parse(raw) as ClothingItem[];
    } else {
      state = [];
    }
  } catch {
    state = [];
  }

  isInitialized = true;
};
initialize();

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

  const add = (item: CreateClothingItem): ClothingItem => {
    const newItem: ClothingItem = {
      ...item,
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
    emitChange([newItem, ...state]);

    return newItem;
  };
  const remove = (id: string): string => {
    emitChange(state.filter((i) => i.id !== id));
    return id;
  };
  const markLaundryDone = (): void => {
    emitChange(state.map((i) => ({ ...i, isClean: true })));
  };
  const markWorn = (item: ClothingItem): ClothingItem => {
    emitChange(
      state.map((i) => (item.id === i.id ? { ...i, isClean: false } : i)),
    );

    item.isClean = false;
    return item;
  };
  const isItemClean = (id: string): boolean => {
    return state.find((i) => i.id === id)?.isClean ?? false;
  };
  const areAllItemsClean = (): boolean => {
    return state.every((i) => i.isClean);
  };

  function emitChange(newItems: ClothingItem[]): void {
    listeners.forEach((listener) => listener(newItems));
    localStorage.setItem(ITEMS_LOCAL_STORAGE_KEY, JSON.stringify(newItems));
    state = newItems;
  }

  return {
    items,
    add,
    remove,
    markLaundryDone,
    markWorn,
    isItemClean,
    areAllItemsClean,
  };
}
