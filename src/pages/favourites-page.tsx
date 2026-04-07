import * as React from "react";
import NavigationBar from "../components/navigation-bar.tsx";
import { useCloset } from "../hooks/closet.ts";
import { useImage } from "../hooks/image.ts";
import { useFavouriteOutfits } from "../hooks/favourite-outfits.ts";
import type { FavouriteOutfit } from "../models/favourite-outfit.ts";
import { FaHeart } from "react-icons/fa";
import "./favourites-page.css";

const FavouriteOutfitCard = ({
  favourite,
}: {
  favourite: FavouriteOutfit;
}): React.JSX.Element => {
  const { items } = useCloset();
  const { getImage } = useImage();
  const { removeFavourite } = useFavouriteOutfits();

  const top = items.find((i) => i.id === favourite.topId);
  const bottom = items.find((i) => i.id === favourite.bottomId);

  async function remove(): Promise<void> {
    if (window.confirm("Are you sure you want to remove this favourite?")) {
      await removeFavourite(favourite.id);
    }
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="card flex flex-col items-center relative">
        <button
          onClick={() => remove()}
          className="unfavourite-button absolute top-2 right-2 flex items-center justify-center transition-all text-sm font-bold"
          aria-label="Remove favourite"
        >
          <FaHeart size={10} />
        </button>

        <div className="flex flex-col items-center gap-3">
          {top ? (
            <div className="flex flex-col items-center">
              <img
                src={getImage(top.imageId || top.id)}
                alt={top.name}
                className="w-24 h-24 object-contain rounded-xl"
                loading="lazy"
              />
              <div className="mt-1 text-sm text-black font-semibold whitespace-nowrap text-ellipsis w-full overflow-hidden">
                {top.name}
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-xl">
              <span className="text-gray-400 text-xs">Item removed</span>
            </div>
          )}

          {bottom ? (
            <div className="flex flex-col items-center">
              <img
                src={getImage(bottom.imageId || bottom.id)}
                alt={bottom.name}
                className="w-24 h-24 object-contain rounded-xl"
                loading="lazy"
              />
              <div className="mt-1 text-sm text-black font-semibold whitespace-nowrap text-ellipsis w-full overflow-hidden">
                {bottom.name}
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-xl">
              <span className="text-gray-400 text-xs">Item removed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const FavouritesPage = (): React.JSX.Element => {
  const { favourites } = useFavouriteOutfits();

  return (
    <>
      <div className="mx-auto max-w-4xl p-4 pb-2">
        <h2 className="page-title">Your favourites</h2>
      </div>

      <div className="mx-auto max-w-4xl p-4 pb-24">
        <div className="rounded-2xl">
          {favourites.length > 0 ? (
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {favourites.map((favourite) => (
                <FavouriteOutfitCard
                  key={favourite.id}
                  favourite={favourite}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-500 text-lg">
                No favourite outfits yet.
              </p>
              <p className="text-gray-400 text-sm">
                Save outfits you love from the suggest page!
              </p>
            </div>
          )}
        </div>
      </div>

      <NavigationBar activePage="favourites" />
    </>
  );
};
