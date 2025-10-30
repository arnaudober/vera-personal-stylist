import {useMemo, useState} from "react";
import {categories, type Category, type ClothingItem, type GarmentKind} from "../model.ts";
import {extractDominantColor, resizeAndCompress} from "../utils/image.ts";

export type UploadResult = Omit<ClothingItem, "id" | "dateAdded"> & { imageData?: string };

export default function UploadModal({
                                        onClose,
                                        onSave,
                                    }: {
    onClose: () => void;
    onSave: (item: UploadResult) => Promise<void> | void;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [category, setCategory] = useState<Category | "">("");
    const [type, setType] = useState<GarmentKind | "">("");
    const [color, setColor] = useState<string>("#cccccc");
    const [isClean, setIsClean] = useState<boolean>(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const typeOptions: { value: GarmentKind; label: string; cat: Category }[] = useMemo(() => ([
        {value: "tshirt", label: "T-shirt", cat: "top"},
        {value: "blazer", label: "Blazer", cat: "top"},
        {value: "shirt", label: "Shirt", cat: "top"},
        {value: "polo", label: "Polo", cat: "top"},
        {value: "hoodie", label: "Hoodie", cat: "top"},
        {value: "sweater", label: "Sweater", cat: "top"},
        {value: "jeans", label: "Jeans", cat: "bottom"},
        {value: "chinos", label: "Chinos", cat: "bottom"},
        {value: "shorts", label: "Shorts", cat: "bottom"},
        {value: "skirt", label: "Skirt", cat: "bottom"},
    ]), []);

    const filteredTypes = useMemo(() => typeOptions.filter(t => (category ? t.cat === category : true)), [category, typeOptions]);

    function handleFileChange(f: File | null) {
        setError(null);
        setFile(f);
        if (!f) {
            setPreview(null);
            return;
        }
        // basic type/size validation
        if (!f.type.startsWith("image/")) {
            setError("Please select an image file.");
            setFile(null);
            setPreview(null);
            return;
        }
        // show immediate preview (unprocessed); we'll replace after processing on save
        const url = URL.createObjectURL(f);
        setPreview(url);
    }

    async function autoDetectColor(dataUrl: string) {
        const col = await extractDominantColor(dataUrl);
        setColor(col);
    }

    async function handleSave() {
        try {
            setBusy(true);
            setError(null);
            if (!file) {
                setError("Please choose an image.");
                setBusy(false);
                return;
            }
            if (!name.trim()) {
                setError("Please enter a name.");
                setBusy(false);
                return;
            }
            if (!category) {
                setError("Please select a category.");
                setBusy(false);
                return;
            }
            const t: GarmentKind | "" = type || (filteredTypes[0]?.value ?? "");
            if (!t) {
                setError("Please select a type.");
                setBusy(false);
                return;
            }

            const processed = await resizeAndCompress(file, 1024, 0.7);
            // update color from processed image if the user hasn't customized after file select
            await autoDetectColor(processed.dataUrl);

            const result: UploadResult = {
                name: name.trim(),
                category: category as Category,
                type: t as GarmentKind,
                color: color as `#${string}`,
                isClean,
                imageData: processed.dataUrl,
            };
            await onSave(result);
            onClose();
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => !busy && onClose()}/>
            <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 shadow-xl">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Add item</h3>
                    <button className="p-2 text-gray-500" onClick={onClose} aria-label="Close" disabled={busy}>✕
                    </button>
                </div>

                <div className="mt-3 space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">Photo</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                                className="block w-full text-sm"
                                aria-label="Choose image"
                                disabled={busy}
                            />
                        </div>
                        {preview && (
                            <div className="mt-2">
                                <img src={preview} alt="Preview"
                                     className="w-full max-h-60 object-contain rounded-lg border"/>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Navy tee"
                            className="w-full rounded-lg border px-3 py-2 text-base"
                            aria-required
                            disabled={busy}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select
                                className="w-full rounded-lg border px-3 py-2 text-base"
                                value={category}
                                onChange={(e) => {
                                    setCategory(e.target.value as Category | "");
                                    setType("");
                                }}
                                disabled={busy}
                            >
                                <option value="">Select…</option>
                                {categories.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <select
                                className="w-full rounded-lg border px-3 py-2 text-base"
                                value={type}
                                onChange={(e) => setType(e.target.value as GarmentKind)}
                                disabled={busy || !category}
                            >
                                <option value="">{category ? "Select…" : "Choose category first"}</option>
                                {filteredTypes.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                        <div>
                            <label className="block text-sm font-medium mb-1">Color</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="h-10 w-14 rounded cursor-pointer"
                                    disabled={busy}
                                />
                                <input
                                    type="text"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="flex-1 rounded-lg border px-3 py-2 text-base"
                                    disabled={busy}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input id="isClean" type="checkbox" checked={isClean}
                                   onChange={(e) => setIsClean(e.target.checked)} disabled={busy}/>
                            <label htmlFor="isClean" className="text-sm">Item is clean</label>
                        </div>
                    </div>

                    {error && <div className="text-sm text-red-600">{error}</div>}
                </div>

                <div className="mt-5 flex gap-3">
                    <button
                        className="flex-1 rounded-xl border px-4 py-2 text-base"
                        onClick={onClose}
                        disabled={busy}
                    >Cancel
                    </button>
                    <button
                        className="flex-1 rounded-xl bg-black text-white px-4 py-2 text-base disabled:opacity-60"
                        onClick={handleSave}
                        disabled={busy}
                    >{busy ? "Saving…" : "Save"}</button>
                </div>
            </div>
        </div>
    );
}
