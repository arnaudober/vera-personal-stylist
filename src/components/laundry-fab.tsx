import {useState} from "react";
import {FaCheck} from "react-icons/fa";
import {MdLocalLaundryService} from "react-icons/md";

interface LaundryFabProps {
    onLaundryDone: () => void;
}

export default function LaundryFab({onLaundryDone}: LaundryFabProps) {
    const [laundryJustDone, setLaundryJustDone] = useState(false);

    const handleClick = () => {
        onLaundryDone();
        setLaundryJustDone(true);
        window.setTimeout(() => setLaundryJustDone(false), 1500);
    };

    return (<button
            onClick={handleClick}
            aria-label="Mark all worn items as clean"
            aria-pressed={laundryJustDone}
            title="Mark all worn items as clean"
            className={`fixed bottom-12 right-5 z-50 rounded-full shadow-lg transition-colors border btn-accent border-gray-200`}
            style={{width: 56, height: 56}}
        >
            <div className="flex items-center justify-center text-3xl">
                {laundryJustDone ? <FaCheck/> : <MdLocalLaundryService/>}
            </div>
        </button>);
}
