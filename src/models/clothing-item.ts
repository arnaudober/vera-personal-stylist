export type ClothingCategoryOption = {
  value: ClothingItemCategory;
  label: string;
};
export type ClothingItemCategory = "top" | "bottom";
export const categoryOptions: ClothingCategoryOption[] = [
  { value: "top", label: "Tops" },
  { value: "bottom", label: "Bottoms" },
];

export type ClothingItemType =
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
export type TypeOption = {
  value: ClothingItemType;
  label: string;
  category: ClothingItemCategory;
};
export const typesOptions: TypeOption[] = [
  { value: "tshirt", label: "T-shirt", category: "top" },
  { value: "blazer", label: "Blazer", category: "top" },
  { value: "shirt", label: "Shirt", category: "top" },
  { value: "polo", label: "Polo", category: "top" },
  { value: "hoodie", label: "Hoodie", category: "top" },
  { value: "sweater", label: "Sweater", category: "top" },
  { value: "jeans", label: "Jeans", category: "bottom" },
  { value: "chinos", label: "Chinos", category: "bottom" },
  { value: "shorts", label: "Shorts", category: "bottom" },
  { value: "skirt", label: "Skirt", category: "bottom" },
];

export type HexadecimalString = `#${string}`;
export type ClothingItem = {
  id: string;
  name: string;
  category: ClothingItemCategory;
  type: ClothingItemType;
  color: HexadecimalString;
  isClean: boolean;
  imageData: string;
};

export type CreateClothingItem = Omit<ClothingItem, "id">;
