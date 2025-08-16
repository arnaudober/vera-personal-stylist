import {useEffect, useMemo, useState} from "react";
import type {ClothingItem, Outfit} from "../model";
import {useCloset} from "../hooks/useCloset.ts";
import {ClothingCard} from "../components/clothing-card.tsx";
import Header from "../components/header";

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

function dateKey(d: Date = new Date()) {
    // YYYY-MM-DD
    return d.toISOString().slice(0, 10);
}

type OutfitIds = { top?: string | null; bottom?: string | null; footwear?: string | null; outerwear?: string | null };

function outfitToIds(outfit: Outfit | null): OutfitIds | null {
    if (!outfit) return null;
    return {
        top: outfit.top?.id ?? null,
        bottom: outfit.bottom?.id ?? null,
        footwear: outfit.footwear?.id ?? null,
        outerwear: outfit.outerwear?.id ?? null,
    };
}

function idsToOutfit(ids: OutfitIds | null, items: ClothingItem[]): Outfit | null {
    if (!ids) return null;
    const byId = new Map(items.map(i => [i.id, i] as const));
    const top = ids.top ? byId.get(ids.top) : undefined;
    const bottom = ids.bottom ? byId.get(ids.bottom) : undefined;
    const footwear = ids.footwear ? byId.get(ids.footwear) : undefined;
    const outerwear = ids.outerwear ? byId.get(ids.outerwear) : undefined;
    if (!top || !bottom || !footwear) return null;
    return { top, bottom, footwear, outerwear };
}

export default function Home() {
    const {items, markLaundryDone, toggleClean, markWorn} = useCloset();
    const [todayOutfit, setTodayOutfit] = useState<Outfit | null>(null);
    const [lastWornISO, setLastWornISO] = useState<string | null>(null);

    const storageKey = useMemo(() => `todayOutfit:${dateKey()}`, []);

    // Load or initialize today's outfit
    useEffect(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                const parsed: OutfitIds = JSON.parse(raw);
                const restored = idsToOutfit(parsed, items);
                if (restored) {
                    setTodayOutfit(restored);
                    return;
                }
            }
            // If nothing stored (or failed to restore), auto-suggest and persist
            const suggestion = suggestOutfit(items);
            setTodayOutfit(suggestion);
            localStorage.setItem(storageKey, JSON.stringify(outfitToIds(suggestion)));
        } catch {
            // Fallback: just set suggestion without storage
            const suggestion = suggestOutfit(items);
            setTodayOutfit(suggestion);
        }
        // we intentionally depend on items so that we can rebuild outfit objects from ids if items change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, storageKey]);

    const onDressMe = () => {
        const outfit = suggestOutfit(items);
        setTodayOutfit(outfit);
        try {
            localStorage.setItem(storageKey, JSON.stringify(outfitToIds(outfit)));
        } catch {
            // ignore storage errors
        }
    };

    const onWoreThis = () => {
        if (!todayOutfit) return;
        const wornIds = Object.values(todayOutfit)
            .filter(Boolean)
            .map(i => (i as ClothingItem).id);
        markWorn(wornIds);
        setLastWornISO(new Date().toISOString());
        // Do not clear today's outfit so it remains the same across navigation
    };

    const onClear = () => {
        setTodayOutfit(null);
        try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
    };

    return (
        <div className="mx-auto max-w-4xl p-4">
            <Header active="home" onLaundryDone={markLaundryDone} />

            <div className="rounded-2xl border card p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-medium">Today’s suggestion</h2>
                    {lastWornISO ? (
                        <span className="text-xs text-muted">
                          Last worn: {new Date(lastWornISO).toLocaleString()}
                        </span>
                    ) : null}
                </div>

                {todayOutfit ? (
                    <div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {todayOutfit.top ? (
                                <ClothingCard item={todayOutfit.top} onToggleClean={(id) => toggleClean(id)}/>
                            ) : null}
                            {todayOutfit.bottom ? (
                                <ClothingCard item={todayOutfit.bottom} onToggleClean={(id) => toggleClean(id)}/>
                            ) : null}
                            {todayOutfit.footwear ? (
                                <ClothingCard item={todayOutfit.footwear} onToggleClean={(id) => toggleClean(id)}/>
                            ) : null}
                            {todayOutfit.outerwear ? (
                                <ClothingCard item={todayOutfit.outerwear} onToggleClean={(id) => toggleClean(id)}/>
                            ) : null}
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={onWoreThis}
                                className="rounded-xl btn-accent px-4 py-2 text-white shadow-sm"
                            >
                                I wore this
                            </button>
                            <button
                                onClick={onClear}
                                className="rounded-xl border px-4 py-2 btn-ghost"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-muted">
                        No outfit yet. Hit <span className="font-medium">Dress me</span> to
                        get a suggestion. If you’re out of clean options, tap{" "}
                        <span className="font-medium">Laundry done</span>.
                    </div>
                )}

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={onDressMe}
                        className="rounded-xl btn-accent px-4 py-2 text-white shadow-sm"
                    >
                        Dress me
                    </button>
                </div>
            </div>
        </div>
    );
}