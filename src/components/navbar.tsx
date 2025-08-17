import {Link} from "react-router-dom";
import {FaRegStar} from "react-icons/fa";
import {PiShirtFoldedFill} from "react-icons/pi";

interface NavbarProps {
    active: "home" | "closet";
}

export default function Navbar({active}: NavbarProps) {
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
        </div>
    </nav>);
}