export type GarmentKind =
    | "tshirt"
    | "blazer"
    | "shirt"
    | "polo"
    | "hoodie"
    | "sweater"
    | "jeans"
    | "chinos"
    | "shorts"
    | "skirt";

export type Category = 'top' | 'bottom';

export type ClothingItem = {
    id: string;
    name: string;
    category: "top" | "bottom";
    type: GarmentKind;
    color: `#${string}`;
    isClean: boolean;
    imageData?: string; // data URL of resized/compressed image
    dateAdded?: string; // ISO timestamp
};

export type Outfit = {
    top?: ClothingItem;
    bottom?: ClothingItem;
};

export const categories: { value: Category; label: string; }[] = [
    { value: 'top', label: 'Tops' },
    { value: 'bottom', label: 'Bottoms' }
];