import type { Color } from "./color.ts";

export type ClothingItemCategory = "top" | "bottom";

export type ClothingItemSubCategory =
  | "t-shirt"
  | "shirt"
  | "sweater"
  | "jacket"
  | "hoodie"
  | "pants"
  | "jeans"
  | "shorts"
  | "skirt";

export const subCategoryToCategory: Record<
  ClothingItemSubCategory,
  ClothingItemCategory
> = {
  "t-shirt": "top",
  shirt: "top",
  sweater: "top",
  jacket: "top",
  hoodie: "top",
  pants: "bottom",
  jeans: "bottom",
  shorts: "bottom",
  skirt: "bottom",
};

export const subCategoryLabels: Record<ClothingItemSubCategory, string> = {
  "t-shirt": "T-shirt",
  shirt: "Shirt",
  sweater: "Sweater",
  jacket: "Jacket",
  hoodie: "Hoodie",
  pants: "Pants",
  jeans: "Jeans",
  shorts: "Shorts",
  skirt: "Skirt",
};

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
  subCategory?: ClothingItemSubCategory;
  color: Color;
  isClean: boolean;
  imageId?: string;
};

export interface CreateClothingItem
  extends Omit<ClothingItem, "id" | "imageId"> {
  imageData: string;
}
