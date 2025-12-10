import type { Color } from "./color.ts";

export type ClothingItemCategory = "top" | "bottom";
type ClothingCategoryOption = {
  value: ClothingItemCategory;
  label: string;
};
export const categoryOptions: ClothingCategoryOption[] = [
  { value: "top", label: "Tops" },
  { value: "bottom", label: "Bottoms" },
];

export type ClothingItem = {
  id: string;
  name: string;
  category: ClothingItemCategory;
  color: Color;
  isClean: boolean;
};

export interface CreateClothingItem extends Omit<ClothingItem, "id"> {
  imageData: string;
}
