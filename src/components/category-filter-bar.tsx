import {
  categoryOptions,
  type ClothingItemCategory,
} from "../models/clothing-item.ts";

interface CategoryFilterBarData {
  selectedCategory: ClothingItemCategory | null;
  onCategorySelected: (category: ClothingItemCategory | null) => void;
}

export default function CategoryFilterBar({
  selectedCategory,
  onCategorySelected,
}: CategoryFilterBarData) {
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
}
