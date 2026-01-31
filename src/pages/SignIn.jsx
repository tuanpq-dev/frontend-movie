import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { validateEmail } from "../libs/utils/emailValidator";
import { showSuccessToast, showErrorToast } from "../components/Toast/Toast";
import { API_URL } from "../libs/config";

/* -------------------- InputField -------------------- */
const InputField = ({
    type,
    name,
    id,
    required = false,
    minLength,
    placeholder,
    className = "",
    value,
    onChange,
    autoFocus = false,
    iconSrc,
    iconAlt = "",
    isPassword = false,
    showPassword = false,
    onToggleShowPassword,
}) => (
    <div className="flex h-12 items-center rounded-xl border-2 border-[#d9d9d9] px-3 focus-within:border-[#77dae6]">
        <input
            type={isPassword ? (showPassword ? "text" : "password") : type}
            name={name}
            id={id}
            required={required}
            minLength={minLength}
            placeholder={placeholder}
            className={`h-full w-full text-base outline-none ${className}`}
            value={value}
            onChange={onChange}
            autoFocus={autoFocus}
        />

        {isPassword ? (
            <button
                type="button"
                tabIndex={-1}
                onClick={onToggleShowPassword}
                className="ml-3"
            >
                <img
                    src={showPassword ? "/unlock.svg" : "/lock.svg"}
                    alt="toggle password"
                />
            </button>
        ) : (
            iconSrc && <img src={iconSrc} alt={iconAlt} className="ml-3" />
        )}
    </div>
);

/* -------------------- SignIn -------------------- */
const SignIn = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [loading, setLoading] = useState(false);

    /* ---------- handlers ---------- */
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({ ...prev, [name]: value }));

        if (name === "email") {
            setEmailError(validateEmail(value) ? "" : "Email không hợp lệ");
        }
    };

    const validateForm = () => {
        if (!validateEmail(form.email)) {
            setEmailError("Email không hợp lệ");
            showErrorToast("Lỗi", "Vui lòng nhập email hợp lệ", 3000);
            return false;
        }

        if (!form.password) {
            showErrorToast("Lỗi", "Vui lòng nhập mật khẩu", 3000);
            return false;
        }

        return true;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setLoading(true);

            const { data } = await axios.post(
                `${API_URL}/api/auth/login`,
                form,
            );

            if (!data?.accesstoken) {
                throw new Error("Không nhận được access token");
            }

            Cookies.set("accessToken", data.accesstoken, {
                expires: 5,
                secure: true,
                sameSite: "strict",
            });

            showSuccessToast(
                "Đăng nhập thành công",
                "Chào mừng bạn quay trở lại 🎉",
                3000,
            );

            setTimeout(() => navigate("/"), 1000);
        } catch (error) {
            const message =
                error?.response?.status === 401
                    ? "Tên đăng nhập hoặc mật khẩu chưa đúng!"
                    : "Có lỗi xảy ra, vui lòng thử lại";

            showErrorToast("Đăng nhập thất bại", message, 4000);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    /* ---------- render ---------- */
    return (
        <div className="flex h-screen">
            <div className="mx-auto w-content-inner px-5 py-20 lg:py-40">
                <div className="flex flex-col items-center">
                    <h1>
                        <a
                            href="/"
                            className="text-3xl font-bold uppercase text-red-500"
                        >
                            Mọt phim
                        </a>
                    </h1>

                    <h2 className="mt-10 text-3xl">Đăng nhập</h2>
                    <p className="mt-3 text-center text-[#777e90]">
                        Chào mừng trở lại. Vui lòng nhập thông tin tài khoản
                    </p>

                    <form onSubmit={handleLogin} className="mt-7 w-full">
                        <div className="mt-6">
                            <InputField
                                type="email"
                                name="email"
                                placeholder="Email"
                                required
                                autoFocus
                                value={form.email}
                                onChange={handleChange}
                                iconSrc="/message.svg"
                            />
                            {emailError && (
                                <p className="mt-2 text-sm text-red-500">
                                    {emailError}
                                </p>
                            )}
                        </div>

                        <div className="mt-6">
                            <InputField
                                type="password"
                                name="password"
                                placeholder="Mật khẩu"
                                required
                                minLength={6}
                                value={form.password}
                                onChange={handleChange}
                                isPassword
                                showPassword={showPassword}
                                onToggleShowPassword={() =>
                                    setShowPassword((p) => !p)
                                }
                            />
                        </div>

                        <div className="mt-10">
                            <button
                                disabled={loading}
                                className="flex h-10 w-full items-center justify-center rounded-md bg-[#0166ff] text-white disabled:opacity-60"
                            >
                                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                            </button>
                        </div>
                    </form>

                    <p className="mt-7 flex gap-1">
                        Chưa có tài khoản?
                        <a
                            href="/sign-up"
                            className="font-medium text-[#0166ff]"
                        >
                            Đăng ký ngay
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
