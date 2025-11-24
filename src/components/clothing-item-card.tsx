import type { ClothingItem } from "../models/clothing-item.ts";

const CLEAN_ITEM_COLOR = "#65aaa7";
const DIRTY_ITEM_COLOR = "#374151";

interface ClothingItemCardData {
  item: ClothingItem;
}

export function ClothingItemCard({ item }: ClothingItemCardData) {
  return (
    <div className="suggest-card bg-white p-3 rounded-2xl flex flex-col items-center text-center">
      <div className="text-7xl flex items-center justify-center">
        <img
          src={item.imageData}
          alt={item.name}
          className="w-24 h-24 object-cover rounded-xl shadow-sm"
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
}
