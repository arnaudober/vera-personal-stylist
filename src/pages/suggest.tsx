import * as React from "react";
import {useEffect, useMemo, useState} from "react";
import type {ClothingItem, Outfit} from "../model";
import {useCloset} from "../hooks/useCloset.ts";
import Navbar from "../components/navbar.tsx";
import LaundryFab from "../components/laundry-fab.tsx";
import calculateOutfitLayout from "../utils/outfitLayout.ts";
import GarmentGlyph from "../components/garment-glyph.tsx";
import {BasketSprite} from "../components/basket-sprite.tsx";

function suggestOutfit(items: ClothingItem[]): Outfit | null {
    const cleanItems = items.filter(i => i.isClean);

    // First, pick a bottom piece
    const bottoms = cleanItems.filter(i => i.category === "bottom");
    if (bottoms.length === 0) return null;

    const bottom = bottoms[Math.floor(Math.random() * bottoms.length)];

    // Determine if we need a top based on the bottom type
    let top: ClothingItem | undefined;
    const needsTop = !['dress'].includes(bottom.type); // dresses don't need tops

    if (needsTop) {
        const tops = cleanItems.filter(i => i.category === "top");
        if (tops.length === 0) return null;
        top = tops[Math.floor(Math.random() * tops.length)];
    }

    // Pick footwear
    const footwearItems = cleanItems.filter(i => i.category === "footwear");
    if (footwearItems.length === 0) return null;
    const footwear = footwearItems[Math.floor(Math.random() * footwearItems.length)];

    // Pick outerwear (optional)
    const outerwearItems = cleanItems.filter(i => i.category === "outerwear");
    const outerwear = outerwearItems.length > 0 ? outerwearItems[Math.floor(Math.random() * outerwearItems.length)] : undefined;

    // Validate minimum requirements
    if (!footwear || (needsTop && !top)) {
        return null;
    }

    return {top, bottom, footwear, outerwear};
}


const todayDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

