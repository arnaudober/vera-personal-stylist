export type Category = 'top' | 'bottom' | 'footwear' | 'outerwear' | 'accessory';

export type ClothingItem = {
    id: string;
    name: string;
    category: Category;
    color?: string;
    isClean: boolean;
    wornCount: number;
    emoji?: string; // quick visual for the MVP
};

export type Outfit = {
    top?: ClothingItem;
    bottom?: ClothingItem;
    footwear?: ClothingItem;
    outerwear?: ClothingItem;
    accessory?: ClothingItem;
};

export const categories: { value: Category; label: string; }[] = [
    { value: 'top', label: 'Tops' },
    { value: 'bottom', label: 'Bottoms' },
    { value: 'footwear', label: 'Footwear' },
    { value: 'outerwear', label: 'Outerwear' },
    { value: 'accessory', label: 'Accessories' }
];