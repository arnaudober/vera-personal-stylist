import {useEffect, useState} from "react";
import type {ClothingItem, Outfit} from "../model";

const LS_KEY_V1 = "closet_items_v1";
const LS_KEY_V2 = "closet_items_v2";

export const DEFAULT_ITEMS: ClothingItem[] = [];


function loadClosetV2(): ClothingItem[] {
    try {
        const rawV2 = localStorage.getItem(LS_KEY_V2);
        if (rawV2) return JSON.parse(rawV2) as ClothingItem[];

        // try migrate from V1
        const rawV1 = localStorage.getItem(LS_KEY_V1);
        if (rawV1) {
            const v1Items = JSON.parse(rawV1) as ClothingItem[];
            // ensure new optional fields are absent/undefined; set dateAdded where missing
            const migrated = v1Items.map(i => ({ ...i, dateAdded: i.dateAdded ?? new Date().toISOString() }));
            localStorage.setItem(LS_KEY_V2, JSON.stringify(migrated));
            return migrated;
        }
        // fall back to defaults
        localStorage.setItem(LS_KEY_V2, JSON.stringify(DEFAULT_ITEMS));
        return DEFAULT_ITEMS;
    } catch {
        return DEFAULT_ITEMS;
    }
}

function saveCloset(items: ClothingItem[]) {
    localStorage.setItem(LS_KEY_V2, JSON.stringify(items));
}

export type NewClothingItemInput = Omit<ClothingItem, "id" | "dateAdded"> & { imageData?: string };

export function useCloset() {
    const [items, setItems] = useState<ClothingItem[]>(() => loadClosetV2());

    useEffect(() => {
        saveCloset(items);
    }, [items]);

    const addItem = (input: NewClothingItemInput) => {
        const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const newItem: ClothingItem = {
            ...input,
            id,
            dateAdded: new Date().toISOString(),
        };
        setItems(prev => [newItem, ...prev]);
        return newItem;
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const markLaundryDone = () => {
        setItems(prev => prev.map(i => ({...i, isClean: true})));
    };

    const markWorn = (outfit: Outfit) => {
        const ids = Object.values(outfit)
            .filter(Boolean)
            .map(i => (i as ClothingItem).id);

        setItems(prev => prev.map(i => ids.includes(i.id) ? {...i, isClean: false} : i));
    };

    return {items, addItem, removeItem, markLaundryDone, markWorn};
}