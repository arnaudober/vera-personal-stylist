import {useEffect, useState} from "react";
import type {ClothingItem, Outfit} from "../model";

const LS_KEY = "closet_items_v1";

export const DEFAULT_ITEMS: ClothingItem[] = [// --- Reds & Oranges (some close shades) ---
    {
        id: "t-red-01", name: "Red T-shirt", category: "top", type: "tshirt", color: "#FF3B30", isClean: true
    }, {id: "blz-oxblood-01", name: "Oxblood Blazer", category: "top", type: "blazer", color: "#7A0C0C", isClean: true}, // darker red
    {id: "pol-coral-01", name: "Coral Polo", category: "top", type: "polo", color: "#FF6F61", isClean: true},        // near red/orange
    {
        id: "sw-orange-01",
        name: "Burnt Orange Sweater",
        category: "top",
        type: "sweater",
        color: "#E67E22",
        isClean: true
    },

    // --- Blues (intentional near-duplicates for ΔE tie-breaks) ---
    {id: "t-navy-01", name: "Navy Tee", category: "top", type: "tshirt", color: "#000080", isClean: true},           // deep navy
    {id: "sh-ink-01", name: "Ink Blue Shirt", category: "top", type: "shirt", color: "#0B3D91", isClean: true},      // very close to navy
    {id: "hd-sky-01", name: "Sky Blue Hoodie", category: "top", type: "hoodie", color: "#6EA8FE", isClean: true},    // light/saturated
    {id: "blz-royal-01", name: "Royal Blue Blazer", category: "top", type: "blazer", color: "#4169E1", isClean: true},

    // --- Greens (warm/cool & muted/bright) ---
    {
        id: "t-mint-01", name: "Mint T-shirt", category: "top", type: "tshirt", color: "#98FF98", isClean: true
    }, {
        id: "sh-olive-01", name: "Olive Shirt", category: "top", type: "shirt", color: "#6B8E23", isClean: true
    }, {
        id: "sw-forest-01",
        name: "Forest Green Sweater",
        category: "top",
        type: "sweater",
        color: "#228B22",
        isClean: true
    },

    // --- Purples / Pinks ---
    {
        id: "blz-plum-01", name: "Plum Blazer", category: "top", type: "blazer", color: "#8E44AD", isClean: true
    }, {
        id: "t-pink-01", name: "Soft Pink Tee", category: "top", type: "tshirt", color: "#FFC0CB", isClean: true
    }, {id: "pol-magenta-01", name: "Magenta Polo", category: "top", type: "polo", color: "#FF2D55", isClean: true},

    // --- Yellows / Neutrals tops ---
    {
        id: "sh-mustard-01", name: "Mustard Shirt", category: "top", type: "shirt", color: "#FFD60A", isClean: true
    }, {
        id: "t-cream-01", name: "Cream Tee", category: "top", type: "tshirt", color: "#F5F5F0", isClean: true
    }, {
        id: "hd-charcoal-01", name: "Charcoal Hoodie", category: "top", type: "hoodie", color: "#333333", isClean: true
    }, {
        id: "sw-grey-01", name: "Mid Grey Sweater", category: "top", type: "sweater", color: "#8E8E93", isClean: true
    }, {
        id: "blz-black-01", name: "Black Blazer", category: "top", type: "blazer", color: "#000000", isClean: true
    }, {id: "sh-white-01", name: "White Oxford Shirt", category: "top", type: "shirt", color: "#FFFFFF", isClean: true},

    // --- Bottoms: denim in multiple washes (close shades) ---
    {
        id: "jnm-dark-01", name: "Dark Wash Jeans", category: "bottom", type: "jeans", color: "#1F3251", isClean: true
    }, {id: "jnm-mid-01", name: "Mid Wash Jeans", category: "bottom", type: "jeans", color: "#3A5FCD", isClean: true},  // similar blue for ΔE testing
    {id: "jnm-black-01", name: "Black Jeans", category: "bottom", type: "jeans", color: "#0A0A0A", isClean: true},

    // --- Bottoms: chinos/kakis in multiple tones ---
    {
        id: "chi-beige-01", name: "Beige Chinos", category: "bottom", type: "chinos", color: "#D2B48C", isClean: true
    }, {id: "chi-khaki-01", name: "Khaki Chinos", category: "bottom", type: "chinos", color: "#C3B091", isClean: true}, // near-beige
    {id: "chi-navy-01", name: "Navy Chinos", category: "bottom", type: "chinos", color: "#0B2A66", isClean: true},   // near navy tops

    // --- Bottoms: shorts (light/dark) ---
    {
        id: "sho-stone-01", name: "Stone Shorts", category: "bottom", type: "shorts", color: "#D9D6CF", isClean: true
    }, {id: "sho-navy-01", name: "Navy Shorts", category: "bottom", type: "shorts", color: "#0A214A", isClean: true},

    // --- Bottoms: skirt (kept as bottom; good for color variety) ---
    {
        id: "sk-burgundy-01",
        name: "Burgundy Skirt",
        category: "bottom",
        type: "skirt",
        color: "#800020",
        isClean: true
    },];


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