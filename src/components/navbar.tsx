import {Link} from "react-router-dom";
import {useState} from "react";
import {TbHanger} from "react-icons/tb";
import {FaCheck, FaRegStar} from "react-icons/fa";
import {PiShirtFoldedFill} from "react-icons/pi";


interface NavbarProps {
    active: "home" | "closet";
    onLaundryDone: () => void;
}

export default function Navbar({active, onLaundryDone}: NavbarProps) {
    const [laundryJustDone, setLaundryJustDone] = useState(false);

    return (<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-center max-w-sm mx-auto">
            <Link
                to="/closet"
                className={`flex flex-col items-center justify-center px-6 py-2 rounded-lg transition-colors ${active === "closet" ? "text-accent" : "text-gray-700"}`}
                aria-current={active === "closet" ? "page" : undefined}
                aria-label="Open closet page"
            >
                <div className="text-xl mb-1"><PiShirtFoldedFill className="text-xl"/></div>
                <span className="text-xs font-medium">Closet</span>
            </Link>

            <Link
                to="/"
                className={`flex flex-col items-center justify-center px-6 py-2 rounded-lg transition-colors ${active === "home" ? "text-accent" : "text-gray-700"}`}
                aria-current={active === "home" ? "page" : undefined}
                aria-label="Open home page - Today's outfit suggestions"
            >
                <div className="text-xl mb-1"><FaRegStar className="text-xl"/></div>
                <span className="text-xs font-medium">Suggest</span>
            </Link>

            <button
                onClick={() => {
                    onLaundryDone();
                    setLaundryJustDone(true);
                    window.setTimeout(() => setLaundryJustDone(false), 1500);
                }}
                aria-pressed={laundryJustDone}
                className={`flex flex-col items-center justify-center px-6 py-2 rounded-lg transition-colors ${laundryJustDone ? "text-green-600 bg-green-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
                title="Mark all worn items as clean"
            >
                <div className="text-xl mb-1">
                    {laundryJustDone ? <FaCheck className="text-xl"/> : <TbHanger className="text-xl"/>}
                </div>
                <span className="text-xs font-medium">Laundry</span>
            </button>
        </div>
    </nav>);
}