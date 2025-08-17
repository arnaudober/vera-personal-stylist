import type {ClothingItem} from "../model";

export function ClothingCard({item}: { item: ClothingItem }) {
    const dotColor = item.isClean ? "var(--color-accent)" : "#374151"; // green for clean, red for dirty

    return (<div className="card flex flex-col items-center text-center">
        <div className="text-7xl">{item.emoji ?? "👚"}</div>

        <div className="mt-2 text-lg font-semibold">{item.name}</div>

        <div className="mt-1 flex items-center gap-2">
                <span
                    className="inline-block rounded-full"
                    style={{width: 12, height: 12, backgroundColor: dotColor}}
                />
            <span className="text-sm font-medium">
                    {item.isClean ? "Clean" : "Dirty"}
                </span>
        </div>
    </div>);
}