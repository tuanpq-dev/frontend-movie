import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import HeaderSearch from "./HeaderSearch";
import { useKKCategories, useKKCountries } from "@/hooks/useMovieData";

const NAV_LINKS = [
    { to: "/danh-sach/phim-le", label: "Phim lẻ" },
    { to: "/danh-sach/phim-bo", label: "Phim bộ" },
    { to: "/danh-sach/hoat-hinh", label: "Hoạt hình" },
    { to: "/danh-sach/tv-shows", label: "TV Shows" },
    { to: "/danh-sach/phim-chieu-rap", label: "Chiếu rạp" },
];

const navItemClass =
    "block py-3 text-sm text-gray-200 transition-colors hover:text-primary min-[1025px]:py-2";

// Dropdown Thể loại / Quốc gia: nổi trên desktop, xổ xuống trong drawer mobile.
const NavDropdown = ({ label, items = [], basePath }) => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const { pathname } = useLocation();

    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!open) return undefined;
        const handleClickOutside = (event) => {
            if (!rootRef.current?.contains(event.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <li ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className={`${navItemClass} flex w-full items-center gap-1.5 ${
                    pathname.startsWith(basePath) ? "text-primary" : ""
                }`}
                aria-expanded={open}
            >
                {label}
                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>
            {open && (
                <div className="grid grid-cols-2 gap-x-2 pb-2 min-[1025px]:absolute min-[1025px]:left-0 min-[1025px]:top-full min-[1025px]:z-50 min-[1025px]:w-[520px] min-[1025px]:grid-cols-4 min-[1025px]:rounded-xl min-[1025px]:border min-[1025px]:border-white/10 min-[1025px]:bg-surface-2 min-[1025px]:p-3 min-[1025px]:shadow-2xl min-[1025px]:shadow-black/50">
                    {items.map((item) => (
                        <Link
                            key={item.slug}
                            to={`${basePath}/${item.slug}`}
                            className="truncate rounded-md px-2 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-primary"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            )}
        </li>
    );
};

const Header = () => {
    const [showMenuDrawer, setShowMenuDrawer] = useState(false);
    const { data: categories } = useKKCategories();
    const { data: countries } = useKKCountries();
    const { pathname, search } = useLocation();
    const closeMenuDrawer = () => setShowMenuDrawer(false);

    useEffect(() => {
        setShowMenuDrawer(false);
    }, [pathname, search]);

    return (
        <header className="sticky top-0 z-[8] flex h-[68px] items-center gap-3 bg-surface/95 px-3 font-medium text-white shadow-lg shadow-black/20 sm:px-4 min-[1025px]:h-[60px] min-[1025px]:gap-4 min-[1025px]:px-5">
            <button
                type="button"
                onClick={() => setShowMenuDrawer(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 min-[1025px]:hidden"
                aria-label="Mở menu"
            >
                <img src="/more.svg" alt="" className="h-4 w-4 invert" />
            </button>

            <Link to="/" className="flex shrink-0 items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/80 text-xs text-primary min-[1025px]:h-9 min-[1025px]:w-9">
                    ▶
                </span>
                <span className="hidden sm:block">
                    <span className="block text-lg font-black leading-5">
                        Một Phim
                    </span>
                    <span className="block text-[10px] text-gray-400">
                        Phim hay có rõ
                    </span>
                </span>
            </Link>

            <HeaderSearch className="ml-auto w-full max-w-[min(390px,60vw)] min-[1025px]:ml-0 min-[1025px]:w-[min(390px,30vw)]" />

            <nav
                className={
                    showMenuDrawer
                        ? "fixed bottom-0 left-0 right-[15%] top-0 z-10 overflow-y-auto bg-surface-top py-5 shadow-2xl shadow-black/60 sm:right-1/4"
                        : "hidden min-[1025px]:ml-2 min-[1025px]:block min-[1025px]:flex-1"
                }
            >
                {showMenuDrawer && (
                    <button
                        type="button"
                        className="px-5 pb-3"
                        onClick={closeMenuDrawer}
                        aria-label="Đóng menu"
                    >
                        <img src="/back.svg" alt="" className="invert" />
                    </button>
                )}
                <ul className="flex flex-col px-5 min-[1025px]:flex-row min-[1025px]:items-center min-[1025px]:gap-5 min-[1025px]:px-0">
                    <NavDropdown
                        label="Thể loại"
                        items={categories}
                        basePath="/the-loai"
                    />
                    <NavDropdown
                        label="Quốc gia"
                        items={countries}
                        basePath="/quoc-gia"
                    />
                    {NAV_LINKS.map((link) => (
                        <li key={link.to}>
                            <NavLink
                                to={link.to}
                                className={({ isActive }) =>
                                    `${navItemClass} ${isActive ? "text-primary" : ""}`
                                }
                            >
                                {link.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {showMenuDrawer && (
                <div
                    className="fixed inset-0 z-[9] bg-black/30"
                    onClick={closeMenuDrawer}
                />
            )}
        </header>
    );
};

export default Header;
