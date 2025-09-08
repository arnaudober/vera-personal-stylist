import React from "react";

export type GarmentKind =
    | "tshirt"
    | "blazer"
    | "shirt"
    | "polo"
    | "hoodie"
    | "sweater"
    | "jeans"
    | "chinos"
    | "shorts"
    | "skirt";

type Props = {
    id: string;
    kind: GarmentKind;
    className?: string;
    size?: number;
    radius?: number;
    debug?: boolean;
    alt?: string;
    color?: string;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const hexToRgb = (hex: string) => {
    const m = hex.replace("#", "");
    const v = m.length === 3 ? m.split("").map(c => c + c).join("") : m;
    const r = parseInt(v.slice(0, 2), 16);
    const g = parseInt(v.slice(2, 4), 16);
    const b = parseInt(v.slice(4, 6), 16);
    return {r, g, b};
};
const rgbToHex = ({r, g, b}: {
    r: number; g: number; b: number
}) => "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");

const getLuminance = (hex: string) => {
    const {r, g, b} = hexToRgb(hex);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

/** Slightly darken a hex colour */
const darken = (hex: string, amount = 0.18) => {
    try {
        const {r, g, b} = hexToRgb(hex);
        const dr = Math.round(r * (1 - amount));
        const dg = Math.round(g * (1 - amount));
        const db = Math.round(b * (1 - amount));
        return rgbToHex({r: dr, g: dg, b: db});
    } catch {
        return "#666666";
    }
};

/** Compute a soft highlight colour */
const lighten = (hex: string, amount = 0.18) => {
    try {
        const {r, g, b} = hexToRgb(hex);
        const lr = Math.round(r + (255 - r) * amount);
        const lg = Math.round(g + (255 - g) * amount);
        const lb = Math.round(b + (255 - b) * amount);
        return rgbToHex({r: lr, g: lg, b: lb});
    } catch {
        return "#aaaaaa";
    }
};

/** Makes a unique suffix per item so <defs> IDs don’t collide */
const suf = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, "").slice(-10) || "x";

const CANVAS = {w: 120, h: 120};

/** Stroke width scales with the icon size (visually balanced from 48 to 160 px). */
const strokeForSize = (size: number) => {
    const t = clamp01((size - 48) / (160 - 48)); // 0..1
    return 1 + 0.8 * t; // 1..1.8
};

/** Choose a high-contrast outline automatically if none is provided. */
const autoOutline = (fill: string) => {
    const lum = getLuminance(fill);
    // for very light fills, pick a deep seam; for very dark, pick a light seam.
    return lum > 0.72 ? darken(fill, 0.75) : lighten(fill, 0.72);
};

/** Decide which paint (solid, gradient, or pattern) to use. */
const fillRef = (id: string) => {
    return `url(#g-${suf(id)})`;
};

