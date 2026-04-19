import * as React from "react";
import { useEffect, useState } from "react";
import NavigationBar from "../components/navigation-bar.tsx";
import { useOutfit } from "../hooks/outfit.ts";
import { useCloset } from "../hooks/closet.ts";
import { useImage } from "../hooks/image.ts";
import { useOutfitHistory } from "../hooks/outfit-history.ts";
import { useFavouriteOutfits } from "../hooks/favourite-outfits.ts";
import { FaCheck, FaHeart, FaRegHeart, FaSyncAlt, FaTshirt } from "react-icons/fa";
import { useNavigate } from "react-router";
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

const EmptyMessageTemplate = () => {
  const navigate = useNavigate();

  return (
    <div className="relative mx-auto w-full max-w-md flex items-center justify-center">
      <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <FaTshirt className="text-8xl text-gray-400" />
        <p className="text-gray-500 text-lg">No outfit right now.</p>
        <p className="text-gray-400 text-sm">All your clothes are in the basket — time to do laundry!</p>
        <button
          onClick={() => navigate("/closet")}
          className="primary-button px-6 py-3 text-base font-semibold mt-2"
        >
          Go to closet
        </button>
      </div>
    </div>
  );
};
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
  const { isItemClean, markWorn } = useCloset();
  const { outfit, clearOutfit, generateOutfit } = useOutfit();
  const { recordOutfit } = useOutfitHistory();
  const [isMarking, setIsMarking] = useState(false);

  const hasExtras = !!(
    outfit?.outerwear && isItemClean(outfit.outerwear.id) ||
    outfit?.shoes && isItemClean(outfit.shoes.id) ||
    outfit?.accessories && isItemClean(outfit.accessories.id)
  );

  useEffect(() => {
    if (!outfit) {
      void generateOutfit();
    }
  }, [generateOutfit, outfit]);

  const handleConfirmWorn = async (): Promise<void> => {
    if (!outfit) return;
    setIsMarking(true);
    try {
      await recordOutfit(
        outfit.top.id,
        outfit.bottom.id,
        outfit.outerwear?.id,
        outfit.shoes?.id,
        outfit.accessories?.id,
      );
      await markWorn(outfit.top);
      await markWorn(outfit.bottom);
      if (outfit.outerwear) await markWorn(outfit.outerwear);
      if (outfit.shoes) await markWorn(outfit.shoes);
      if (outfit.accessories) await markWorn(outfit.accessories);
      await clearOutfit();
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
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
              <div className="relative mx-auto w-full max-w-md flex flex-col h-full min-h-0 overflow-hidden">
                <div className={`card flex flex-col items-center relative min-h-0 ${hasExtras ? "gap-3 p-4" : "gap-6 p-6"}`}>
                  <FavouriteButton />
                  {/* Top item */}
                  {outfit.top && isItemClean(outfit.top.id) && (
                    <div className="flex flex-col items-center flex-1 min-h-0 w-full justify-center overflow-hidden">
                      <img
                        src={getImage(outfit.top.id)}
                        alt={outfit.top.name}
                        className="max-h-full w-auto object-contain rounded-xl shrink min-h-0"
                        loading="lazy"
                      />
                      <div className="mt-1 text-sm text-black font-semibold whitespace-nowrap text-ellipsis w-full overflow-hidden text-center shrink-0">
                        {outfit.top.name}
                      </div>
                    </div>
                  )}

                  <div className="w-full border-t border-gray-100 shrink-0" />

                  {/* Bottom item */}
                  {outfit.bottom && isItemClean(outfit.bottom.id) && (
                    <div className="flex flex-col items-center flex-1 min-h-0 w-full justify-center overflow-hidden">
                      <img
                        src={getImage(outfit.bottom.id)}
                        alt={outfit.bottom.name}
                        className="max-h-full w-auto object-contain rounded-xl shrink min-h-0"
                        loading="lazy"
                      />
                      <div className="mt-1 text-sm text-black font-semibold whitespace-nowrap text-ellipsis w-full overflow-hidden text-center shrink-0">
                        {outfit.bottom.name}
                      </div>
                    </div>
                  )}

                  {/* Optional items */}
                  {hasExtras && (
                    <div className="w-full border-t border-gray-100 shrink-0" />
                  )}

                  <div className="flex flex-wrap justify-center gap-4 shrink-0">
                    {outfit.outerwear && isItemClean(outfit.outerwear.id) && (
                      <div className="flex flex-col items-center w-20">
                        <img
                          src={getImage(outfit.outerwear.id)}
                          alt={outfit.outerwear.name}
                          className="w-16 h-16 object-contain rounded-lg"
                          loading="lazy"
                        />
                        <div className="mt-1 text-[10px] leading-tight text-black font-semibold whitespace-nowrap text-ellipsis w-full overflow-hidden text-center">
                          {outfit.outerwear.name}
                        </div>
                      </div>
                    )}
                    {outfit.shoes && isItemClean(outfit.shoes.id) && (
                      <div className="flex flex-col items-center w-20">
                        <img
                          src={getImage(outfit.shoes.id)}
                          alt={outfit.shoes.name}
                          className="w-16 h-16 object-contain rounded-lg"
                          loading="lazy"
                        />
                        <div className="mt-1 text-[10px] leading-tight text-black font-semibold whitespace-nowrap text-ellipsis w-full overflow-hidden text-center">
                          {outfit.shoes.name}
                        </div>
                      </div>
                    )}
                    {outfit.accessories && isItemClean(outfit.accessories.id) && (
                      <div className="flex flex-col items-center w-20">
                        <img
                          src={getImage(outfit.accessories.id)}
                          alt={outfit.accessories.name}
                          className="w-16 h-16 object-contain rounded-lg"
                          loading="lazy"
                        />
                        <div className="mt-1 text-[10px] leading-tight text-black font-semibold whitespace-nowrap text-ellipsis w-full overflow-hidden text-center">
                          {outfit.accessories.name}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleConfirmWorn}
                  disabled={isMarking}
                  className={`primary-button mt-4 mb-2 w-full py-3 flex items-center justify-center gap-2 text-base font-semibold shrink-0 transition-all ${isMarking ? "opacity-50 cursor-not-allowed" : ""}`}
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

</div>
  );
};

export const TodayPage = (): React.JSX.Element => {
  return (
    <div className="flex flex-col flex-1 min-h-screen relative overflow-hidden">
      {/* Header */}
      <div className="w-full mx-auto max-w-4xl px-4 pt-4 shrink-0">
        <h2 className="page-title">Today's outfit</h2>
      </div>

      <div className="w-full mx-auto max-w-4xl px-4 flex-1 flex flex-col items-center justify-center mb-20 overflow-hidden">
        <OutfitTemplate />
      </div>

      <NavigationBar activePage="today" />
      <RegenerateOutfitFab />
    </div>
  );
};
