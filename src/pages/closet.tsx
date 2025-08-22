import {useState} from "react";
import {useCloset} from "../hooks/useCloset.ts";
import {ClothingCard} from "../components/clothing-card";
import Navbar from "../components/navbar.tsx";
import LaundryFab from "../components/laundry-fab.tsx";
import CategoryFilterBar from "../components/category-filter-bar.tsx";
import {type Category} from "../model.ts";

export default function Closet() {
    const {items, markLaundryDone} = useCloset();
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const filteredItems = selectedCategory === null ? items : items.filter(item => item.category === selectedCategory);

    return (<>
        <div className="bg-app min-h-screen pb-28">
            <div className="mx-auto max-w-4xl p-4 pb-2">
                <h2 className="p-2 text-2xl font-semibold text-center">Your closet</h2>
            </div>

            <CategoryFilterBar 
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
            />

            <div className="mx-auto max-w-4xl p-4">
                <div className="rounded-2xl">
                    <div className="grid gap-5 grid-cols-2">
                        {filteredItems.map(item => (<ClothingCard key={item.id} item={item} />))}
                    </div>
                </div>
            </div>
        </div>

        <Navbar active="closet"/>
        <LaundryFab onLaundryDone={markLaundryDone} />
    </>);
}