import * as React from "react";
import { useEffect, useState } from "react";
import NavigationBar from "../components/navigation-bar.tsx";
import type { Outfit } from "../models/outfit.ts";
import { useOutfit } from "../hooks/outfit.ts";
import { useCloset } from "../hooks/closet.ts";
import { useImage } from "../hooks/image.ts";
import { RiAiGenerate } from "react-icons/ri";

interface TouchDragState {
  key: keyof Outfit | null;
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

const EmptyMessageTemplate = () => (
  <div className="relative mx-auto w-full max-w-md h-64 md:h-80 flex items-center justify-center">
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-gray-500 text-lg">No outfit right now.</p>
      <p className="text-gray-400 text-sm">Maybe it's laundry time?</p>
    </div>
  </div>
);
const RegenerateOutfitButton = () => {
  const { generateOutfit, canGenerateOutfit } = useOutfit();

  function onRegenerate(): void {
    generateOutfit();
  }

  return (
    <button
      onClick={() => onRegenerate()}
      aria-label="Regenerate the outfit"
      title="Regenerate the outfit"
      className={`fixed bottom-12 right-5 z-50 shadow-lg border primary-button transition-all`}
      style={{ width: 56, height: 56 }}
      disabled={!canGenerateOutfit()}
    >
      <div className="flex items-center justify-center text-3xl">
        <RiAiGenerate />
      </div>
    </button>
  );
};
const OutfitTemplate = ({
  setTouchDrag,
  touchDrag,
}: {
  setTouchDrag: React.Dispatch<React.SetStateAction<TouchDragState>>;
  touchDrag: TouchDragState;
}): React.JSX.Element => {
  const { getImage } = useImage();
  const { isItemClean, areAllItemsClean, markWorn } = useCloset();
  const { outfit, clearOutfit, generateOutfit } = useOutfit();

  useEffect(() => {
    if (!outfit) {
      generateOutfit();
    }
  }, [generateOutfit, outfit]);

  // Drag is used for desktop
  const handleDragStart = (
    key: keyof Outfit,
    e: React.DragEvent<HTMLDivElement>,
  ) => {
    e.dataTransfer.setData("text/plain", key as string);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    const key = e.dataTransfer.getData("text/plain") as keyof Outfit;
    if (!key) {
      return;
    }

    const item = outfit![key];
    markWorn(item);
    clearOutfit();
  };

  // Touch is used for mobile/tablet
  const handleTouchStart = (
    key: keyof Outfit,
    e: React.TouchEvent<HTMLDivElement>,
  ) => {
    const touch = e.touches[0];
    setTouchDrag({
      key,
      isDragging: true,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
    });
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchDrag.isDragging) {
      return;
    }

    const touch = e.touches[0];
    setTouchDrag((prev) => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
    }));
  };
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchDrag.isDragging || !touchDrag.key || !outfit) {
      setTouchDrag((prev) => ({ ...prev, isDragging: false, key: null }));
      return;
    }

    // Check if touch ended over the basket area
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(
      touch.clientX,
      touch.clientY,
    );
    const basketArea = document.querySelector('[aria-label="Wear basket"]');

    if (
      basketArea &&
      (basketArea.contains(elementBelow) || elementBelow === basketArea)
    ) {
      const item = outfit[touchDrag.key];
      markWorn(item);
      clearOutfit();
    }

    setTouchDrag((prev) => ({ ...prev, isDragging: false, key: null }));
  };

  return (
    <div className="flex-1 flex flex-col px-4 pt-4 overflow-y-auto pb-64">
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
              <div className="relative mx-auto w-full flex flex-col items-center justify-center gap-5">
                {/* Top item */}
                {outfit.top && isItemClean(outfit.top.id) && (
                  <div className="select-none" aria-label="Top item">
                    <div
                      className={`card text-8xl sm:text-9xl cursor-grab ${touchDrag.isDragging && touchDrag.key === "top" ? "opacity-20" : ""}`}
                      draggable
                      onDragStart={(e) => handleDragStart("top", e)}
                      onTouchStart={(e) => handleTouchStart("top", e)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      style={{
                        touchAction: "none",
                      }}
                    >
                      <img
                        src={getImage(outfit.top.id)}
                        alt={outfit["top"].name}
                        className="w-40 h-40 object-contain rounded-xl"
                        loading="lazy"
                      />
                      <div className="mt-2 text-sm text-black font-semibold whitespace-nowrap text-ellipsis w-full overflow-hidden">
                        {outfit.top.name}
                      </div>
                    </div>
                  </div>
                )}
                {/* Bottom item */}
                {outfit.bottom && isItemClean(outfit.bottom.id) && (
                  <div className="select-none" aria-hidden="true">
                    <div
                      className={`card text-8xl sm:text-9xl cursor-grab ${touchDrag.isDragging && touchDrag.key === "bottom" ? "opacity-20" : ""}`}
                      draggable
                      onDragStart={(e) => handleDragStart("bottom", e)}
                      onTouchStart={(e) => handleTouchStart("bottom", e)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      style={{
                        touchAction: "none",
                      }}
                    >
                      <img
                        src={getImage(outfit.bottom.id)}
                        alt={outfit["bottom"].name}
                        className="w-40 h-40 object-contain rounded-xl"
                        loading="lazy"
                      />
                      <div className="mt-2 text-sm text-black font-semibold whitespace-nowrap text-ellipsis w-full overflow-hidden">
                        {outfit.bottom.name}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </>
      ) : (
        <EmptyMessageTemplate />
      )}

      {/* region Basket template */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleDrop(e);
        }}
        className="fixed bottom-16 left-1/2 -translate-x-1/2 p-2 w-64 md:w-80 h-44 md:h-56 flex items-center justify-center"
        aria-label="Wear basket"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
      {/* endregion */}
    </div>
  );
};

export const SuggestPage = (): React.JSX.Element => {
  const { getImage } = useImage();
  const { outfit } = useOutfit();
  const [touchDrag, setTouchDrag] = useState<TouchDragState>({
    key: null,
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  return (
    <>
      {/* Floating preview while dragging an item */}
      {touchDrag.isDragging && touchDrag.key && outfit && (
        <div
          className="fixed pointer-events-none z-50 text-6xl"
          style={{
            left: touchDrag.currentX - 30,
            top: touchDrag.currentY - 30,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="card opacity-80 scale-110 shadow-lg">
            <img
              src={getImage(outfit[touchDrag.key].id)}
              alt={outfit[touchDrag.key].name}
              className="w-48 h-48 object-contain rounded-xl shadow-sm"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-shrink-0 pt-4 pb-2">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="page-title">Today's outfit</h2>
        </div>

        <p className="px-4 text-md text-gray-900 text-center">
          ✨ A fresh outfit is picked for you every day.
        </p>
      </div>

      <OutfitTemplate setTouchDrag={setTouchDrag} touchDrag={touchDrag} />

      <NavigationBar activePage="suggest" />
      <RegenerateOutfitButton />
    </>
  );
};
