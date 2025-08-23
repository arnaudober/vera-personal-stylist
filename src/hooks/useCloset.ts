import {useEffect, useState} from "react";
import type {ClothingItem, Outfit} from "../model";

const LS_KEY = "closet_items_v1";


const DEFAULT_ITEMS: ClothingItem[] = [{
    id: "t1", name: "Red t-shirt", category: "top", type: "tshirt", color: "red", isClean: true
}, {
    id: "t2", name: "Tan blazer", category: "outerwear", type: "blazer", color: "tan", isClean: true
}, {
    id: "b1", name: "Navy chino", category: "bottom", type: "pants", color: "navy", isClean: true
}, {
    id: "b2", name: "Green dress", category: "bottom", type: "dress", color: "green", isClean: true
}, {
    id: "b3", name: "Pink skirt", category: "bottom", type: "skirt", color: "pink", isClean: true
}, {
    id: "b4", name: "Teal shorts", category: "bottom", type: "shorts", color: "teal", isClean: true
}, {
    id: "b5", name: "Blue jeans", category: "bottom", type: "jeans", color: "blue", isClean: true
}, {
    id: "f1", name: "Beige sneakers", category: "footwear", type: "sneaker", color: "beige", isClean: true
}, {
    id: "o1", name: "Navy hoodie", category: "outerwear", type: "hoodie", color: "navy", isClean: true
}];


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