/** Shared defs (gradient + optional patterns + subtle shadow) */
const SharedDefs = ({id, base}: { id: string; base: string; }) => {
    const hi = lighten(base, 0.22);
    const lo = darken(base, 0.1);
    return (<defs>
        {<linearGradient id={`g-${suf(id)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hi} stopOpacity="0.9"/>
            <stop offset="60%" stopColor={base} stopOpacity="1"/>
            <stop offset="100%" stopColor={lo} stopOpacity="1"/>
        </linearGradient>}

        <filter id={`shadow-${suf(id)}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.2" stdDeviation="1.2" floodOpacity="0.18"/>
        </filter>
    </defs>);
};

const GarmentSVG: React.FC<Props & { fillColor: string; outline: string; }> = ({
                                                                                   id,
                                                                                   kind,
                                                                                   fillColor,
                                                                                   outline,
                                                                                   size = 112,
                                                                                   debug,

                                                                               }) => {
    const sw = strokeForSize(size);
    const fillUrl = fillRef(id);
    const fillSolid = undefined;

    return (<svg
        role="img"
        aria-label={kind}
        viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
        width={size}
        height={size}
        style={{display: "block"}}
    >
        <SharedDefs id={id} base={fillColor}/>
        {/* Optional debug box */}
        {debug && (<rect
            x="1" y="1" width={CANVAS.w - 2} height={CANVAS.h - 2}
            rx="10"
            fill="none"
            stroke="rgba(255,0,0,.35)"
            strokeDasharray="4 3"
        />)}

        {(() => {
            const fill = fillUrl || fillSolid || fillColor;
            switch (kind) {
                case "tshirt": {
                    return (<g filter={`url(#shadow-${suf(id)})`}>
                        <path d="M30 30 L45 22 L75 22 L90 30 L90 48 L82 48 L82 98 L38 98 L38 48 L30 48 Z"
                              fill={fill} stroke={outline} strokeWidth={sw} strokeLinejoin="round"/>
                        <path d="M30 30 L18 42 L26 52 L38 48 L38 38 Z" fill={fill} stroke={outline}
                              strokeWidth={sw}/>
                        <path d="M90 30 L102 42 L94 52 L82 48 L82 38 Z" fill={fill} stroke={outline}
                              strokeWidth={sw}/>
                        <path d="M50 22 Q60 16 70 22" fill="none" stroke={outline} strokeOpacity=".55"
                              strokeWidth={sw * 0.7}/>
                    </g>);
                }
                case "shirt": {
                    return (<g filter={`url(#shadow-${suf(id)})`}>
                        <path d="M28 28 L44 20 L76 20 L92 28 L92 46 L84 46 L84 100 L36 100 L36 46 L28 46 Z"
                              fill={fill} stroke={outline} strokeWidth={sw}/>
                        <path d="M28 28 L16 42 L24 52 L36 46 L36 36 Z" fill={fill} stroke={outline}
                              strokeWidth={sw}/>
                        <path d="M92 28 L104 42 L96 52 L84 46 L84 36 Z" fill={fill} stroke={outline}
                              strokeWidth={sw}/>
                        <path d="M44 20 L55 32 L60 26 L65 32 L76 20" fill="none" stroke={outline}
                              strokeWidth={sw} strokeLinejoin="round"/>
                        <line x1="60" y1="26" x2="60" y2="98" stroke={outline} strokeWidth={sw * 0.7}/>
                        {[38, 50, 62, 74, 86].map((y, i) => (
                            <circle key={i} cx="60" cy={y} r={sw * 0.6} fill={outline}/>))}
                    </g>);
                }
                case "polo": {
                    return (<g filter={`url(#shadow-${suf(id)})`}>
                        <path d="M30 30 L45 22 L75 22 L90 30 L90 48 L82 48 L82 98 L38 98 L38 48 L30 48 Z"
                              fill={fill} stroke={outline} strokeWidth={sw}/>
                        <path d="M48 22 L48 34 L72 34 L72 22" fill="none" stroke={outline} strokeWidth={sw}
                              strokeLinejoin="round"/>
                        <line x1="60" y1="34" x2="60" y2="48" stroke={outline} strokeWidth={sw * 0.7}/>
                        <circle cx="60" cy="40" r={sw * 0.6} fill={outline}/>
                    </g>);
                }
                case "hoodie": {
                    return (<g filter={`url(#shadow-${suf(id)})`}>
                        <path d="M26 34 L42 26 L78 26 L94 34 L94 50 L86 50 L86 102 L34 102 L34 50 L26 50 Z"
                              fill={fill} stroke={outline} strokeWidth={sw}/>
                        <path d="M42 26 Q60 12 78 26" fill="none" stroke={outline} strokeWidth={sw}/>
                        <path d="M56 28 L56 40" stroke={outline} strokeWidth={sw * 0.8}/>
                        <path d="M64 28 L64 44" stroke={outline} strokeWidth={sw * 0.8}/>
                        <circle cx="56" cy="40" r={sw * 0.7} fill={outline}/>
                        <circle cx="64" cy="44" r={sw * 0.7} fill={outline}/>
                        <path d="M46 70 Q60 78 74 70" fill="none" stroke={outline} strokeWidth={sw * 0.9}
                              strokeLinecap="round"/>
                    </g>);
                }
                case "sweater": {
                    return (<g filter={`url(#shadow-${suf(id)})`}>
                        <path d="M28 32 L44 24 L76 24 L92 32 L92 48 L84 48 L84 100 L36 100 L36 48 L28 48 Z"
                              fill={fill} stroke={outline} strokeWidth={sw}/>
                        <path d="M48 24 Q60 18 72 24" fill="none" stroke={outline} strokeWidth={sw}/>
                        <line x1="36" y1="100" x2="84" y2="100" stroke={outline} strokeWidth={sw * 1.2}/>
                    </g>);
                }
                case "blazer": {
                    return (<g filter={`url(#shadow-${suf(id)})`}>
                        <path d="M22 36 L38 28 L82 28 L98 36 L98 54 L90 54 L90 106 L30 106 L30 54 L22 54 Z"
                              fill={fill} stroke={outline} strokeWidth={sw}/>
                        <path d="M38 28 L54 44 L62 36 L70 44 L82 28" fill="none" stroke={outline}
                              strokeWidth={sw} strokeLinejoin="round"/>
                        <circle cx="58" cy="66" r={sw * 0.9} fill={outline}/>
                        <circle cx="58" cy="80" r={sw * 0.9} fill={outline}/>
                        <line x1="34" y1="72" x2="50" y2="72" stroke={outline} strokeWidth={sw * 0.8}/>
                        <line x1="70" y1="72" x2="86" y2="72" stroke={outline} strokeWidth={sw * 0.8}/>
                    </g>);
                }
                case "jeans": {
                    return (<g filter={`url(#shadow-${suf(id)})`}>
                        <path
                            d="M40 18 L80 18 L80 54 L84 54 L84 110 L70 110 L70 54 L50 54 L50 110 L36 110 L36 54 L40 54 Z"
                            fill={fill} stroke={outline} strokeWidth={sw} strokeLinejoin="round"/>
                        <rect x="40" y="18" width="40" height="6" fill="none" stroke={outline}
                              strokeWidth={sw}/>
                        <path d="M60 24 L60 46" stroke={outline} strokeWidth={sw * 0.9}/>
                        <path d="M42 28 Q48 32 52 28" fill="none" stroke={outline} strokeWidth={sw * 0.8}/>
                        <path d="M68 28 Q72 32 78 28" fill="none" stroke={outline} strokeWidth={sw * 0.8}/>
                        <line x1="36" y1="110" x2="50" y2="110" stroke={outline} strokeWidth={sw * 0.8}/>
                        <line x1="70" y1="110" x2="84" y2="110" stroke={outline} strokeWidth={sw * 0.8}/>
                    </g>);
                }
                case "chinos": {
                    return (<g filter={`url(#shadow-${suf(id)})`}>
                        <path
                            d="M42 20 L78 20 L78 56 L80 56 L80 106 L68 106 L68 56 L52 56 L52 106 L40 106 L40 56 L42 56 Z"
                            fill={fill} stroke={outline} strokeWidth={sw}/>
                        <line x1="60" y1="56" x2="60" y2="102" stroke={outline} strokeWidth={sw * 0.6}
                              strokeDasharray="2 2"/>
                        {[46, 54, 62, 70, 78].map((x, i) => (
                            <rect key={i} x={x} y={20} width={3} height={6} fill={outline}/>))}
                    </g>);
                }
                case "shorts": {
                    return (<g filter={`url(#shadow-${suf(id)})`}>
                        <path
                            d="M40 22 L80 22 L80 42 L84 42 L84 66 L70 66 L70 42 L50 42 L50 66 L36 66 L36 42 L40 42 Z"
                            fill={fill} stroke={outline} strokeWidth={sw}/>
                        <line x1="36" y1="66" x2="50" y2="66" stroke={outline} strokeWidth={sw * 0.8}/>
                        <line x1="70" y1="66" x2="84" y2="66" stroke={outline} strokeWidth={sw * 0.8}/>
                        <line x1="60" y1="28" x2="60" y2="42" stroke={outline} strokeWidth={sw * 0.8}/>
                    </g>);
                }
                case "skirt": {
                    return (<g filter={`url(#shadow-${suf(id)})`}>
                        <path d="M36 24 L84 24 L92 78 L28 78 Z" fill={fill} stroke={outline} strokeWidth={sw}
                              strokeLinejoin="round"/>
                        {[48, 60, 72].map((x, i) => (<line key={i} x1={x} y1="24" x2={x - 4} y2="78" stroke={outline}
                                                           strokeWidth={sw * 0.7} strokeOpacity=".6"/>))}
                        <line x1="36" y1="24" x2="84" y2="24" stroke={outline} strokeWidth={sw * 1.1}/>
                    </g>);
                }
                default:
                    return (<rect x="30" y="30" width="60" height="60" rx="8" fill={fill} stroke={outline}
                                  strokeWidth={sw}/>);
            }
        })()}
    </svg>);
};

function useColors(base?: string) {
    const valid = base?.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i) ? base : "#cccccc";
    return {fillColor: valid, outline: autoOutline(valid)};
}

const GarmentGlyphComponent: React.FC<Props> = ({
                                                    id,
                                                    kind,
                                                    className,
                                                    size = 112,
                                                    radius = 12,
                                                    debug = false,
                                                    alt,
                                                    color,

                                                }) => {
    const {fillColor, outline} = useColors(color);
    return (<div
        className={className}
        style={{
            width: size,
            height: size,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius,
            position: "relative",
        }}
        role="img"
        aria-label={alt || kind}
        title={alt || kind}
    >
        <GarmentSVG
            id={id}
            kind={kind}
            size={size}
            fillColor={fillColor}
            outline={outline}
            debug={debug}
        />
        {debug && (<div
            style={{
                position: "absolute",
                inset: 0,
                border: "1px dashed rgba(255,255,255,.6)",
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,.35)",
                borderRadius: radius,
                pointerEvents: "none",
            }}
        />)}
    </div>);
};

const GarmentGlyph = React.memo(GarmentGlyphComponent);
export default GarmentGlyph;
