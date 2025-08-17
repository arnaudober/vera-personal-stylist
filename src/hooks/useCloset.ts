import {useEffect, useState} from "react";
import type {ClothingItem, Outfit} from "../model";

const LS_KEY = "closet_items_v1";

const DEFAULT_ITEMS: ClothingItem[] = [{
    id: "t1", name: "Lavender tee", category: "top", color: "lavender", isClean: true, emoji: "👕"
}, {
    id: "t2", name: "White Oxford", category: "top", color: "white", isClean: true, emoji: "👔"
}, {
    id: "b1", name: "Dark jeans", category: "bottom", color: "navy", isClean: true, emoji: "👖"
}, {
    id: "b2", name: "Teal dress", category: "bottom", color: "teal", isClean: true, emoji: "👗"
}, {
    id: "f1", name: "White sneakers", category: "footwear", color: "white", isClean: true, emoji: "👟"
}, {
    id: "f2", name: "Black boots", category: "footwear", color: "black", isClean: true, emoji: "🥾"
}, {id: "o1", name: "Light jacket", category: "outerwear", color: "gray", isClean: true, emoji: "🧥"},];

function loadCloset(): ClothingItem[] {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return DEFAULT_ITEMS;
        return JSON.parse(raw) as ClothingItem[];
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

    const markLaundryDone = () => {
        setItems(prev => prev.map(i => ({...i, isClean: true})));
    };

    const markWorn = (outfit: Outfit) => {
        const ids = Object.values(outfit)
            .filter(Boolean)
            .map(i => (i as ClothingItem).id);

        setItems(prev => prev.map(i => ids.includes(i.id) ? {...i, isClean: false} : i));
    };

    return {items, markLaundryDone, markWorn};
}