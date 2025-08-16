import {Link} from "react-router-dom";
import {useState} from "react";

interface HeaderProps {
    active: "home" | "closet";
    onLaundryDone: () => void;
}

export default function Header({active, onLaundryDone}: HeaderProps) {
    const baseLink = "rounded-xl border px-4 py-2 shadow-sm btn-ghost";
    const activeLink = "rounded-xl px-4 py-2 text-white btn-accent";
    const [laundryJustDone, setLaundryJustDone] = useState(false);

    return (
        <header className="mb-6 flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-semibold">Vera, your personal stylist</h1>
            <div className="flex w-full flex-wrap items-start gap-2 md:w-auto">
                <Link
                    to="/"
                    className={active === "home" ? activeLink : baseLink}
                    aria-current={active === "home" ? "page" : undefined}
                    aria-label="Open suggestion page"
                >
                    Suggestion
                </Link>
                <Link
                    to="/closet"
                    className={active === "closet" ? activeLink : baseLink}
                    aria-current={active === "closet" ? "page" : undefined}
                    aria-label="Open closet page"
                >
                    Closet
                </Link>
                <button
                    onClick={() => {
                        onLaundryDone();
                        setLaundryJustDone(true);
                        window.setTimeout(() => setLaundryJustDone(false), 1500);
                    }}
                    aria-pressed={laundryJustDone}
                    className={
                        laundryJustDone
                            ? "rounded-xl px-4 py-2 text-white shadow-sm ring-2 ring-primary btn-accent"
                            : "rounded-xl border px-4 py-2 shadow-sm btn-ghost"
                    }
                    title="Mark all worn items as clean"
                >
                    {laundryJustDone ? "Laundry done ✓" : "Laundry done"}
                </button>
            </div>
        </header>
    );
}