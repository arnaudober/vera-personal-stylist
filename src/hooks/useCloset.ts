import { useEffect, useState } from "react";
import type {
  ClothingItem,
  CreateClothingItem,
} from "../models/clothing-item.ts";
import type { Outfit } from "../models/outfit.ts";

const LS_KEY = "closet_items";

export const DEFAULT_ITEMS: ClothingItem[] = [];

function loadCloset(): ClothingItem[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as ClothingItem[];
    localStorage.setItem(LS_KEY, JSON.stringify(DEFAULT_ITEMS));
    return DEFAULT_ITEMS;
  } catch {
    return DEFAULT_ITEMS;
  }
}

function saveCloset(items: ClothingItem[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

export function useCloset() {
  const [items, setItems] = useState<ClothingItem[]>(() => loadCloset());

  useEffect(() => {
    saveCloset(items);
  }, [items]);

  const addItem = (input: CreateClothingItem) => {
    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newItem: ClothingItem = {
      ...input,
      id,
    };
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const markLaundryDone = () => {
    setItems((prev) => prev.map((i) => ({ ...i, isClean: true })));
  };

  const markWorn = (outfit: Outfit) => {
    const ids = Object.values(outfit)
      .filter(Boolean)
      .map((i) => (i as ClothingItem).id);

    setItems((prev) =>
      prev.map((i) => (ids.includes(i.id) ? { ...i, isClean: false } : i)),
    );
  };

  return { items, addItem, removeItem, markLaundryDone, markWorn };
}
