import {useState} from "react";
import {useCloset} from "../hooks/useCloset.ts";
import {ClothingCard} from "../components/clothing-card";
import Navbar from "../components/navbar.tsx";
import LaundryFab from "../components/laundry-fab.tsx";
import CategoryFilterBar from "../components/category-filter-bar.tsx";
import {type Category} from "../model.ts";
import UploadModal from "../components/upload-modal.tsx";

export default function Closet() {
    const {items, markLaundryDone, addItem} = useCloset();
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [showUpload, setShowUpload] = useState(false);

    const filteredItems = selectedCategory === null ? items : items.filter(item => item.category === selectedCategory);

    return (<>
        <div className="bg-app min-h-screen pb-28">
            <div className="mx-auto max-w-4xl p-4 pb-2">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="p-2 text-2xl font-semibold">Your closet</h2>
                    <button
                        className="rounded-xl bg-black text-white px-4 py-2 text-base"
                        onClick={() => setShowUpload(true)}
                    >Add item</button>
                </div>
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

        {showUpload && (
            <UploadModal
                onClose={() => setShowUpload(false)}
                onSave={(item) => {
                    addItem(item);
                }}
            />
        )}
    </>);
}