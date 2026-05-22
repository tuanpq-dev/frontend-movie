import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useUserContext } from "@context/UserContext";
import { API_URL } from "@libs/config";
import { validateEmail } from "@libs/utils/emailValidator";
import { showErrorToast, showSuccessToast } from "./Toast/Toast";

const INITIAL_LOGIN_FORM = {
    email: "",
    password: "",
};

const INITIAL_REGISTER_FORM = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
};

const AuthInput = ({
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    autoFocus = false,
    isPassword = false,
    showPassword = false,
    onToggleShowPassword,
}) => (
    <div className="flex h-11 items-center rounded-xl border border-white/10 bg-[#0d1422] px-3.5 transition-colors focus-within:border-[#ffc83d] focus-within:ring-2 focus-within:ring-[#ffc83d]/20 sm:h-12 sm:px-4">
        <input
            type={isPassword ? (showPassword ? "text" : "password") : type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-400 sm:text-[15px]"
            required
            minLength={isPassword ? 6 : undefined}
        />
        {isPassword && (
            <button
                type="button"
                tabIndex={-1}
                onClick={onToggleShowPassword}
                className="ml-3 text-xs font-semibold text-[#ffcf45]"
            >
                {showPassword ? "Ẩn" : "Hiện"}
            </button>
        )}
    </div>
);

const AuthModal = ({ initialMode = "login", onClose }) => {
    const { refreshUser } = useUserContext();
    const [mode, setMode] = useState(initialMode);
    const [loginForm, setLoginForm] = useState(INITIAL_LOGIN_FORM);
    const [registerForm, setRegisterForm] = useState(INITIAL_REGISTER_FORM);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [loading, setLoading] = useState(false);

    const isLogin = mode === "login";

    useEffect(() => {
        const previousOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = "hidden";

        return () => {
            document.documentElement.style.overflow = previousOverflow;
        };
    }, []);

    const resetFeedback = () => {
        setErrors({});
        setApiError("");
    };

    const switchMode = (nextMode) => {
        setMode(nextMode);
        resetFeedback();
    };

    const handleLoginChange = (event) => {
        const { name, value } = event.target;
        setLoginForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setApiError("");
    };

    const handleRegisterChange = (event) => {
        const { name, value } = event.target;
        setRegisterForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setApiError("");
    };

    const validateLogin = () => {
        const nextErrors = {};

        if (!validateEmail(loginForm.email)) {
            nextErrors.email = "Email không hợp lệ.";
        }
        if (!loginForm.password) {
            nextErrors.password = "Vui lòng nhập mật khẩu.";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const validateRegister = () => {
        const nextErrors = {};

        if (!registerForm.username.trim()) {
            nextErrors.username = "Vui lòng nhập tên người dùng.";
        }
        if (!validateEmail(registerForm.email)) {
            nextErrors.email = "Email không hợp lệ.";
        }
        if (registerForm.password.length < 6) {
            nextErrors.password = "Mật khẩu tối thiểu 6 ký tự.";
        }
        if (registerForm.password !== registerForm.confirmPassword) {
            nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        if (!validateLogin()) return;

        try {
            setLoading(true);
            setApiError("");

            const { data } = await axios.post(
                `${API_URL}/api/auth/login`,
                loginForm,
            );

            if (!data?.accesstoken) {
                throw new Error("Không nhận được access token");
            }

            Cookies.set("accessToken", data.accesstoken, {
                expires: 5,
                secure: true,
                sameSite: "strict",
            });

            if (data.role) {
                localStorage.setItem("userRole", data.role);
            }
            if (data.permissions) {
                localStorage.setItem(
                    "userPermissions",
                    JSON.stringify(data.permissions),
                );
            }
            if (data.modules) {
                localStorage.setItem(
                    "userModules",
                    JSON.stringify(data.modules),
                );
            }

            await refreshUser();
            showSuccessToast(
                "Đăng nhập thành công",
                "Chào mừng bạn quay trở lại",
                3000,
            );
            onClose();
        } catch (error) {
            const message =
                error?.response?.status === 401
                    ? "Tên đăng nhập hoặc mật khẩu chưa đúng."
                    : error?.response?.data?.message ||
                      "Có lỗi xảy ra, vui lòng thử lại.";

            setApiError(message);
            showErrorToast("Đăng nhập thất bại", message, 4000);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (event) => {
        event.preventDefault();
        if (!validateRegister()) return;

        try {
            setLoading(true);
            setApiError("");

            const response = await axios.post(`${API_URL}/api/auth/register`, {
                username: registerForm.username,
                email: registerForm.email,
                password: registerForm.password,
            });

            if (response.status === 201) {
                showSuccessToast(
                    "Đăng ký thành công",
                    "Bạn có thể đăng nhập ngay.",
                    3000,
                );
                setRegisterForm(INITIAL_REGISTER_FORM);
                onClose();
            }
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                "Đăng ký thất bại, vui lòng thử lại.";

            setApiError(message);
            showErrorToast("Đăng ký thất bại", message, 4000);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-[#02050c]/75 p-4 backdrop-blur-[3px]">
            <div className="relative my-auto max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[500px] overflow-y-auto rounded-2xl border border-white/10 bg-[#101827] p-4 text-white shadow-2xl shadow-black/50 sm:p-6 lg:p-7">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm text-gray-200 transition-colors hover:bg-white/15 sm:right-4 sm:top-4 sm:h-10 sm:w-10"
                    aria-label="Đóng"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>

                <div className="pr-10">
                    <p className="text-xs font-black uppercase tracking-wide text-red-500 sm:text-sm">
                        Một phim
                    </p>
                    <h2 className="mt-1.5 text-xl font-bold sm:mt-2 sm:text-2xl">
                        {isLogin ? "Đăng nhập" : "Đăng ký"}
                    </h2>
                    <p className="mt-1.5 text-sm leading-5 text-gray-300 sm:mt-2">
                        {isLogin
                            ? "Tiếp tục xem phim và quản lý danh sách yêu thích."
                            : "Tạo tài khoản để bắt đầu trải nghiệm movie-web."}
                    </p>
                </div>

                <div className="mt-4 grid grid-cols-2 rounded-full border border-white/10 bg-[#070b14] p-1 sm:mt-5">
                    <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className={`h-9 rounded-full text-sm font-semibold transition-colors sm:h-10 ${
                            isLogin
                                ? "bg-[#ffc83d] text-[#120d02]"
                                : "text-gray-300 hover:text-white"
                        }`}
                    >
                        Đăng nhập
                    </button>
                    <button
                        type="button"
                        onClick={() => switchMode("register")}
                        className={`h-9 rounded-full text-sm font-semibold transition-colors sm:h-10 ${
                            !isLogin
                                ? "bg-[#ffc83d] text-[#120d02]"
                                : "text-gray-300 hover:text-white"
                        }`}
                    >
                        Đăng ký
                    </button>
                </div>

                {apiError && (
                    <div className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-100 sm:mt-4 sm:px-4 sm:py-3">
                        {apiError}
                    </div>
                )}

                {isLogin ? (
                    <form onSubmit={handleLoginSubmit} className="mt-4 sm:mt-5">
                        <div className="space-y-3.5 sm:space-y-4">
                            <div>
                                <AuthInput
                                    type="email"
                                    name="email"
                                    value={loginForm.email}
                                    onChange={handleLoginChange}
                                    placeholder="Email"
                                    autoFocus
                                />
                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-red-300 sm:text-sm">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div>
                                <AuthInput
                                    name="password"
                                    value={loginForm.password}
                                    onChange={handleLoginChange}
                                    placeholder="Mật khẩu"
                                    isPassword
                                    showPassword={showLoginPassword}
                                    onToggleShowPassword={() =>
                                        setShowLoginPassword((prev) => !prev)
                                    }
                                />
                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-red-300 sm:text-sm">
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col-reverse gap-2.5 sm:mt-6 sm:flex-row sm:gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="flex h-10 flex-1 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white transition-colors hover:bg-white/15 disabled:opacity-60 sm:h-11"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex h-10 flex-1 items-center justify-center rounded-full bg-[#ffc83d] text-sm font-semibold text-[#120d02] transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:h-11"
                            >
                                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form
                        onSubmit={handleRegisterSubmit}
                        className="mt-4 sm:mt-5"
                    >
                        <div className="space-y-3.5 sm:space-y-4">
                            <div>
                                <AuthInput
                                    name="username"
                                    value={registerForm.username}
                                    onChange={handleRegisterChange}
                                    placeholder="Tên người dùng"
                                    autoFocus
                                />
                                {errors.username && (
                                    <p className="mt-1.5 text-xs text-red-300 sm:text-sm">
                                        {errors.username}
                                    </p>
                                )}
                            </div>
                            <div>
                                <AuthInput
                                    type="email"
                                    name="email"
                                    value={registerForm.email}
                                    onChange={handleRegisterChange}
                                    placeholder="Email"
                                />
                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-red-300 sm:text-sm">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div>
                                <AuthInput
                                    name="password"
                                    value={registerForm.password}
                                    onChange={handleRegisterChange}
                                    placeholder="Mật khẩu"
                                    isPassword
                                    showPassword={showRegisterPassword}
                                    onToggleShowPassword={() =>
                                        setShowRegisterPassword((prev) => !prev)
                                    }
                                />
                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-red-300 sm:text-sm">
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                            <div>
                                <AuthInput
                                    name="confirmPassword"
                                    value={registerForm.confirmPassword}
                                    onChange={handleRegisterChange}
                                    placeholder="Nhập lại mật khẩu"
                                    isPassword
                                    showPassword={showConfirmPassword}
                                    onToggleShowPassword={() =>
                                        setShowConfirmPassword((prev) => !prev)
                                    }
                                />
                                {errors.confirmPassword && (
                                    <p className="mt-1.5 text-xs text-red-300 sm:text-sm">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col-reverse gap-2.5 sm:mt-6 sm:flex-row sm:gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="flex h-10 flex-1 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white transition-colors hover:bg-white/15 disabled:opacity-60 sm:h-11"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex h-10 flex-1 items-center justify-center rounded-full bg-[#ffc83d] text-sm font-semibold text-[#120d02] transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:h-11"
                            >
                                {loading ? "Đang đăng ký..." : "Đăng ký"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>,
        document.body,
    );
};

export default AuthModal;
