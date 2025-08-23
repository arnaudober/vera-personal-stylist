import React, {useMemo} from "react";
import sheetUrl from "../assets/garments-grid.png";

export type GarmentKind =
    | "tshirt"
    | "blazer"
    | "pants"
    | "dress"
    | "skirt"
    | "sneaker"
    | "shorts"
    | "jeans"
    | "hoodie";

type Rect = { x: number; y: number; w: number; h: number };

type Props = {
    kind: GarmentKind; /** Display size in px (final rendered box). Keeps aspect ratio of the rect. */
    rectOverride?: Rect; /** Pixel dimensions of the sheet (natural size). */
    sheetWidth?: number; sheetHeight?: number; /** Extra CSS classes */
    className?: string; /** Rounded corners */
    radius?: number; /** Show an outline + label (for tuning coordinates) */
    debug?: boolean; /** Accessible label */
    alt?: string;
};

/** 🔧 Measure once and put exact numbers here.
 *  These are sane starting points assuming ~1024x1024 sheet with moderate padding.
 *  Fine‑tune by turning on the `debug` prop.
 */
const DEFAULT_SHEET: { w: number; h: number } = {w: 1024, h: 1024};

const RECTS: Record<GarmentKind, Rect> = {
    tshirt: {
        x: 33, y: 40, w: 309, h: 305
    }, blazer: {
        x: 358, y: 34, w: 303, h: 329
    }, pants: {
        x: 733, y: 33, w: 223, h: 420
    }, dress: {
        x: 61, y: 353, w: 253, h: 369
    }, skirt: {
        x: 363, y: 371, w: 297, h: 289
    }, sneaker: {
        x: 678, y: 462, w: 290, h: 184
    }, shorts: {
        x: 59, y: 731, w: 273, h: 258
    }, jeans: {
        x: 407, y: 661, w: 207, h: 335
    }, hoodie: {
        x: 670, y: 648, w: 317, h: 345
    }
};

export default function GarmentSprite({
                                          kind,
                                          rectOverride,
                                          sheetWidth = DEFAULT_SHEET.w,
                                          sheetHeight = DEFAULT_SHEET.h,
                                          className,
                                          radius = 12,
                                          debug = false,
                                          alt,
                                      }: Props) {
    const rect = rectOverride ?? RECTS[kind];

    // Calculate scale to fit within 112px container
    const targetSize = 112;
    const scale = Math.min(targetSize / rect.w, targetSize / rect.h);

    const displayW = rect.w * scale;
    const displayH = rect.h * scale;

    // CSS sprite math: make the background the full sheet size in px,
    // offset it so that our rect appears inside the box.
    const style = useMemo<React.CSSProperties>(() => ({
        width: displayW,
        height: displayH,
        borderRadius: radius,
        backgroundImage: `url(${sheetUrl})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${sheetWidth * scale}px ${sheetHeight * scale}px`,
        backgroundPosition: `${-rect.x * scale}px ${-rect.y * scale}px`,
        imageRendering: "auto", // use "crisp-edges" if you prefer pixel-snappy small sizes
        overflow: "hidden",
        position: "relative",
    }), [displayW, displayH, radius, sheetWidth, sheetHeight, rect.x, rect.y, scale]);

    return (
        <div style={{width: "112px", height: "112px", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div
                role="img"
                aria-label={alt || kind}
                className={className}
                style={style}
                title={alt || kind}
            >
                {debug && (<>
                    {/* outline & label to help alignment while tuning RECTS */}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            border: "1px dashed rgba(255,255,255,.6)",
                            boxShadow: "inset 0 0 0 1px rgba(0,0,0,.4)",
                            borderRadius: radius,
                            pointerEvents: "none",
                        }}
                    />
                    <span
                        style={{
                            position: "absolute",
                            left: 6,
                            top: 6,
                            fontSize: 10,
                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                            background: "rgba(0,0,0,.55)",
                            color: "white",
                            padding: "2px 6px",
                            borderRadius: 6,
                        }}
                    >
            {kind} → {rect.x},{rect.y},{rect.w},{rect.h}
          </span>
                </>)}
            </div>
        </div>);
}