import { useMemo, useState } from "react";
import { useCloset } from "../hooks/useCloset.ts";
import { ClothingItemCard } from "../components/clothing-item-card.tsx";
import NavigationBar from "../components/navigation-bar.tsx";
import LaundryButton from "../components/laundry-button.tsx";
import CategoryFilterBar from "../components/category-filter-bar.tsx";
import type { ClothingItemCategory } from "../models/clothing-item.ts";
import UploadClothingItemModal from "../modals/upload-clothing-item-modal.tsx";

export default function Closet() {
  const { items, addItem } = useCloset();
  const [selectedCategory, setSelectedCategory] =
    useState<ClothingItemCategory | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  const filteredClothingItems = useMemo(
    () =>
      selectedCategory
        ? items.filter((item) => item.category === selectedCategory)
        : items,
    [selectedCategory, items],
  );

  return (
    <>
      <div className="bg-app min-h-screen pb-28">
        <div className="mx-auto max-w-4xl p-4 pb-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="p-2 text-2xl font-semibold">Your closet</h2>
            <button
              className="rounded-xl bg-black text-white px-4 py-2 text-base"
              onClick={() => setShowUploadModal(true)}
            >
              Add item
            </button>
          </div>
        </div>

        <CategoryFilterBar
          selectedCategory={selectedCategory}
          onCategorySelected={setSelectedCategory}
        />

        <div className="mx-auto max-w-4xl p-4">
          <div className="rounded-2xl">
            <div className="grid gap-5 grid-cols-2">
              {filteredClothingItems.map((item) => (
                <ClothingItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <NavigationBar activePage="closet" />
      <LaundryButton />

      {showUploadModal && (
        <UploadClothingItemModal
          onClose={() => setShowUploadModal(false)}
          onSave={(item) => {
            addItem(item);
          }}
        />
      )}
    </>
  );
}
