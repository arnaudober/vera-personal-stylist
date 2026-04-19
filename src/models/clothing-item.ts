import type { Color } from "./color.ts";

export type ClothingItemCategory =
  | "top"
  | "bottom"
  | "outerwear"
  | "shoes"
  | "accessories";

export type ClothingItemSubCategory =
  | "t-shirt"
  | "shirt"
  | "sweater"
  | "jacket"
  | "coat"
  | "hoodie"
  | "pants"
  | "jeans"
  | "shorts"
  | "skirt"
  | "sneakers"
  | "boots"
  | "sandals"
  | "dress_shoes"
  | "bag"
  | "belt"
  | "scarf"
  | "hat"
  | "watch"
  | "ring"
  | "earring";

export const subCategoryToCategory: Record<
  ClothingItemSubCategory,
  ClothingItemCategory
> = {
  "t-shirt": "top",
  shirt: "top",
  sweater: "top",
  jacket: "outerwear",
  coat: "outerwear",
  hoodie: "top",
  pants: "bottom",
  jeans: "bottom",
  shorts: "bottom",
  skirt: "bottom",
  sneakers: "shoes",
  boots: "shoes",
  sandals: "shoes",
  dress_shoes: "shoes",
  bag: "accessories",
  belt: "accessories",
  scarf: "accessories",
  hat: "accessories",
  watch: "accessories",
  ring: "accessories",
  earring: "accessories",
};

export const subCategoryLabels: Record<ClothingItemSubCategory, string> = {
  "t-shirt": "T-shirt",
  shirt: "Shirt",
  sweater: "Sweater",
  jacket: "Jacket",
  coat: "Coat",
  hoodie: "Hoodie",
  pants: "Pants",
  jeans: "Jeans",
  shorts: "Shorts",
  skirt: "Skirt",
  sneakers: "Sneakers",
  boots: "Boots",
  sandals: "Sandals",
  dress_shoes: "Dress Shoes",
  bag: "Bag",
  belt: "Belt",
  scarf: "Scarf",
  hat: "Hat",
  watch: "Watch",
  ring: "Ring",
  earring: "Earrings",
};

type ClothingCategoryOption = {
  value: ClothingItemCategory;
  label: string;
};
export const categoryOptions: ClothingCategoryOption[] = [
  { value: "top", label: "Tops" },
  { value: "bottom", label: "Bottoms" },
  { value: "outerwear", label: "Jackets/coats" },
  { value: "shoes", label: "Shoes" },
  { value: "accessories", label: "Accessories" },
];

export type ClothingItem = {
  id: string;
  name: string;
  category: ClothingItemCategory;
  subCategory?: ClothingItemSubCategory;
  color: Color;
  isClean: boolean;
  imageId?: string;
};

export interface CreateClothingItem
  extends Omit<ClothingItem, "id" | "imageId"> {
  imageData: string;
}
