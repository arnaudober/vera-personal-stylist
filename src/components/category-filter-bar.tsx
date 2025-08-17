import * as React from "react";
import {useState} from "react";
import {categories, type Category} from "../model.ts";

interface CategoryFilterBarProps {
    selectedCategory: Category | null;
    onCategoryChange: (category: Category | null) => void;
}

export default function CategoryFilterBar({selectedCategory, onCategoryChange}: CategoryFilterBarProps) {
    const [hasScrolled, setHasScrolled] = useState(false);

    const selectCategory = (category: Category) => {
        onCategoryChange(selectedCategory === category ? null : category);
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollLeft = e.currentTarget.scrollLeft;
        setHasScrolled(scrollLeft > 0);
    };

    return (<div className={`pr-0 pt-0 pb-2 ${hasScrolled ? 'pl-0' : 'pl-4'}`}>
            <div
                className="overflow-x-auto"
                style={{
                    scrollbarWidth: 'none', msOverflowStyle: 'none'
                }}
                onScroll={handleScroll}
            >
                <div className="flex" style={{minWidth: 'max-content'}}>
                    <button
                        onClick={() => onCategoryChange(null)}
                        className={`
                            px-4 py-1 mr-2 rounded-xl text-md font-medium transition-all whitespace-nowrap
                            ${selectedCategory === null ? 'bg-gray-100 text-gray-700' : 'text-gray-700'}
                        `}
                    >
                        All
                    </button>
                    {categories.map(({value, label}) => (<button
                            key={value}
                            onClick={() => selectCategory(value)}
                            className={`
                                px-4 py-1 mr-2 rounded-xl text-md font-medium transition-all whitespace-nowrap
                                ${selectedCategory === value ? 'bg-gray-100  text-gray-700' : 'text-gray-700'}
                            `}
                        >
                            {label}
                        </button>))}
                </div>
            </div>
        </div>);
}
