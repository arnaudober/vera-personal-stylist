import {useEffect, useMemo, useState} from "react";
import type {ClothingItem, Outfit} from "../model";
import {useCloset} from "../hooks/useCloset.ts";
import Navbar from "../components/navbar.tsx";
import LaundryFab from "../components/laundry-fab.tsx";
import calculateOutfitLayout from "../utils/outfitLayout.ts";

function pickRandomClean(items: ClothingItem[], category: ClothingItem["category"]) {
    const cleanItems = items.filter(i => i.category === category && i.isClean);
    if (cleanItems.length === 0) return undefined;

    const randomIndex = Math.floor(Math.random() * cleanItems.length);
    return cleanItems[randomIndex];
}

function suggestOutfit(items: ClothingItem[]): Outfit | null {
    const top = pickRandomClean(items, "top");
    const bottom = pickRandomClean(items, "bottom");
    const footwear = pickRandomClean(items, "footwear");
    const outerwear = pickRandomClean(items, "outerwear");

    if (!top || !bottom || !footwear) {
        return null;
    }

    return {top, bottom, footwear, outerwear};
}

const todayDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

export default function Suggest() {
    const {items, markLaundryDone, markWorn} = useCloset();
    const [todayOutfit, setTodayOutfit] = useState<Outfit | null>(null);
    const storageKey = useMemo(() => `todayOutfit:${todayDate}`, []);

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

    const onMarkAsWorn = () => {
        if (!todayOutfit) {
            return;
        }

        markWorn(todayOutfit);
        const outfit = suggestOutfit(items);
        setTodayOutfit(outfit);

        if (!outfit) {
            localStorage.removeItem(storageKey);
            return;
        }

        localStorage.setItem(storageKey, JSON.stringify({
            top: outfit.top?.id ?? null,
            bottom: outfit.bottom?.id ?? null,
            footwear: outfit.footwear?.id ?? null,
            outerwear: outfit.outerwear?.id ?? null,
        }));
    };

    return (<>
        <div className="bg-app min-h-screen pb-28">
            <div className="mx-auto max-w-4xl p-4 pb-2">
                <h2 className="p-2 text-2xl font-semibold text-center">Today's outfit</h2>
            </div>

            <div className="px-4">
                <div className="suggest-card rounded-3xl">
                    {todayOutfit ? (<div>
                        {(() => {
                            const layout = calculateOutfitLayout(todayOutfit);

                            return (
                                <div className="relative mx-auto aspect-square max-w-[500px] w-full p-10">
                                    {/* Centerpiece */}
                                    <div
                                        className="absolute select-none"
                                        style={{
                                            left: `${layout.centerPosition.x}%`,
                                            top: `${layout.centerPosition.y}%`,
                                            transform: 'translate(-50%, -50%)',
                                        }}
                                        aria-label="Top item"
                                    >
                                        <div className="text-8xl sm:text-9xl">{layout.centerEmoji}</div>
                                    </div>

                                    {/* Surrounding items */}
                                    {layout.others.map((o, i) => (
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
                                            <div className="text-5xl sm:text-6xl">{o.emoji}</div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>) : (<div className="p-4 text-muted">
                        No outfit yet. Hit <span className="font-medium">See another option</span> to
                        get a suggestion. If you’re out of clean options, tap{" "}
                        <span className="font-medium">Laundry</span>.
                    </div>)}
                </div>
            </div>

            <p className="p-4 pt-3 text-sm text-gray-500 text-center">
                Suggestion is refreshed every day.
            </p>

            <div className="px-4 pt-6 flex justify-center">
                <button
                    onClick={onMarkAsWorn}
                    disabled={!todayOutfit}
                    className="btn-cta font-medium bg-white rounded-4xl text-2xl p-3 px-16 w-auto text-accent"
                >
                    Mark as worn
                </button>
            </div>
        </div>

        <Navbar active="home"/>
        <LaundryFab onLaundryDone={markLaundryDone}/>
    </>);
}