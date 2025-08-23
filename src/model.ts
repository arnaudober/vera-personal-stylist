import type {GarmentKind} from "./components/garment-glyph.tsx";

export type Category = 'top' | 'bottom' | 'footwear' | 'outerwear';

export type ClothingItem = {
    id: string; name: string; category: Category; type: GarmentKind; color?: string; isClean: boolean;
};

export type Outfit = {
    top?: ClothingItem;
    bottom?: ClothingItem;
    footwear?: ClothingItem;
    outerwear?: ClothingItem;
    accessory?: ClothingItem;
};

export const categories: { value: Category; label: string; }[] = [{value: 'top', label: 'Tops'}, {
    value: 'bottom', label: 'Bottoms'
}, {value: 'footwear', label: 'Shoes'}, {value: 'outerwear', label: 'Outerwear'}];