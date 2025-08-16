import {useCloset} from "../hooks/useCloset.ts";
import {ClothingCard} from "../components/clothing-card";
import Header from "../components/header";

export default function Closet() {
    const {items, cleanCounts, toggleClean, markLaundryDone} = useCloset();

    return (
        <div className="mx-auto max-w-4xl p-4">
            <Header active="closet" onLaundryDone={markLaundryDone} />

            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-medium">Your closet</h2>
                <div className="text-sm text-muted">
                    Clean — Tops: <b>{cleanCounts.top}</b> · Bottoms: <b>{cleanCounts.bottom}</b> ·
                    Shoes: <b>{cleanCounts.footwear}</b>
                </div>
            </div>

            <div className="rounded-2xl border card p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {items.map(item => (
                        <ClothingCard key={item.id} item={item} onToggleClean={toggleClean}/>
                    ))}
                </div>
            </div>
        </div>
    );
}