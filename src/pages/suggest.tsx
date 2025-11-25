import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useCloset } from "../hooks/useCloset.ts";
import NavigationBar from "../components/navigation-bar.tsx";
import LaundryButton from "../components/laundry-button.tsx";
import calculateOutfitLayout from "../utils/outfitLayout.ts";
import { calculateBestOutfit } from "../utils/calculate-best-outfit.ts";
import type { Outfit } from "../models/outfit.ts";
import type { ClothingItem } from "../models/clothing-item.ts";

// TODO: Refactor this page.

const todayDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

export default function Suggest() {
  const { items, markWorn } = useCloset();
  const [todayOutfit, setTodayOutfit] = useState<Outfit | null>(null);
  const storageKey = useMemo(() => `todayOutfit:${todayDate}`, []);
  const droppedKeysStorageKey = useMemo(() => `droppedKeys:${todayDate}`, []);

  // Drag & drop state for the wear basket - now tracking item IDs instead of outfit keys
  const [droppedKeys, setDroppedKeys] = useState<Set<string>>(new Set());

  // Touch drag state for mobile
  const [touchDrag, setTouchDrag] = useState<{
    key: keyof Outfit | null;
    isDragging: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  }>({
    key: null,
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const renderGlyph = (key: keyof Outfit) => {
    const item = todayOutfit?.[key];
    if (!item) {
      return null;
    }

    return (
      <img
        src={item.imageData}
        alt={item.name}
        className="w-24 h-24 object-cover rounded-xl shadow-sm"
        loading="lazy"
      />
    );
  };

  const handleDragStart = (
    key: keyof Outfit,
    e: React.DragEvent<HTMLDivElement>,
  ) => {
    e.dataTransfer.setData("text/plain", key as string);
  };

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
    if (!touchDrag.isDragging) return;

    const touch = e.touches[0];
    setTouchDrag((prev) => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
    }));
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchDrag.isDragging || !touchDrag.key || !todayOutfit) {
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
      const key = touchDrag.key;
      const item = todayOutfit[key];

      if (item && !droppedKeys.has(item.id)) {
        const partial: Partial<Outfit> = { [key]: item } as Partial<Outfit>;
        markWorn(partial as Outfit);
        const newDroppedKeys = new Set([...droppedKeys, item.id]);
        setDroppedKeys(newDroppedKeys);

        // Persist dropped keys to localStorage
        localStorage.setItem(
          droppedKeysStorageKey,
          JSON.stringify([...newDroppedKeys]),
        );
      }
    }

    setTouchDrag((prev) => ({ ...prev, isDragging: false, key: null }));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // Necessary to allow dropping
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!todayOutfit) return;
    const key = e.dataTransfer.getData("text/plain") as keyof Outfit;
    if (!key) return;

    const item = todayOutfit[key as keyof Outfit];
    if (!item || droppedKeys.has(item.id)) return; // Check if item ID already processed

    // Build a partial outfit and mark only the dropped item as worn
    const partial: Partial<Outfit> = { [key]: item } as Partial<Outfit>;
    markWorn(partial as Outfit);

    const newDroppedKeys = new Set([...droppedKeys, item.id]);
    setDroppedKeys(newDroppedKeys);

    // Persist dropped keys to localStorage
    localStorage.setItem(
      droppedKeysStorageKey,
      JSON.stringify([...newDroppedKeys]),
    );
  };

  useEffect(() => {
    const loadTodayOutfit = () => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) {
          return null;
        }

        const outfitIds: string[] = JSON.parse(raw);
        const byId = new Map(items.map((i) => [i.id, i] as const));

        // Get all items from the stored IDs
        const outfitItems = outfitIds
          .map((id) => byId.get(id))
          .filter(Boolean) as ClothingItem[];

        // Check if all items are still clean
        const allClean = outfitItems.every((item) => item.isClean);
        if (!allClean) {
          localStorage.removeItem(storageKey);
          return null;
        }

        // Build the outfit object from the items
        const outfit: Partial<Outfit> = {};
        for (const item of outfitItems) {
          if (item.category === "top") {
            outfit.top = item;
          } else if (item.category === "bottom") {
            outfit.bottom = item;
          }
        }

        return outfit.top && outfit.bottom ? (outfit as Outfit) : null;
      } catch {
        return null;
      }
    };

    const loadDroppedKeys = () => {
      try {
        const raw = localStorage.getItem(droppedKeysStorageKey);
        if (!raw) {
          return new Set<string>();
        }
        const keysArray = JSON.parse(raw);
        return new Set<string>(keysArray);
      } catch {
        return new Set<string>();
      }
    };

    const storedOutfit = loadTodayOutfit();
    const storedDroppedKeys = loadDroppedKeys();

    setDroppedKeys(storedDroppedKeys);

    if (storedOutfit) {
      setTodayOutfit(storedOutfit);
    } else {
      const outfit = calculateBestOutfit(items);
      setTodayOutfit(outfit);

      if (outfit) {
        // Save as a simple array of item IDs
        const outfitIds = Object.values(outfit)
          .filter(Boolean)
          .map((item) => item.id);
        localStorage.setItem(storageKey, JSON.stringify(outfitIds));
      }
    }
  }, [items, storageKey, droppedKeysStorageKey]);

  const EmptyMessage = () => (
    <div className="relative mx-auto w-full max-w-md h-64 md:h-80 flex items-center justify-center">
      <div className="suggest-card rounded-4xl p-4 text-muted text-center">
        No outfit right now — maybe it's laundry time? Tap{" "}
        <span className="font-medium">Laundry</span>.
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-app min-h-screen flex flex-col">
        {/* Floating drag preview for mobile */}
        {touchDrag.isDragging && touchDrag.key && todayOutfit && (
          <div
            className="fixed pointer-events-none z-50 text-6xl"
            style={{
              left: touchDrag.currentX - 30,
              top: touchDrag.currentY - 30,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="p-2 suggest-card rounded-2xl opacity-80 scale-110 shadow-lg">
              {renderGlyph(touchDrag.key as keyof Outfit)}
            </div>
          </div>
        )}

        {/* Header section */}
        <div className="flex-shrink-0 pt-4 pb-2">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="p-2 text-2xl font-semibold text-center">
              Today's outfit
            </h2>
          </div>

          <p className="px-4 text-md text-gray-900 text-center">
            ✨ A fresh outfit is picked for you every day.
          </p>
        </div>

        {/* Main content area - flexible height */}
        <div className="flex-1 flex flex-col justify-center px-4 pb-4">
          {todayOutfit ? (
            <>
              {(() => {
                const layout = calculateOutfitLayout(todayOutfit);
                const topItem = todayOutfit.top;
                const hasVisibleItems =
                  (topItem && !droppedKeys.has(topItem.id)) ||
                  layout.others.some((o) => {
                    const item = todayOutfit[o.key as keyof Outfit];
                    return item && !droppedKeys.has(item.id);
                  });

                if (!hasVisibleItems) {
                  return <EmptyMessage />;
                }

                return (
                  <div className="relative mx-auto w-full max-w-lg h-64 md:h-80 lg:h-96 flex items-center justify-center">
                    {/* Centerpiece */}
                    {topItem && !droppedKeys.has(topItem.id) && (
                      <div
                        className="absolute select-none"
                        style={{
                          left: `${layout.centerPosition.x}%`,
                          top: `${layout.centerPosition.y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                        aria-label="Top item"
                      >
                        <div
                          className={`p-2 suggest-card rounded-4xl text-8xl sm:text-9xl cursor-grab ${touchDrag.isDragging && touchDrag.key === "top" ? "opacity-20" : ""}`}
                          draggable
                          onDragStart={(e) => handleDragStart("top", e)}
                          onTouchStart={(e) => handleTouchStart("top", e)}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          style={{
                            touchAction: "none",
                          }}
                        >
                          {renderGlyph("top")}
                        </div>
                      </div>
                    )}

                    {/* Surrounding items */}
                    {layout.others.map((o, i) => {
                      const item = todayOutfit[o.key as keyof Outfit];
                      return (
                        item &&
                        !droppedKeys.has(item.id) && (
                          <div
                            key={o.key}
                            className="absolute select-none"
                            style={{
                              left: layout.positions[i].left,
                              top: layout.positions[i].top,
                              transform: `translate(-50%, -50%) ${layout.positions[i].rotate} scale(${layout.positions[i].scale})`,
                            }}
                            aria-hidden="true"
                          >
                            <div
                              className={`p-2 md:p-3 suggest-card rounded-2xl text-4xl md:text-5xl lg:text-6xl cursor-grab ${touchDrag.isDragging && touchDrag.key === o.key ? "opacity-20" : ""}`}
                              draggable
                              onDragStart={(e) =>
                                handleDragStart(o.key as keyof Outfit, e)
                              }
                              onTouchStart={(e) =>
                                handleTouchStart(o.key as keyof Outfit, e)
                              }
                              onTouchMove={handleTouchMove}
                              onTouchEnd={handleTouchEnd}
                              style={{
                                touchAction: "none",
                              }}
                            >
                              {renderGlyph(o.key as keyof Outfit)}
                            </div>
                          </div>
                        )
                      );
                    })}
                  </div>
                );
              })()}
            </>
          ) : (
            <EmptyMessage />
          )}

          {/* Basket section - fixed at bottom */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="p-2 w-64 md:w-80 h-44 md:h-56 flex items-center justify-center relative"
            style={{
              marginLeft: "auto",
              marginRight: "auto",
              position: "relative",
              bottom: "-40px",
              zIndex: 0,
            }}
            aria-label="Wear basket"
          >
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ zIndex: 1 }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1/2",
                  backgroundImage: "url(/assets/basket-grid.png)",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "200% 100%",
                  backgroundPosition: droppedKeys.size === 0 ? "0 0" : "94% 0",
                  imageRendering: "auto",
                }}
                aria-label={
                  droppedKeys.size === 0 ? "Empty basket" : "Full basket"
                }
              />
            </div>
          </div>
        </div>
      </div>

      <NavigationBar activePage="suggest" />
      <LaundryButton
        onLaundryDone={() => {
          setDroppedKeys(new Set());
          // Remove dropped keys from localStorage when laundry is done
          localStorage.removeItem(droppedKeysStorageKey);
        }}
      />
    </>
  );
}
