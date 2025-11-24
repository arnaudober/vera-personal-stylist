import { MdLocalLaundryService } from "react-icons/md";
import { useCloset } from "../hooks/useCloset.ts";

interface LaundryButtonData {
  onLaundryDone?: () => void;
}

export default function LaundryButton({ onLaundryDone }: LaundryButtonData) {
  const { markLaundryDone } = useCloset();

  function onDoLaundry(): void {
    markLaundryDone();

    if (onLaundryDone && typeof onLaundryDone === "function") {
      onLaundryDone();
    }
  }

  return (
    <button
      onClick={onDoLaundry}
      aria-label="Mark all worn items as clean"
      title="Mark all worn items as clean"
      className={`fixed bottom-12 right-5 z-50 rounded-full shadow-lg transition-colors border btn-accent border-gray-200`}
      style={{ width: 56, height: 56 }}
    >
      <div className="flex items-center justify-center text-3xl">
        <MdLocalLaundryService />
      </div>
    </button>
  );
}
