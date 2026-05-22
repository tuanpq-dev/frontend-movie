import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAvatarUrl } from "@libs/config";
import { useUserContext } from "@context/UserContext";
import { usePaymentStatus } from "@/hooks/useMovieData";
import HeaderSearch from "./HeaderSearch";

const HeaderLogined = ({ username, email, avatar }) => {
    const navigate = useNavigate();
    const { id: userId, logout: contextLogout } = useUserContext();
    const [showMenuDrawer, setShowMenuDrawer] = useState(false);
    const { data: paymentStatus } = usePaymentStatus(userId, {
        enabled: Boolean(userId),
        staleTime: 30 * 1000,
    });
    const hasPaid = Boolean(paymentStatus?.paid);
    const closeMenuDrawer = () => setShowMenuDrawer(false);

    const handleLogout = () => {
        contextLogout();
        navigate("/");
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

            <div className="group relative ml-auto">
                <button
                    type="button"
                    className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-white px-3 text-sm font-bold text-[#171a24] transition-colors hover:bg-gray-100 sm:h-11 min-[1025px]:px-4"
                >
                    <span className="relative">
                        <img
                            src={getAvatarUrl(avatar)}
                            alt=""
                            className="h-7 w-7 rounded-full object-cover"
                        />
                        {hasPaid && (
                            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#ffc83d]" />
                        )}
                    </span>
                    <FontAwesomeIcon
                        icon={faUser}
                        className="hidden sm:block"
                    />
                    <span className="hidden max-w-[110px] truncate sm:block">
                        {username || "Thành viên"}
                    </span>
                </button>
                <div className="absolute right-0 top-14 hidden w-[300px] pt-5 group-hover:block">
                    <div className="rounded-2xl border border-white/10 bg-[#111827] p-6 text-white shadow-2xl shadow-black/50">
                        <div className="flex items-center gap-3">
                            <img
                                src={getAvatarUrl(avatar)}
                                alt=""
                                className="h-[60px] w-[60px] rounded-2xl object-cover"
                            />
                            <div className="min-w-0">
                                <p className="truncate text-lg">{username}</p>
                                <p className="truncate text-sm text-gray-400">
                                    {email}
                                </p>
                            </div>
                        </div>
                        <ul className="mt-6">
                            <li>
                                <Link
                                    to="/profile"
                                    className="inline-block py-2 text-gray-200 hover:text-[#ffc83d]"
                                >
                                    Trang cá nhân
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/favorite"
                                    className="inline-block py-2 text-gray-200 hover:text-[#ffc83d]"
                                >
                                    Danh sách yêu thích
                                </Link>
                            </li>
                            <li className="mt-3 border-t border-solid border-t-white/10 pt-3">
                                <button
                                    type="button"
                                    className="inline-block py-2 text-left text-gray-200 hover:text-[#ffc83d]"
                                    onClick={handleLogout}
                                >
                                    Đăng xuất
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

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
        </header>
    );
};
export default HeaderLogined;
