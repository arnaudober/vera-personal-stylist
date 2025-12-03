import { MdLocalLaundryService } from "react-icons/md";
import { useCloset } from "../hooks/closet.ts";
import { useOutfit } from "../hooks/outfit.ts";

export default function LaundryButton() {
  const { areAllItemsClean, markLaundryDone } = useCloset();
  const { generateOutfit, outfit } = useOutfit();

  function onDoLaundry(): void {
    markLaundryDone();

    if (!outfit) {
      generateOutfit();
    }
  }

  return (
    <button
      onClick={() => onDoLaundry()}
      aria-label="Mark all worn items as clean"
      title="Mark all worn items as clean"
      className={`fixed bottom-12 right-5 z-50 rounded-full shadow-lg transition-colors border btn-accent border-gray-200 disabled:cursor-not-allowed  disabled:border-gray-300`}
      style={{ width: 56, height: 56 }}
      disabled={areAllItemsClean()}
    >
      <div className="flex items-center justify-center text-3xl">
        <MdLocalLaundryService />
      </div>
    </button>
  );
}
