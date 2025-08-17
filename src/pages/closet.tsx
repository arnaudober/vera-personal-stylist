import {useCloset} from "../hooks/useCloset.ts";
import {ClothingCard} from "../components/clothing-card";
import Navbar from "../components/navbar.tsx";

export default function Closet() {
    const {items, toggleClean, markLaundryDone} = useCloset();

    return (
        <div className="mx-auto max-w-4xl p-4 pb-24">
            <div className="mb-3">
                <h2 className="text-2xl font-semibold text-center">Your closet</h2>
            </div>

            {/* TODO: Add a filter bar for categories */}

            <div className="rounded-2xl">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {items.map(item => (
                        <ClothingCard key={item.id} item={item} onToggleClean={toggleClean}/>
                    ))}
                </div>
            </div>

            <Navbar active="closet" onLaundryDone={markLaundryDone} />
        </div>
    );
}