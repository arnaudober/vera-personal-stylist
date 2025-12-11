import { useOutfit } from "../hooks/outfit.ts";
import { RiAiGenerate } from "react-icons/ri";

export default function RegenerateOutfitButton() {
  const { generateOutfit, canGenerateOutfit } = useOutfit();

  function onRegenerate(): void {
    generateOutfit();
  }

  return (
    <button
      onClick={() => onRegenerate()}
      aria-label="Regenerate the outfit"
      title="Regenerate the outfit"
      className={`fixed bottom-12 right-5 z-50 rounded-full shadow-lg transition-colors border btn-accent border-gray-200 disabled:cursor-not-allowed  disabled:border-gray-300`}
      style={{ width: 56, height: 56 }}
      disabled={!canGenerateOutfit()}
    >
      <div className="flex items-center justify-center text-3xl">
        <RiAiGenerate />
      </div>
    </button>
  );
}
