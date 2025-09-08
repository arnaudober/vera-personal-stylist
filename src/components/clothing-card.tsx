import type {ClothingItem} from "../model";
import * as React from "react";
import GarmentGlyph from "./garment-glyph.tsx";

function Pill({children, style, className}: {
    children: React.ReactNode, style?: React.CSSProperties, className?: string
}) {
    return (
        <span className={`inline-block rounded-full border px-2 py-0.5 text-xs pill ${className ?? ""}`} style={style}>
      {children}
    </span>);
}

export function ClothingCard({item}: { item: ClothingItem }) {
    const dotColor = item.isClean ? "var(--color-accent)" : "#374151";

    const renderGlyph = () => {
        return (<GarmentGlyph
            id={item.id}
            kind={item.type}
            alt={item.name}
            color={item.color}
        />);
    };

    return (<div className="suggest-card bg-white p-3 rounded-2xl flex flex-col items-center text-center">
        <div className="text-7xl flex items-center justify-center">{renderGlyph()}</div>

        <div className="mt-2 text-lg font-semibold">{item.name}</div>

        <div className="mt-1">
            <Pill
                style={{
                    backgroundColor: dotColor, color: "#fff", borderColor: "transparent"
                }}
            >
                {item.isClean ? "Clean" : "Dirty"}
            </Pill>
        </div>
    </div>);
}