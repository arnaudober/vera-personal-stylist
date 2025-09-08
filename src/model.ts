import type {GarmentKind} from "./components/garment-glyph.tsx";

export type Category = 'top' | 'bottom';

export type ClothingItem = {
    id: string;
    name: string;
    category: "top" | "bottom";
    type: GarmentKind;
    color: `#${string}`;
    isClean: boolean;
};

export type Outfit = {
    top?: ClothingItem;
    bottom?: ClothingItem;
};

export const categories: { value: Category; label: string; }[] = [{value: 'top', label: 'Tops'}, {
    value: 'bottom', label: 'Bottoms'
}];