import { useMemo, useState } from "react";
import { useCloset } from "../hooks/closet.ts";
import NavigationBar from "../components/navigation-bar.tsx";
import {
  categoryOptions,
  type ClothingItem,
  type ClothingItemCategory,
  type CreateClothingItem,
} from "../models/clothing-item.ts";
import UploadClothingItemModal from "../modals/upload-clothing-item-modal.tsx";
import * as React from "react";
import { useImage } from "../hooks/image.ts";
import { IoClose } from "react-icons/io5";
import { useOutfit } from "../hooks/outfit.ts";
import { FaPlus } from "react-icons/fa6";
import "./closet-page.css";

const FilterBar = ({
  selectedCategory,
  onCategorySelected,
}: {
  selectedCategory: ClothingItemCategory | null;
  onCategorySelected: (category: ClothingItemCategory | null) => void;
}): React.JSX.Element => {
  return (
    <div className={`pr-0 pb-2 pt-2 pl-4`}>
      <div className="flex justify-center" style={{ minWidth: "max-content" }}>
        <button
          onClick={() => onCategorySelected(null)}
          className={`filter-bar-item font-medium transition-all 
                            ${selectedCategory === null ? "active" : null}
                        `}
        >
          All
        </button>
        {categoryOptions.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onCategorySelected(value)}
            className={`filter-bar-item  font-medium transition-all
                                ${selectedCategory === value ? "active" : null}
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
  const { removeClothingItem } = useCloset();
  const { outfit, clearOutfit } = useOutfit();

  async function remove(id: string): Promise<void> {
    if (window.confirm(`Are you sure you want to delete this item?`)) {
      await removeClothingItem(id);

      if (item.id === outfit?.top.id || item.id === outfit?.bottom.id) {
        await clearOutfit();
      }
    }
  }

  return (
    <div className="flex flex-col gap-2 p-2 ">
      <div className="card flex flex-col items-center relative">
        <button
          onClick={() => remove(item.id)}
          className="delete-button absolute top-2 right-2 flex items-center justify-center transition-all text-sm font-bold"
          aria-label="Delete item"
        >
          <IoClose size={14} />
        </button>

        <div className="text-7xl flex items-center justify-center">
          <img
            src={getImage(item.id)}
            alt={item.name}
            className="w-24 h-24 object-contain rounded-xl"
            loading="lazy"
          />
        </div>

        <div className="mt-2 text-sm text-black font-semibold whitespace-nowrap text-ellipsis w-full overflow-hidden">
          {item.name}
        </div>

        <div className="mt-1">
          <span
            className={`badge inline-block border text-xs ${item.isClean ? "clean" : "dirty"}`}
          >
            {item.isClean ? "Clean" : "Dirty"}
          </span>
        </div>
      </div>
    </div>
  );
};
const AddItemButton = ({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}): React.JSX.Element => {
  return (
    <div className="flex justify-center">
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label="Add a new item to your closet"
        title={
          disabled
            ? "The limit of uploaded items has been reached"
            : "Add a new item to your closet"
        }
        className={`fixed bottom-12 right-5 z-50 shadow-lg primary-button transition-all ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        style={{ width: 56, height: 56 }}
      >
        <div className="flex items-center justify-center text-3xl">
          <FaPlus />
        </div>
      </button>
    </div>
  );
};
const LaundryButton = (): React.JSX.Element => {
  const { areAllItemsClean, markLaundryDone } = useCloset();
  const { generateOutfit, outfit } = useOutfit();

  async function onDoLaundry(): Promise<void> {
    await markLaundryDone();

    if (!outfit) {
      await generateOutfit();
    }
  }

  return (
    <button
      className="secondary-button mb-5 w-full text-base font-medium transition-all "
      aria-label="Mark all worn items as clean"
      title="Mark all worn items as clean"
      onClick={() => onDoLaundry()}
      disabled={areAllItemsClean()}
    >
      Wash all items
    </button>
  );
};

export const ClosetPage = (): React.JSX.Element => {
  const { items, addClothingItem, isUploadLimitReached } = useCloset();
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
    const newItem = await addClothingItem(item);

    if (item.imageData) {
      await saveImage({ id: newItem.id, imageData: item.imageData });
    }
  }

  return (
    <>
      <div className="mx-auto max-w-4xl p-4 pb-2">
        <h2 className="page-title">Your closet</h2>
      </div>

      <FilterBar
        selectedCategory={selectedCategory}
        onCategorySelected={setSelectedCategory}
      />

      <div className="mx-auto max-w-4xl p-4 pb-24">
        <LaundryButton />

        <div className="rounded-2xl">
          {filteredItems.length > 0 ? (
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-500 text-lg">
                No items found in this category.
              </p>
              <p className="text-gray-400 text-sm">
                Try selecting a different filter or add a new item!
              </p>
            </div>
          )}
        </div>
      </div>

      <NavigationBar activePage="closet" />
      <AddItemButton
        onClick={() => setShowUploadModal(true)}
        disabled={isUploadLimitReached()}
      />

      {showUploadModal && (
        <UploadClothingItemModal
          onClose={() => setShowUploadModal(false)}
          onSave={addItem}
        />
      )}
    </>
  );
};
