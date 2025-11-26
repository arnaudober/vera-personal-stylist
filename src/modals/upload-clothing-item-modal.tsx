import { useMemo, useState } from "react";
import {
  categoryOptions,
  type ClothingItemCategory,
  type ClothingItemType,
  type CreateClothingItem,
  typesOptions,
} from "../models/clothing-item.ts";
import type { Color } from "../models/color.ts";

const MAX_IMAGE_SIZE = 1024;
const COMPRESSION_QUALITY = 0.7;

interface ModalData {
  onClose: () => void;
  onSave: (item: CreateClothingItem) => void;
}

const componentToHexadecimal = (c: number): string =>
  c.toString(16).padStart(2, "0");
const extractDominantColor = async (dataUrl: string): Promise<Color> => {
  const image: HTMLImageElement = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    return `#CCCCCC`;
  }

  // Downscale for speed
  const maxSample = 64;
  const scale = Math.min(maxSample / image.width, maxSample / image.height, 1);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const { data } = context.getImageData(0, 0, width, height);
  let r = 0,
    g = 0,
    b = 0,
    count = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 16) {
      continue; // Skip near-transparent pixels
    }

    r += data[i];
    g += data[i + 1];
    b += data[i + 2];

    count++;
  }

  if (count === 0) {
    return "#CCCCCC";
  }

  r = Math.round(r / count);
  g = Math.round(g / count);
  b = Math.round(b / count);

  return `#${componentToHexadecimal(r)}${componentToHexadecimal(g)}${componentToHexadecimal(b)}`;
};
const processFile = async (file: File): Promise<string> => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D not supported");
  }

  const imageElement: HTMLImageElement = await new Promise(
    (resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = String(reader.result);
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    },
  );

  const ratio =
    Math.max(imageElement.width, imageElement.height) / MAX_IMAGE_SIZE;
  const processedWidth =
    ratio > 1 ? Math.round(imageElement.width / ratio) : imageElement.width;
  const processedHeight =
    ratio > 1 ? Math.round(imageElement.height / ratio) : imageElement.height;
  canvas.width = processedWidth;
  canvas.height = processedHeight;
  ctx.drawImage(imageElement, 0, 0, processedWidth, processedHeight);

  return canvas.toDataURL("image/jpeg", COMPRESSION_QUALITY);
};

export default function UploadClothingItemModal({
  onClose,
  onSave,
}: ModalData) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ClothingItemCategory | "">("");
  const [type, setType] = useState<ClothingItemType | "">("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const types = useMemo(() => typesOptions, []);
  const filteredTypes = useMemo(
    () =>
      types.filter((type) => (category && type.category === category) ?? true),
    [category, types],
  );

  function fileDragged(file: File | undefined) {
    if (!file) {
      return;
    }

    setError(null);
    setFile(file);

    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      setError("Only images are supported.");
      setFile(null);
      setPreview(null);

      return;
    }

    // Show an immediate preview, we'll replace it after processing on save
    setPreview(URL.createObjectURL(file));
  }

  async function save() {
    try {
      setIsSaving(true);
      setError(null);

      if (!file) {
        setError("Please choose an image.");
        setIsSaving(false);
        return;
      }
      if (!name.trim()) {
        setError("Please enter a name.");
        setIsSaving(false);
        return;
      }
      if (!category) {
        setError("Please select a category.");
        setIsSaving(false);
        return;
      }
      if (!type) {
        setError("Please select a type.");
        setIsSaving(false);
        return;
      }

      const imageData = await processFile(file);
      const item: CreateClothingItem = {
        name: name.trim(),
        category,
        type,
        color: await extractDominantColor(imageData),
        isClean: true,
        imageData,
      };
      onSave(item);
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !isSaving && onClose()}
      />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add item</h3>
          <button
            className="p-2 text-gray-500"
            onClick={onClose}
            aria-label="Close"
            disabled={isSaving}
          >
            ✕
          </button>
        </div>

        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Photo</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => fileDragged(e.target.files?.[0])}
                className="block w-full text-sm"
                aria-label="Choose image"
                disabled={isSaving}
              />
            </div>
            {preview && (
              <div className="mt-2">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-60 object-contain rounded-lg border"
                />
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
              disabled={isSaving}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                className="w-full rounded-lg border px-3 py-2 text-base"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as ClothingItemCategory);
                  setType("");
                }}
                disabled={isSaving}
              >
                <option value="">Select…</option>
                {categoryOptions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                className="w-full rounded-lg border px-3 py-2 text-base"
                value={type}
                onChange={(e) => setType(e.target.value as ClothingItemType)}
                disabled={isSaving || !category}
              >
                <option value="">
                  {category ? "Select…" : "Choose category first"}
                </option>
                {filteredTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            className="flex-1 rounded-xl border px-4 py-2 text-base"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="flex-1 rounded-xl bg-black text-white px-4 py-2 text-base disabled:opacity-60"
            onClick={save}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
