import {useEffect, useMemo, useState} from "react";
import type {ClothingItem, Outfit} from "../model";
import {useCloset} from "../hooks/useCloset.ts";
import Navbar from "../components/navbar.tsx";
import LaundryFab from "../components/laundry-fab.tsx";

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

export default function Home() {
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

    const onSeeAnotherOption = () => {
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

    const onMarkAsWorn = () => {
        if (!todayOutfit) {
            return;
        }

        markWorn(todayOutfit);
        onSeeAnotherOption();
    };

    return (<>
        <div className="mx-auto max-w-4xl p-4">
            <h2 className="p-2 text-2xl font-semibold text-center">Vera picked this for you ✨</h2>
        </div>

        <div className="pl-4 pr-4">
            <div className="border rounded-xl card">
                {todayOutfit ? (<div>
                    <div className="flex flex-col">
                        {todayOutfit.outerwear ? (<div className="flex items-center gap-3 p-4 pb-0 card">
                            <div className="text-4xl sm:text-5xl">{todayOutfit.outerwear.emoji ?? "🧥"}</div>
                            <div className="text-lg font-medium">{todayOutfit.outerwear.name}</div>
                        </div>) : null}
                        {todayOutfit.top ? (<div className="flex items-center gap-3 p-4 pb-0 card">
                            <div className="text-4xl sm:text-5xl">{todayOutfit.top.emoji ?? "👚"}</div>
                            <div className="text-lg font-medium">{todayOutfit.top.name}</div>
                        </div>) : null}
                        {todayOutfit.bottom ? (<div className="flex items-center gap-3 p-4 pb-0 card">
                            <div className="text-4xl sm:text-5xl">{todayOutfit.bottom.emoji ?? "👖"}</div>
                            <div className="text-lg font-medium">{todayOutfit.bottom.name}</div>
                        </div>) : null}
                        {todayOutfit.footwear ? (<div className="flex items-center gap-3 p-4 card">
                            <div className="text-4xl sm:text-5xl">{todayOutfit.footwear.emoji ?? "👟"}</div>
                            <div className="text-lg font-medium">{todayOutfit.footwear.name}</div>
                        </div>) : null}
                    </div>
                </div>) : (<div className="p-4 text-muted">
                    No outfit yet. Hit <span className="font-medium">See another option</span> to
                    get a suggestion. If you’re out of clean options, tap{" "}
                    <span className="font-medium">Laundry</span>.
                </div>)}
            </div>
        </div>

        <p className="p-4 pt-3 text-sm text-muted text-center">
            Based on what’s clean and unworn lately.
        </p>

        <div className="p-4 pt-0 flex flex-col gap-3">
            <button
                onClick={onMarkAsWorn}
                disabled={!todayOutfit}
                className="w-full rounded-xl border px-4 py-3 btn-accent disabled:opacity-60 disabled:cursor-not-allowed"
            >
                Mark as worn
            </button>
            <button
                onClick={onSeeAnotherOption}
                className="w-full rounded-xl border px-4 py-3 btn-ghost"
            >
                See another option
            </button>
        </div>

        <Navbar active="home"/>
        <LaundryFab onLaundryDone={markLaundryDone} />
    </>);
}