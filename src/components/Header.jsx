import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthModal from "./AuthModal";
import HeaderSearch from "./HeaderSearch";

const Header = () => {
    const [showMenuDrawer, setShowMenuDrawer] = useState(false);
    const [authMode, setAuthMode] = useState(null);
    const closeMenuDrawer = () => setShowMenuDrawer(false);
    const openAuthModal = (mode) => {
        closeMenuDrawer();
        setAuthMode(mode);
    };

    return (
        <header className="sticky top-0 z-[8] flex h-[68px] items-center gap-3 bg-[#151923]/95 px-3 font-medium text-white shadow-lg shadow-black/20 backdrop-blur sm:px-4 min-[1025px]:h-[76px] min-[1025px]:gap-4 min-[1025px]:px-5">
            <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 min-[1025px]:hidden">
                <img
                    src="/more.svg"
                    alt=""
                    className="h-4 w-4 brightness-[1.08] contrast-[1.07] hue-rotate-[42deg] invert saturate-100 sepia"
                    onClick={() => {
                        setShowMenuDrawer(true);
                    }}
                />
            </button>

            <Link to="/" className="flex shrink-0 items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/80 text-xs text-[#ffc83d] min-[1025px]:h-9 min-[1025px]:w-9">
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

            <HeaderSearch className="hidden w-[min(390px,30vw)] min-[1025px]:block" />

            <nav
                className={`-translate-x-full min-[1025px]:ml-4 min-[1025px]:flex-1 min-[1025px]:translate-x-0 ${
                    showMenuDrawer
                        ? "fixed bottom-0 left-0 right-[15%] top-0 z-10 !block translate-x-0 overflow-y-auto bg-[#0b111d] py-5 shadow-2xl shadow-black/60 transition-transform duration-500 sm:right-1/4"
                        : ""
                }`}
            >
                <button
                    className={`hidden px-5 pb-3 ${showMenuDrawer ? "!block" : ""}`}
                >
                    <img
                        src="/back.svg"
                        alt=""
                        className="brightness-[1.08] contrast-[1.07] hue-rotate-[42deg] invert saturate-100 sepia"
                        onClick={() => {
                            setShowMenuDrawer(false);
                        }}
                    />
                </button>
                <HeaderSearch
                    className="mx-4 mb-5 min-[1025px]:hidden"
                    onNavigate={closeMenuDrawer}
                />
                <ul className="flex flex-col px-5 min-[1025px]:flex-row min-[1025px]:items-center min-[1025px]:justify-center min-[1025px]:gap-6 min-[1025px]:px-0">
                    <li>
                        <Link
                            to="/movie"
                            onClick={closeMenuDrawer}
                            className={`hidden py-3 text-sm text-gray-200 transition-colors hover:text-white min-[1025px]:block ${
                                showMenuDrawer ? "!inline-block" : ""
                            }`}
                        >
                            Phim lẻ
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/tv"
                            onClick={closeMenuDrawer}
                            className={`hidden py-3 text-sm text-gray-200 transition-colors hover:text-white min-[1025px]:block ${
                                showMenuDrawer ? "!inline-block" : ""
                            }`}
                        >
                            Phim bộ
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/cartoon"
                            onClick={closeMenuDrawer}
                            className={`hidden py-3 text-sm text-gray-200 transition-colors hover:text-white min-[1025px]:block ${
                                showMenuDrawer ? "!inline-block" : ""
                            }`}
                        >
                            Hoạt hình
                        </Link>
                    </li>
                </ul>
            </nav>

            <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="ml-auto flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-3 text-sm font-bold text-[#171a24] transition-colors hover:bg-gray-100 sm:h-11 sm:px-4 min-[1025px]:px-5"
            >
                <FontAwesomeIcon icon={faUser} />
                <span>Thành viên</span>
            </button>

            <div
                className={`hidden opacity-0 ${
                    showMenuDrawer
                        ? "fixed inset-0 z-[9] !block bg-black/30 opacity-100 transition-opacity"
                        : ""
                }`}
                onClick={() => {
                    setShowMenuDrawer(false);
                }}
            ></div>
            {authMode && (
                <AuthModal
                    initialMode={authMode}
                    onClose={() => setAuthMode(null)}
                />
            )}
        </header>
    );
};
export default Header;
