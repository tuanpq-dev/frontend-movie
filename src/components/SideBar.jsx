import {
    faBars,
    faChevronLeft,
    faFilm,
    faRightFromBracket,
    faTableList,
    faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import axios from "axios";

const SideBar = ({ onLoadComplete }) => {
    const [userData, setUserData] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const token = Cookies.get("accessToken");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        Cookies.remove("accessToken");
        window.location.href = "/";
    };

    const handleNavigate = (path) => {
        navigate(path);
    };

    const isActive = (path) => {
        return (
            location.pathname === path ||
            location.pathname.startsWith(path + "/")
        );
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (!token) {
                    setLoading(false);
                    onLoadComplete();
                    return;
                }

                const decodedToken = jwt_decode(token);
                const userId = decodedToken.id;

                if (!userId) {
                    setLoading(false);
                    onLoadComplete();
                    return;
                }

                const response = await axios.get(
                    `http://localhost:8080/api/users/find/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );
                setUserData(response.data);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu người dùng:", error);
            } finally {
                setLoading(false);
                onLoadComplete();
            }
        };
        fetchUser();
    }, [token, onLoadComplete]);

    const menuItems = [
        { path: "/admin/movie", icon: faFilm, label: "Quản lý phim" },
        { path: "/admin/genre", icon: faTableList, label: "Quản lý thể loại" },
        { path: "/admin/user", icon: faUser, label: "Quản lý tài khoản" },
    ];

    return (
        <>
            {/* Mobile toggle button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 text-gray-700 shadow-lg transition-colors hover:bg-gray-100 lg:hidden"
            >
                <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
            </button>

            {/* Overlay for mobile */}
            {!collapsed && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setCollapsed(true)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-40 h-screen overflow-y-auto bg-white shadow-xl transition-all duration-300 ${
                    collapsed
                        ? "-translate-x-full lg:w-20 lg:translate-x-0"
                        : "w-64 translate-x-0"
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
                    <button
                        onClick={() => handleNavigate("/")}
                        className={`text-xl font-bold uppercase tracking-wide text-red-500 transition-opacity hover:text-red-400 ${
                            collapsed ? "lg:hidden" : ""
                        }`}
                    >
                        MỌT PHIM
                    </button>
                    {collapsed && (
                        <button
                            onClick={() => handleNavigate("/")}
                            className="hidden text-xl font-bold text-red-500 hover:text-red-400 lg:block"
                        >
                            MP
                        </button>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:block"
                    >
                        <FontAwesomeIcon
                            icon={faChevronLeft}
                            className={`h-4 w-4 transition-transform duration-300 ${
                                collapsed ? "rotate-180" : ""
                            }`}
                        />
                    </button>
                </div>

                {/* User Info */}
                <div
                    className={`border-b border-gray-200 px-4 py-4 ${
                        collapsed ? "lg:px-2" : ""
                    }`}
                >
                    <div
                        className={`flex items-center gap-3 ${collapsed ? "lg:justify-center" : ""}`}
                    >
                        <img
                            src={
                                userData?.profilePic
                                    ? `http://localhost:8080/images/users/${userData.profilePic}`
                                    : "https://www.speak2university.com/assets/admin/dist/img/user-avatar.png"
                            }
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-200"
                            alt="Admin"
                        />
                        <div className={collapsed ? "lg:hidden" : ""}>
                            <p className="font-medium text-gray-800">
                                {userData?.username || "Admin"}
                            </p>
                            <p className="text-xs text-gray-500">
                                Quản trị viên
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="px-3 py-4">
                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <button
                                    onClick={() => handleNavigate(item.path)}
                                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200 ${
                                        isActive(item.path)
                                            ? "bg-red-50 text-red-500"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    } ${collapsed ? "lg:justify-center lg:px-2" : ""}`}
                                    title={collapsed ? item.label : ""}
                                >
                                    <FontAwesomeIcon
                                        icon={item.icon}
                                        className={`h-5 w-5 flex-shrink-0 ${
                                            isActive(item.path)
                                                ? "text-red-500"
                                                : "text-gray-400 group-hover:text-gray-700"
                                        }`}
                                    />
                                    <span
                                        className={collapsed ? "lg:hidden" : ""}
                                    >
                                        {item.label}
                                    </span>
                                    {isActive(item.path) && (
                                        <span
                                            className={`ml-auto h-2 w-2 rounded-full bg-red-400 ${collapsed ? "lg:hidden" : ""}`}
                                        />
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logout */}
                <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-3 py-4">
                    <button
                        onClick={handleLogout}
                        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-gray-600 transition-all duration-200 hover:bg-red-50 hover:text-red-500 ${
                            collapsed ? "lg:justify-center lg:px-2" : ""
                        }`}
                        title={collapsed ? "Đăng xuất" : ""}
                    >
                        <FontAwesomeIcon
                            icon={faRightFromBracket}
                            className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-red-500"
                        />
                        <span className={collapsed ? "lg:hidden" : ""}>
                            Đăng xuất
                        </span>
                    </button>
                </div>
            </aside>

            {/* Spacer to push content */}
            <div
                className={`hidden flex-shrink-0 transition-all duration-300 lg:block ${
                    collapsed ? "w-20" : "w-64"
                }`}
            />
        </>
    );
};

export default SideBar;
