import {useState} from "react";
import {useCloset} from "../hooks/useCloset.ts";
import {ClothingCard} from "../components/clothing-card";
import Navbar from "../components/navbar.tsx";
import {categories, type Category} from "../model.ts";

export default function Closet() {
    const {items, toggleClean, markLaundryDone} = useCloset();
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const filteredItems = selectedCategory === null ? items : items.filter(item => item.category === selectedCategory);

    const selectCategory = (category: Category) => {
        setSelectedCategory(prev => prev === category ? null : category);
    };

    return (<>
            <div className="mx-auto max-w-4xl p-4">
                <h2 className="p-2 text-2xl font-semibold text-center">Your closet</h2>
            </div>

            <div className="pl-4">
                <div
                    className="overflow-x-auto"
                    style={{
                        scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitScrollbar: {display: 'none'}
                    }}
                >
                    <div className="flex" style={{minWidth: 'max-content'}}>
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`
                                px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                                ${selectedCategory === null ? 'bg-gray-100 text-gray-700' : 'text-gray-700'}
                            `}
                        >
                            All
                        </button>
                        {categories.map(({value, label}) => (<button
                                key={value}
                                onClick={() => selectCategory(value)}
                                className={`
                                    px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                                    ${selectedCategory === value ? 'bg-gray-100  text-gray-700' : 'text-gray-700'}
                                `}
                            >
                                {label}
                            </button>))}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-4xl p-4 pb-24">
                <div className="rounded-2xl">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {filteredItems.map(item => (
                            <ClothingCard key={item.id} item={item} onToggleClean={toggleClean}/>))}
                    </div>
                </div>

                <Navbar active="closet" onLaundryDone={markLaundryDone}/>
            </div>
        </>);
}