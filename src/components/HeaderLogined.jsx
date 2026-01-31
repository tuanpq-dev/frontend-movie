import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";

import axios from "axios";
import { API_URL } from "@libs/config";

const HeaderLogined = ({ username, email, avatar }) => {
    const [showMenuDrawer, setShowMenuDrawer] = useState(false);
    const [hasPaid, setHasPaid] = useState(false);

    const handleLogout = () => {
        // Xóa cookie chứa access token
        Cookies.remove("accessToken");
        window.location.href = "/";
    };

    const token = Cookies.get("accessToken");

    useEffect(() => {
        if (!token) return;

        const checkPaymentStatus = async () => {
            try {
                const decodedToken = jwt_decode(token);

                const response = await axios.get(
                    `${API_URL}/api/payment/payment-status/${decodedToken.id}`,
                );

                setHasPaid(response.data.paid);
            } catch (error) {
                console.error("Lỗi khi kiểm tra thanh toán:", error);
            }
        };

        checkPaymentStatus();
    }, [token]);

    return (
        <header className="sticky top-0 z-[8] flex justify-between bg-slate-950 px-5 py-5 font-medium text-white lg:px-8">
            <button className="lg:hidden">
                <img
                    src="/more.svg"
                    alt=""
                    className="brightness-[1.08] contrast-[1.07] hue-rotate-[42deg] invert saturate-100 sepia"
                    onClick={() => {
                        setShowMenuDrawer(true);
                    }}
                />
            </button>
            <div className="flex items-center">
                <h1 className="absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] lg:static lg:translate-x-0 lg:translate-y-0">
                    <a
                        href="/"
                        className="text-2xl font-bold uppercase text-red-500 md:text-3xl"
                    >
                        Mọt phim
                    </a>
                </h1>
                <nav
                    className={`-translate-x-full lg:mx-6 lg:translate-x-0 ${
                        showMenuDrawer
                            ? "fixed bottom-0 left-0 right-1/4 top-0 z-10 !block translate-x-0 bg-[#292e39] py-5 shadow-lg shadow-[#171c2866] transition-transform duration-500"
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
                    <ul className="flex flex-col px-5 lg:flex-row lg:gap-6">
                        <li>
                            <a
                                href="/movie"
                                className={`hidden md:text-lg lg:block lg:py-0 ${
                                    showMenuDrawer ? "!inline-block py-3" : ""
                                }`}
                            >
                                Phim lẻ
                            </a>
                        </li>
                        <li>
                            <a
                                href="/tv"
                                className={`hidden md:text-lg lg:block lg:py-0 ${
                                    showMenuDrawer ? "!inline-block py-3" : ""
                                }`}
                            >
                                Phim bộ
                            </a>
                        </li>
                        <li>
                            <a
                                href="/search"
                                className={`hidden ${
                                    showMenuDrawer
                                        ? "!flex h-full items-center rounded-lg py-3 shadow-[#00000033] lg:h-12 lg:w-12 lg:justify-center lg:py-0"
                                        : ""
                                }`}
                            >
                                <FontAwesomeIcon icon={faMagnifyingGlass} />
                            </a>
                        </li>
                    </ul>
                </nav>
                <a
                    href="/search"
                    className="ml-10 hidden h-12 w-12 items-center justify-center rounded-lg bg-[#292d38] shadow-[#00000033] lg:flex"
                >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                </a>
            </div>
            <div className="group relative">
                <img
                    src={
                        avatar
                            ? `${API_URL}/images/avatar/` + avatar
                            : "https://img.freepik.com/free-psd/3d-rendering-avatar_23-2150833560.jpg?w=740&t=st=1728638508~exp=1728639108~hmac=59fcbd89a8d344fb2797ab35306b6b539a477e5dd919d73e04bd449290c3a5f4"
                    }
                    alt=""
                    className="block h-[50px] w-[50px] cursor-pointer rounded-lg object-cover"
                />
                <div className="absolute right-0 top-12 hidden w-[300px] pt-6 group-hover:block">
                    <div className="rounded-2xl bg-[#2f3441] p-8 shadow-sm shadow-slate-600">
                        <div className="absolute -top-3 right-2 inline-block border-[20px] border-b-[#2e3340] border-l-transparent border-r-transparent border-t-transparent"></div>
                        <div className="flex items-center gap-3">
                            <img
                                src={
                                    avatar
                                        ? `${API_URL}/images/avatar/` + avatar
                                        : "https://img.freepik.com/free-psd/3d-rendering-avatar_23-2150833560.jpg?w=740&t=st=1728638508~exp=1728639108~hmac=59fcbd89a8d344fb2797ab35306b6b539a477e5dd919d73e04bd449290c3a5f4"
                                }
                                alt=""
                                className="h-[60px] w-[60px] rounded-xl object-cover"
                            />
                            <div>
                                <p className="text-lg">{username}</p>
                                <p>{email}</p>
                            </div>
                        </div>
                        <ul className="mt-8">
                            <li>
                                <a
                                    href={`/profile`}
                                    className="inline-block py-2"
                                >
                                    Trang cá nhân
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/favorite"
                                    className="inline-block py-2"
                                >
                                    Danh sách yêu thích
                                </a>
                            </li>
                            <li className="mt-3 border-t border-solid border-t-[#292e39] pt-3">
                                <a
                                    href="#!"
                                    className="inline-block py-2"
                                    onClick={handleLogout}
                                >
                                    Đăng xuất
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                {hasPaid && (
                    <img
                        className="absolute -right-[6px] -top-[5px]"
                        src="data:image/svg+xml,%3csvg%20width='10'%20height='11'%20viewBox='0%200%2010%2011'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M9.39379%209.23321C9.0651%209.45156%208.65127%209.35571%208.44241%209.04131C8.43292%209.02701%208.43292%209.02701%208.43292%209.02701L3.97587%2010.9373C3.74252%2011.0512%203.45241%2010.9555%203.31001%2010.7412L0.16768%206.01085C0.0252788%205.79648%200.0495717%205.49198%200.244949%205.321L3.73367%201.95298C3.73367%201.95298%203.73367%201.95298%203.72418%201.93869C3.51533%201.62429%203.58739%201.20567%203.91608%200.987317C4.23048%200.778461%204.6586%200.864817%204.86746%201.17922C5.06682%201.47933%204.98996%201.92174%204.67556%202.13059C4.54694%202.21604%204.39464%202.23482%204.24713%202.22982L4.07259%204.19953C4.05299%204.54211%204.3428%204.82333%204.68548%204.78107L6.87956%204.5182C6.87517%204.29455%206.97071%204.0663%207.18508%203.9239C7.49948%203.71504%207.9276%203.8014%208.14594%204.13009C8.3548%204.44449%208.25895%204.85832%207.94455%205.06718C7.73019%205.20958%207.48275%205.20917%207.26879%205.10413L6.17594%207.02475C6.00415%207.32425%206.16054%207.7147%206.48392%207.82944L8.35779%208.41781C8.41985%208.29419%208.5057%208.17537%208.63432%208.08993C8.94872%207.88107%209.36734%207.95314%209.58569%208.28183C9.79455%208.59623%209.70819%209.02435%209.39379%209.23321Z'%20fill='%23F5C70E'/%3e%3c/svg%3e"
                    />
                )}
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
