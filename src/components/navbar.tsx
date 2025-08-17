import {Link} from "react-router-dom";
import {useState} from "react";
import {TbHanger} from "react-icons/tb";
import {GiSparkles} from "react-icons/gi";
import { MdLocalLaundryService } from "react-icons/md";
import { FaCheck } from "react-icons/fa";


interface NavbarProps {
    active: "home" | "closet";
    onLaundryDone: () => void;
}

export default function Navbar({active, onLaundryDone}: NavbarProps) {
    const [laundryJustDone, setLaundryJustDone] = useState(false);

    return (<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-center max-w-sm mx-auto">
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
                    {laundryJustDone ? <FaCheck className="text-xl"/> : <MdLocalLaundryService className="text-xl"/>}
                </div>
            </button>

            <Link
                to="/"
                className={`flex justify-center items-center mx-6 w-14 h-14 rounded-full shadow-lg transition-all ${active === "home" ? "bg-blue-600 text-white ring-4 ring-blue-200 scale-110" : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl"}`}
                aria-current={active === "home" ? "page" : undefined}
                aria-label="Open home page - Today's outfit suggestions"
            >
                <GiSparkles className="text-2xl"/>
            </Link>

            <Link
                to="/closet"
                className={`flex flex-col items-center justify-center px-6 py-2 rounded-lg transition-colors ${active === "closet" ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
                aria-current={active === "closet" ? "page" : undefined}
                aria-label="Open closet page"
            >
                <div className="text-xl mb-1"><TbHanger className="text-xl"/></div>
            </Link>
        </div>
    </nav>);
}