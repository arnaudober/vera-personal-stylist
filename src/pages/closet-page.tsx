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
    <div className={`pr-0 pb-2 pt-2 pl-4`}>
      <div className="flex justify-center" style={{ minWidth: "max-content" }}>
        <button
          onClick={() => onCategorySelected(null)}
          className={`
                            px-4 py-1 mr-2 cursor-pointer rounded-xl text-md font-medium transition-all whitespace-nowrap
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
                                px-4 py-1 mr-2 cursor-pointer rounded-xl text-md font-medium transition-all whitespace-nowrap
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
  const { removeClothingItem } = useCloset();
  const { outfit, clearOutfit } = useOutfit();

  function remove(id: string): void {
    if (window.confirm(`Are you sure you want to delete this item?`)) {
      removeClothingItem(id);

      if (item.id === outfit?.top.id || item.id === outfit?.bottom.id) {
        clearOutfit();
      }
    }
  }

  return (
    <div className="flex flex-col gap-2 p-2 ">
      <div className="suggest-card bg-white p-3 rounded-2xl flex flex-col items-center text-center relative">
        <button
          onClick={() => remove(item.id)}
          className="opacity-80 absolute top-2 right-2 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all cursor-pointer text-sm font-bold"
          aria-label="Delete item"
        >
          <IoClose size={14} />
        </button>

        <div className="text-7xl flex items-center justify-center">
          <img
            src={getImage(item.id)}
            alt={item.name}
            className="w-24 h-24 object-cover rounded-xl"
            loading="lazy"
          />
        </div>

        <div className="mt-2 text-lg font-semibold whitespace-nowrap text-ellipsis w-full overflow-hidden">
          {item.name}
        </div>

        <div className="mt-1">
          <span
            className={`inline-block rounded-full border px-2 py-0.5 text-xs pill`}
            style={{
              backgroundColor: item.isClean
                ? CLEAN_ITEM_COLOR
                : DIRTY_ITEM_COLOR,
              color: "#fff",
              borderColor: "transparent",
            }}
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
}: {
  onClick: () => void;
}): React.JSX.Element => {
  return (
    <div className="flex justify-center">
      <button
        onClick={onClick}
        aria-label="Add a new item to your closet"
        title="Add a new item to your closet"
        className={`fixed bottom-12 right-5 z-50 cursor-pointer rounded-full shadow-lg transition-colors border btn-accent border-gray-200 disabled:cursor-not-allowed  disabled:border-gray-300`}
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

  function onDoLaundry(): void {
    markLaundryDone();

    if (!outfit) {
      generateOutfit();
    }
  }

  return (
    <button
      className="mt-5 w-full rounded-xl bg-white opacity-70 text-black px-4 py-2 text-base text-md font-medium transition-all cursor-pointer hover:opacity-100 "
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
  const { items, addClothingItem } = useCloset();
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
    const newItem = addClothingItem(item);

    if (item.imageData) {
      await saveImage({ id: newItem.id, imageData: item.imageData });
    }
  }

  return (
    <>
      <div className="bg-app min-h-screen pb-28">
        <div className="mx-auto max-w-4xl p-4 pb-2">
          <h2 className="p-2 text-2xl font-semibold text-center">
            Your closet
          </h2>
        </div>

        <FilterBar
          selectedCategory={selectedCategory}
          onCategorySelected={setSelectedCategory}
        />

        <div className="mx-auto max-w-4xl p-4">
          <div className="rounded-2xl">
            <div className="grid gap-5 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>

          <LaundryButton />
        </div>
      </div>

      <NavigationBar activePage="closet" />
      <AddItemButton onClick={() => setShowUploadModal(true)} />

      {showUploadModal && (
        <UploadClothingItemModal
          onClose={() => setShowUploadModal(false)}
          onSave={addItem}
        />
      )}
    </>
  );
};
