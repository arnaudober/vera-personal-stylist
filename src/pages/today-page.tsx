import * as React from "react";
import { useEffect, useState } from "react";
import NavigationBar from "../components/navigation-bar.tsx";
import { useOutfit } from "../hooks/outfit.ts";
import { useCloset } from "../hooks/closet.ts";
import { useImage } from "../hooks/image.ts";
import { useOutfitHistory } from "../hooks/outfit-history.ts";
import { useFavouriteOutfits } from "../hooks/favourite-outfits.ts";
import { FaCheck, FaHeart, FaRegHeart, FaSyncAlt } from "react-icons/fa";
import "../pages/today-page.css";

const FavouriteButton = () => {
  const { outfit } = useOutfit();
  const { addFavourite, removeFavouriteByOutfit, isFavourite } =
    useFavouriteOutfits();

  if (!outfit) {
    return null;
  }

  const favourited = isFavourite(outfit.top.id, outfit.bottom.id);

  async function onToggle(): Promise<void> {
    if (!outfit) return;
    if (favourited) {
      await removeFavouriteByOutfit(outfit.top.id, outfit.bottom.id);
    } else {
      await addFavourite(outfit.top.id, outfit.bottom.id);
    }
  }

  return (
    <button
      onClick={() => onToggle()}
      aria-label={favourited ? "Remove from favourites" : "Add to favourites"}
      title={favourited ? "Remove from favourites" : "Add to favourites"}
      className="favourite-button absolute top-3 right-3 flex items-center justify-center transition-all text-sm font-bold"
    >
      {favourited ? <FaHeart size={10} /> : <FaRegHeart size={10} />}
    </button>
  );
};

const EmptyMessageTemplate = () => (
  <div className="relative mx-auto w-full max-w-md h-64 md:h-80 flex items-center justify-center">
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-gray-500 text-lg">No outfit right now.</p>
      <p className="text-gray-400 text-sm">Maybe it's laundry time?</p>
    </div>
  </div>
);
const RegenerateOutfitFab = () => {
  const { generateOutfit, canGenerateOutfit } = useOutfit();

  async function onRegenerate(): Promise<void> {
    await generateOutfit();
  }

  return (
    <button
      onClick={() => onRegenerate()}
      aria-label="Regenerate the outfit"
      title="Regenerate the outfit"
      disabled={!canGenerateOutfit()}
      className={`fixed bottom-12 right-5 z-50 shadow-lg primary-button transition-all ${!canGenerateOutfit() ? "opacity-50 cursor-not-allowed" : ""}`}
      style={{ width: 56, height: 56 }}
    >
      <div className="flex items-center justify-center text-2xl">
        <FaSyncAlt />
      </div>
    </button>
  );
};
const OutfitTemplate = (): React.JSX.Element => {
  const { getImage } = useImage();
  const { isItemClean, areAllItemsClean, markWorn } = useCloset();
  const { outfit, clearOutfit, generateOutfit } = useOutfit();
  const { recordOutfit } = useOutfitHistory();
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    if (!outfit) {
      void generateOutfit();
    }
  }, [generateOutfit, outfit]);

  const handleConfirmWorn = async (): Promise<void> => {
    if (!outfit) return;
    setIsMarking(true);
    try {
      await recordOutfit(outfit.top.id, outfit.bottom.id);
      await markWorn(outfit.top);
      await markWorn(outfit.bottom);
      await clearOutfit();
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {outfit ? (
        <>
          {(() => {
            const hasVisibleItems =
              outfit.top &&
              isItemClean(outfit.top.id) &&
              outfit.bottom &&
              isItemClean(outfit.bottom.id);
            if (!hasVisibleItems) {
              return <EmptyMessageTemplate />;
            }

            return (
              <div className="relative mx-auto w-full max-w-sm">
                <div className="card flex flex-col items-center gap-4 p-5 relative">
                  <FavouriteButton />
                  {/* Top item */}
                  {outfit.top && isItemClean(outfit.top.id) && (
                    <div className="flex flex-col items-center">
                      <img
                        src={getImage(outfit.top.id)}
                        alt={outfit.top.name}
                        className="w-36 h-36 object-contain rounded-xl"
                        loading="lazy"
                      />
                      <div className="mt-2 text-sm text-black font-semibold whitespace-nowrap text-ellipsis w-full overflow-hidden text-center">
                        {outfit.top.name}
                      </div>
                    </div>
                  )}

                  <div className="w-full border-t border-gray-100" />

                  {/* Bottom item */}
                  {outfit.bottom && isItemClean(outfit.bottom.id) && (
                    <div className="flex flex-col items-center">
                      <img
                        src={getImage(outfit.bottom.id)}
                        alt={outfit.bottom.name}
                        className="w-36 h-36 object-contain rounded-xl"
                        loading="lazy"
                      />
                      <div className="mt-2 text-sm text-black font-semibold whitespace-nowrap text-ellipsis w-full overflow-hidden text-center">
                        {outfit.bottom.name}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleConfirmWorn}
                  disabled={isMarking}
                  className={`primary-button mt-4 w-full py-3 flex items-center justify-center gap-2 text-base font-semibold transition-all ${isMarking ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <FaCheck />
                  {isMarking ? "Marking as worn..." : "I'm wearing this"}
                </button>
              </div>
            );
          })()}
        </>
      ) : (
        <EmptyMessageTemplate />
      )}

      {/* Basket */}
      <div
        className="fixed bottom-16 left-1/2 -translate-x-1/2 p-2 w-64 md:w-80 h-44 md:h-56 flex items-center justify-center pointer-events-none"
        aria-label="Wear basket"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            style={{
              width: "100%",
              aspectRatio: "1/2",
              backgroundImage: "url(/assets/basket-grid.png)",
              backgroundRepeat: "no-repeat",
              backgroundSize: "200% 100%",
              backgroundPosition: areAllItemsClean() ? "0 0" : "94% 0",
              imageRendering: "auto",
            }}
            aria-label={areAllItemsClean() ? "Empty basket" : "Full basket"}
          />
        </div>
      </div>
    </div>
  );
};

export const TodayPage = (): React.JSX.Element => {
  return (
    <>
      {/* Header */}
      <div className="mx-auto max-w-4xl p-4 pb-2">
        <h2 className="page-title">Today's outfit</h2>
      </div>

      <div className="w-full mx-auto max-w-4xl p-4 pb-24">
        <OutfitTemplate />
      </div>

      <NavigationBar activePage="today" />
      <RegenerateOutfitFab />
    </>
  );
};