export default function Suggest() {
    const {items, markLaundryDone, markWorn} = useCloset();
    const [todayOutfit, setTodayOutfit] = useState<Outfit | null>(null);
    const storageKey = useMemo(() => `todayOutfit:${todayDate}`, []);

    // Drag & drop state for the wear basket
    const [droppedKeys, setDroppedKeys] = useState<Set<keyof Outfit>>(new Set());

    // Touch drag state for mobile
    const [touchDrag, setTouchDrag] = useState<{
        key: keyof Outfit | null;
        isDragging: boolean;
        startX: number;
        startY: number;
        currentX: number;
        currentY: number;
    }>({
        key: null, isDragging: false, startX: 0, startY: 0, currentX: 0, currentY: 0
    });

    const renderGlyph = (key: keyof Outfit, size: number) => {
        const item = todayOutfit?.[key];
        if (!item) {
            return null;
        }

        return (<GarmentGlyph
            kind={item.type}
            size={size}
            alt={item.name}
        />);
    };

    const handleDragStart = (key: keyof Outfit, e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('text/plain', key as string);
    };

    const handleTouchStart = (key: keyof Outfit, e: React.TouchEvent<HTMLDivElement>) => {
        const touch = e.touches[0];
        setTouchDrag({
            key,
            isDragging: true,
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY
        });
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!touchDrag.isDragging) return;

        const touch = e.touches[0];
        setTouchDrag(prev => ({
            ...prev, currentX: touch.clientX, currentY: touch.clientY
        }));
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!touchDrag.isDragging || !touchDrag.key || !todayOutfit) {
            setTouchDrag(prev => ({...prev, isDragging: false, key: null}));
            return;
        }

        // Check if touch ended over the basket area
        const touch = e.changedTouches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const basketArea = document.querySelector('[aria-label="Wear basket"]');

        if (basketArea && (basketArea.contains(elementBelow) || elementBelow === basketArea)) {
            const key = touchDrag.key;
            if (droppedKeys.has(key)) {
                setTouchDrag(prev => ({...prev, isDragging: false, key: null}));
                return;
            }

            const item = todayOutfit[key];
            if (item) {
                const partial: Partial<Outfit> = {[key]: item} as Partial<Outfit>;
                markWorn(partial as Outfit);
                setDroppedKeys(prev => new Set([...prev, key]));
            }
        }

        setTouchDrag(prev => ({...prev, isDragging: false, key: null}));
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        // Necessary to allow dropping
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!todayOutfit) return;
        const key = e.dataTransfer.getData('text/plain') as keyof Outfit;
        if (!key) return;
        if (droppedKeys.has(key)) return; // already processed

        const item = todayOutfit[key as keyof Outfit];
        if (!item) return; // nothing to mark for this key

        // Build a partial outfit and mark only the dropped item as worn
        const partial: Partial<Outfit> = {[key]: item} as Partial<Outfit>;
        markWorn(partial as Outfit);

        setDroppedKeys(prev => new Set([...prev, key]));
    };

    useEffect(() => {
        const loadTodayOutfit = () => {
            try {
                const raw = localStorage.getItem(storageKey);
                if (!raw) {
                    return null;
                }

                const outfitIds = JSON.parse(raw);
                const byId = new Map(items.map(i => [i.id, i] as const));
                const pieces = {
                    top: outfitIds.top ? byId.get(outfitIds.top) : undefined,
                    bottom: outfitIds.bottom ? byId.get(outfitIds.bottom) : undefined,
                    footwear: outfitIds.footwear ? byId.get(outfitIds.footwear) : undefined,
                    outerwear: outfitIds.outerwear ? byId.get(outfitIds.outerwear) : undefined
                };

                return pieces.top && pieces.bottom && pieces.footwear ? pieces : null;
            } catch {
                return null;
            }
        };

        const storedOutfit = loadTodayOutfit();
        if (storedOutfit) {
            setTodayOutfit(storedOutfit);
        } else {
            const outfit = suggestOutfit(items);
            setTodayOutfit(outfit);

            if (outfit) {
                localStorage.setItem(storageKey, JSON.stringify({
                    top: outfit.top?.id ?? null,
                    bottom: outfit.bottom?.id ?? null,
                    footwear: outfit.footwear?.id ?? null,
                    outerwear: outfit.outerwear?.id ?? null,
                }));
            }
        }
    }, [items, storageKey]);

    const EmptyMessage = () => (
        <div className="relative mx-auto w-full max-w-md h-64 md:h-80 flex items-center justify-center">
            <div className="suggest-card rounded-4xl p-4 text-muted text-center">
                No outfit right now — maybe it's laundry time? Tap <span className="font-medium">Laundry</span>.
            </div>
        </div>);

    return (<>
        <div className="bg-app min-h-screen flex flex-col">
            {/* Floating drag preview for mobile */}
            {touchDrag.isDragging && touchDrag.key && todayOutfit && (<div
                className="fixed pointer-events-none z-50 text-6xl"
                style={{
                    left: touchDrag.currentX - 30, top: touchDrag.currentY - 30, transform: 'translate(-50%, -50%)',
                }}
            >
                <div className="p-2 suggest-card rounded-2xl opacity-80 scale-110 shadow-lg">
                    {renderGlyph(touchDrag.key as keyof Outfit, 84)}
                </div>
            </div>)}

            {/* Header section */}
            <div className="flex-shrink-0 pt-4 pb-2">
                <div className="mx-auto max-w-4xl px-4">
                    <h2 className="p-2 text-2xl font-semibold text-center">Today's outfit</h2>
                </div>

                <p className="px-4 text-md text-gray-900 text-center">
                    ✨ A fresh outfit is picked for you every day.
                </p>
            </div>

            {/* Main content area - flexible height */}
            <div className="flex-1 flex flex-col justify-center px-4 pb-4">
                {todayOutfit ? (<div>
                    {(() => {
                        const layout = calculateOutfitLayout(todayOutfit);
                        const hasVisibleItems = !droppedKeys.has('top') || layout.others.some(o => !droppedKeys.has(o.key as keyof Outfit));

                        if (!hasVisibleItems) {
                            return <EmptyMessage/>;
                        }

                        return (<div
                            className="relative mx-auto w-full max-w-lg h-64 md:h-80 lg:h-96 flex items-center justify-center">
                            {/* Centerpiece */}
                            {!droppedKeys.has('top') && (<div
                                className="absolute select-none"
                                style={{
                                    left: `${layout.centerPosition.x}%`,
                                    top: `${layout.centerPosition.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                                aria-label="Top item"
                            >
                                <div
                                    className={`p-2 suggest-card rounded-4xl text-8xl sm:text-9xl cursor-grab ${touchDrag.isDragging && touchDrag.key === 'top' ? 'opacity-20' : ''}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart('top', e)}
                                    onTouchStart={(e) => handleTouchStart('top', e)}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                    style={{
                                        touchAction: 'none'
                                    }}
                                >{renderGlyph('top', 128)}</div>
                            </div>)}

                            {/* Surrounding items */}
                            {layout.others.map((o, i) => (!droppedKeys.has(o.key as keyof Outfit) && (<div
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
                                    className={`p-2 md:p-3 suggest-card rounded-2xl text-4xl md:text-5xl lg:text-6xl cursor-grab ${touchDrag.isDragging && touchDrag.key === o.key ? 'opacity-20' : ''}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(o.key as keyof Outfit, e)}
                                    onTouchStart={(e) => handleTouchStart(o.key as keyof Outfit, e)}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                    style={{
                                        touchAction: 'none'
                                    }}
                                >{renderGlyph(o.key as keyof Outfit, 84)}</div>
                            </div>)))}
                        </div>);
                    })()}
                </div>) : (<EmptyMessage/>)}
            </div>

            {/* Basket section - fixed at bottom */}
            <div className="flex-shrink-0 px-4 pb-20" style={{zIndex: 0}}>
                <div className="flex justify-center">
                    <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className="p-2 w-64 md:w-80 h-44 md:h-56 flex items-center justify-center relative"
                        aria-label="Wear basket"
                    >
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
                             style={{zIndex: 1}}>
                            <BasketSprite isEmpty={droppedKeys.size === 0}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Navbar active="home"/>
        <LaundryFab onLaundryDone={() => {
            markLaundryDone();
            setDroppedKeys(new Set());
        }}/>
    </>);
}