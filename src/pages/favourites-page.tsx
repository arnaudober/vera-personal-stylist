import * as React from "react";
import { useMemo, useState } from "react";
import NavigationBar from "../components/navigation-bar.tsx";
import { useCloset } from "../hooks/closet.ts";
import { useImage } from "../hooks/image.ts";
import { useFavouriteOutfits } from "../hooks/favourite-outfits.ts";
import { useOutfitHistory } from "../hooks/outfit-history.ts";
import type { FavouriteOutfit } from "../models/favourite-outfit.ts";
import type { ClothingItem } from "../models/clothing-item.ts";
import { FaHeart, FaCheck } from "react-icons/fa";
import "./favourites-page.css";
import "../pages/closet-page.css";

const FavouriteOutfitCard = ({
  favourite,
  top,
  bottom,
}: {
  favourite: FavouriteOutfit;
  top: ClothingItem | undefined;
  bottom: ClothingItem | undefined;
}): React.JSX.Element => {
  const { getImage } = useImage();
  const { removeFavourite } = useFavouriteOutfits();
  const { markWorn } = useCloset();
  const { recordOutfit } = useOutfitHistory();

  async function remove(): Promise<void> {
    if (window.confirm("Are you sure you want to remove this favourite?")) {
      await removeFavourite(favourite.id);
    }
  }

  async function wearOutfit(): Promise<void> {
    if (!top || !bottom) return;
    await recordOutfit(top.id, bottom.id);
    await markWorn(top);
    await markWorn(bottom);
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="card flex flex-col items-center relative overflow-hidden !pt-3 !px-0 !pb-0">
        <button
          onClick={() => remove()}
          className="unfavourite-button absolute top-2 right-2 flex items-center justify-center transition-all text-sm font-bold"
          aria-label="Remove favourite"
        >
          <FaHeart size={10} />
        </button>

        <div className="flex flex-col items-center gap-3 w-full min-w-0 px-3">
          {top ? (
            <div className="flex flex-col items-center w-full min-w-0">
              <img
                src={getImage(top.imageId || top.id)}
                alt={top.name}
                className="w-24 h-24 object-contain rounded-xl"
                loading="lazy"
              />
              <div className="mt-1 text-sm text-black font-semibold whitespace-nowrap text-ellipsis w-full overflow-hidden text-center">
                {top.name}
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-xl">
              <span className="text-gray-400 text-xs">Item removed</span>
            </div>
          )}

          <div className="w-full border-t border-gray-100" />

          {bottom ? (
            <div className="flex flex-col items-center w-full min-w-0">
              <img
                src={getImage(bottom.imageId || bottom.id)}
                alt={bottom.name}
                className="w-24 h-24 object-contain rounded-xl"
                loading="lazy"
              />
              <div className="mt-1 text-sm text-black font-semibold whitespace-nowrap text-ellipsis w-full overflow-hidden text-center">
                {bottom.name}
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-xl">
              <span className="text-gray-400 text-xs">Item removed</span>
            </div>
          )}
        </div>

        <button
          onClick={() => wearOutfit()}
          disabled={!top?.isClean || !bottom?.isClean}
          className="wear-button w-full font-medium transition-all mt-3 flex items-center justify-center gap-1.5"
        >
          <FaCheck size={10} />
          Wear it
        </button>
      </div>
    </div>
  );
};

const FavouritesFilterBar = ({
  readyToWearOnly,
  onFilterChange,
}: {
  readyToWearOnly: boolean;
  onFilterChange: (readyToWear: boolean) => void;
}): React.JSX.Element => {
  return (
    <div className="pb-2">
      <div className="flex justify-center">
        <button
          onClick={() => onFilterChange(false)}
          className={`filter-bar-item font-medium transition-all ${!readyToWearOnly ? "active" : ""}`}
        >
          All
        </button>
        <button
          onClick={() => onFilterChange(true)}
          className={`filter-bar-item font-medium transition-all ${readyToWearOnly ? "active" : ""}`}
        >
          Ready to wear
        </button>
      </div>
    </div>
  );
};

export const FavouritesPage = (): React.JSX.Element => {
  const { favourites } = useFavouriteOutfits();
  const { items } = useCloset();

  const [readyToWearOnly, setReadyToWearOnly] = useState(false);

  const resolvedFavourites = useMemo(() => {
    return favourites.map((fav) => ({
      favourite: fav,
      top: items.find((i) => i.id === fav.topId),
      bottom: items.find((i) => i.id === fav.bottomId),
    }));
  }, [favourites, items]);

  const filteredFavourites = useMemo(() => {
    if (!readyToWearOnly) return resolvedFavourites;
    return resolvedFavourites.filter(
      ({ top, bottom }) => top?.isClean && bottom?.isClean,
    );
  }, [resolvedFavourites, readyToWearOnly]);

  return (
    <>
      <div className="mx-auto max-w-4xl p-4 pb-2">
        <h2 className="page-title">Your favourites</h2>
      </div>

      {favourites.length > 0 && (
        <div className="mx-auto max-w-4xl px-4">
          <FavouritesFilterBar
            readyToWearOnly={readyToWearOnly}
            onFilterChange={setReadyToWearOnly}
          />
        </div>
      )}

      <div className="w-full mx-auto max-w-4xl p-4 pb-24">
        <div className="rounded-2xl">
          {favourites.length > 0 ? (
            filteredFavourites.length > 0 ? (
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredFavourites.map(({ favourite, top, bottom }) => (
                  <FavouriteOutfitCard
                    key={favourite.id}
                    favourite={favourite}
                    top={top}
                    bottom={bottom}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-gray-500 text-lg">
                  No outfits match your filters.
                </p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your filters above.
                </p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-500 text-lg">No favourite outfits yet.</p>
              <p className="text-gray-400 text-sm">
                Save outfits you love from the today page!
              </p>
            </div>
          )}
        </div>
      </div>

      <NavigationBar activePage="favourites" />
    </>
  );
};
