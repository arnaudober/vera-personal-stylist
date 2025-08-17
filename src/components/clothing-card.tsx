// src/components/ClothingCard.tsx
import * as React from "react";
import type {ClothingItem} from "../model";

function Pill({children}: { children: React.ReactNode }) {
    return (
        <span className="inline-block rounded-full border px-2 py-0.5 text-xs pill">
      {children}
    </span>
    );
}

export function ClothingCard({
                                 item,
                                 onToggleClean,
                             }: {
    item: ClothingItem;
    onToggleClean: (id: string) => void;
}) {
    return (
        <div className="flex items-center justify-between rounded-xl card border p-3">
            <div className="flex items-center gap-3">
                <div className="text-2xl">{item.emoji ?? "👚"}</div>
                <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="mt-0.5 flex items-center gap-2">
                        <Pill>{item.isClean ? "clean" : "dirty"}</Pill>
                        {item.wornCount > 0 ? <Pill>worn {item.wornCount}×</Pill> : null}
                    </div>
                </div>
            </div>
            <button
                onClick={() => onToggleClean(item.id)}
                className={`rounded-lg px-3 py-1 text-sm transition ${
                    item.isClean
                        ? "border btn-ghost"
                        : "btn-accent text-white"
                }`}
            >
                {item.isClean ? "Mark dirty" : "Mark clean"}
            </button>
        </div>
    );
}