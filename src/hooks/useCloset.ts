import {useEffect, useState} from "react";
import type {ClothingItem, Outfit} from "../model";

const LS_KEY = "closet_items_v1";

const DEFAULT_ITEMS: ClothingItem[] = [{
    id: "t1", name: "Lavender Tee", category: "top", color: "lavender", isClean: true, wornCount: 0, emoji: "👕"
}, {
    id: "t2", name: "White Oxford", category: "top", color: "white", isClean: true, wornCount: 0, emoji: "👔"
}, {
    id: "b1", name: "Dark Jeans", category: "bottom", color: "navy", isClean: true, wornCount: 0, emoji: "👖"
}, {
    id: "b2", name: "Teal Dress", category: "bottom", color: "teal", isClean: true, wornCount: 0, emoji: "👗"
}, {
    id: "f1", name: "White Sneakers", category: "footwear", color: "white", isClean: true, wornCount: 0, emoji: "👟"
}, {
    id: "f2", name: "Black Boots", category: "footwear", color: "black", isClean: true, wornCount: 0, emoji: "🥾"
}, {id: "o1", name: "Light Jacket", category: "outerwear", color: "gray", isClean: true, wornCount: 0, emoji: "🧥"},];

function loadCloset(): ClothingItem[] {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return DEFAULT_ITEMS;
        const parsed = JSON.parse(raw) as ClothingItem[];
        return parsed.map(i => ({...i, wornCount: i.wornCount ?? 0}));
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

    const toggleClean = (id: string) => {
        setItems(prev => prev.map(i => (i.id === id ? {...i, isClean: !i.isClean} : i)));
    };

    const markLaundryDone = () => {
        setItems(prev => prev.map(i => ({...i, isClean: true})));
    };

    const markWorn = (outfit: Outfit) => {
        const ids = Object.values(outfit)
            .filter(Boolean)
            .map(i => (i as ClothingItem).id);

        setItems(prev => prev.map(i => ids.includes(i.id) ? {...i, isClean: false, wornCount: i.wornCount + 1} : i));
    };

    return {items, toggleClean, markLaundryDone, markWorn};
}