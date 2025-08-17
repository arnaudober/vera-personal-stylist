import {useEffect, useMemo, useState} from "react";
import type {ClothingItem, Outfit} from "../model";
import {useCloset} from "../hooks/useCloset.ts";
import Navbar from "../components/navbar.tsx";

function pickFirstClean(items: ClothingItem[], category: ClothingItem["category"]) {
    return items.find(i => i.category === category && i.isClean);
}

function suggestOutfit(items: ClothingItem[]): Outfit | null {
    const top = pickFirstClean(items, "top");
    const bottom = pickFirstClean(items, "bottom");
    const footwear = pickFirstClean(items, "footwear");
    const outerwear = pickFirstClean(items, "outerwear");

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

        if (outfit) {
            localStorage.setItem(storageKey, JSON.stringify({
                top: outfit.top?.id ?? null,
                bottom: outfit.bottom?.id ?? null,
                footwear: outfit.footwear?.id ?? null,
                outerwear: outfit.outerwear?.id ?? null,
            }));
        }
    };

    const onMarkAsWorn = () => {
        if (!todayOutfit) {
            return;
        }

        markWorn(todayOutfit);
    };

    return (<div className="mx-auto max-w-4xl p-4 pb-24">
        <div className="mb-3">
            <h2 className="text-2xl font-semibold text-center">Vera picked this for you ✨</h2>
        </div>

        <div className="rounded-2xl border card p-4">
            {todayOutfit ? (<div>
                <div className="flex flex-col">
                    {todayOutfit.outerwear ? (<div className="flex items-center gap-3 p-4 card">
                        <div className="text-4xl sm:text-5xl">{todayOutfit.outerwear.emoji ?? "🧥"}</div>
                        <div className="text-lg font-medium">{todayOutfit.outerwear.name}</div>
                    </div>) : null}
                    {todayOutfit.top ? (<div className="flex items-center gap-3 p-4 card">
                        <div className="text-4xl sm:text-5xl">{todayOutfit.top.emoji ?? "👚"}</div>
                        <div className="text-lg font-medium">{todayOutfit.top.name}</div>
                    </div>) : null}
                    {todayOutfit.bottom ? (<div className="flex items-center gap-3 p-4 card">
                        <div className="text-4xl sm:text-5xl">{todayOutfit.bottom.emoji ?? "👖"}</div>
                        <div className="text-lg font-medium">{todayOutfit.bottom.name}</div>
                    </div>) : null}
                    {todayOutfit.footwear ? (<div className="flex items-center gap-3 p-4 card">
                        <div className="text-4xl sm:text-5xl">{todayOutfit.footwear.emoji ?? "👟"}</div>
                        <div className="text-lg font-medium">{todayOutfit.footwear.name}</div>
                    </div>) : null}
                </div>
            </div>) : (<div className="text-muted">
                No outfit yet. Hit <span className="font-medium">Dress me</span> to
                get a suggestion. If you’re out of clean options, tap{" "}
                <span className="font-medium">Laundry done</span>.
            </div>)}
        </div>

        <div className="mt-3 flex flex-col gap-3">
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

        <Navbar active="home" onLaundryDone={markLaundryDone}/>
    </div>);
}