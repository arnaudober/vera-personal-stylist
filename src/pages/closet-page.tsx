import { useMemo, useState } from "react";
import { useCloset } from "../hooks/closet.ts";
import NavigationBar from "../components/navigation-bar.tsx";
import LaundryButton from "../components/laundry-button.tsx";
import {
  categoryOptions,
  type ClothingItem,
  type ClothingItemCategory,
  type CreateClothingItem,
} from "../models/clothing-item.ts";
import UploadClothingItemModal from "../modals/upload-clothing-item-modal.tsx";
import * as React from "react";
import { useImage } from "../hooks/image.ts";

const CLEAN_ITEM_COLOR = "#65aaa7";
const DIRTY_ITEM_COLOR = "#374151";

const FilterBar = ({
  selectedCategory,
  onCategorySelected,
}: {
  selectedCategory: ClothingItemCategory | null;
  onCategorySelected: (category: ClothingItemCategory | null) => void;
}): React.JSX.Element => {
  return (
    <div className={`pr-0 pt-0 pb-2 pl-4`}>
      <div className="flex" style={{ minWidth: "max-content" }}>
        <button
          onClick={() => onCategorySelected(null)}
          className={`
                            px-4 py-1 mr-2 rounded-xl text-md font-medium transition-all whitespace-nowrap
                            ${selectedCategory === null ? "bg-gray-100 text-gray-700" : "text-gray-700"}
                        `}
        >
          All
        </button>
        {categoryOptions.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onCategorySelected(value)}
            className={`
                                px-4 py-1 mr-2 rounded-xl text-md font-medium transition-all whitespace-nowrap
                                ${selectedCategory === value ? "bg-gray-100  text-gray-700" : "text-gray-700"}
                            `}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};
const ItemCard = ({ item }: { item: ClothingItem }): React.JSX.Element => {
  const { getImage } = useImage();

  return (
    <div className="suggest-card bg-white p-3 rounded-2xl flex flex-col items-center text-center">
      <div className="text-7xl flex items-center justify-center">
        <img
          src={getImage(item.id)}
          alt={item.name}
          className="w-24 h-24 object-cover rounded-xl"
          loading="lazy"
        />
      </div>

      <div className="mt-2 text-lg font-semibold">{item.name}</div>

      <div className="mt-1">
        <span
          className={`inline-block rounded-full border px-2 py-0.5 text-xs pill`}
          style={{
            backgroundColor: item.isClean ? CLEAN_ITEM_COLOR : DIRTY_ITEM_COLOR,
            color: "#fff",
            borderColor: "transparent",
          }}
        >
          {item.isClean ? "Clean" : "Dirty"}
        </span>
      </div>
    </div>
  );
};

export const ClosetPage = (): React.JSX.Element => {
  const { items, add } = useCloset();
  const { saveImage } = useImage();
  const [selectedCategory, setSelectedCategory] =
    useState<ClothingItemCategory | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  const filteredItems = useMemo(
    () =>
      selectedCategory
        ? items.filter((item) => item.category === selectedCategory)
        : items,
    [selectedCategory, items],
  );

  async function addItem(item: CreateClothingItem): Promise<void> {
    const newItem = add(item);

    if (item.imageData) {
      await saveImage({ id: newItem.id, imageData: item.imageData });
    }
  }

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

        <FilterBar
          selectedCategory={selectedCategory}
          onCategorySelected={setSelectedCategory}
        />

        <div className="mx-auto max-w-4xl p-4">
          <div className="rounded-2xl">
            <div className="grid gap-5 grid-cols-2">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
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
          onSave={addItem}
        />
      )}
    </>
  );
};
