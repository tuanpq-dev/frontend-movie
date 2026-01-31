import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { validateEmail } from "../libs/utils/emailValidator";
import { showSuccessToast, showErrorToast } from "../components/Toast/Toast";
import { API_URL } from "../libs/config";

const SignIn = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === "email") {
            setEmailError("");
        }
        if (
            e.target.name === "confirmPassword" ||
            e.target.name === "password"
        ) {
            setPasswordError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let hasError = false;

        if (!validateEmail(formData.email)) {
            setEmailError("Email không hợp lệ.");
            hasError = true;
        }

        if (formData.password !== formData.confirmPassword) {
            setPasswordError("Mật khẩu không khớp.");
            hasError = true;
        }

        if (hasError) return;

        try {
            const response = await axios.post(`${API_URL}/api/auth/register`, {
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });

            if (response.status === 201) {
                showSuccessToast(
                    "Đăng ký thành công",
                    "Bạn có thể đăng nhập ngay!",
                );
                setFormData({
                    username: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                });
                setError("");
                setEmailError("");
                setPasswordError("");
                navigate("/sign-in");
            }
        } catch (err) {
            showErrorToast("Đăng ký thất bại", "Vui lòng thử lại.");
            setError("Đăng ký thất bại, vui lòng thử lại.");
            console.log(err);
        }
    };
    return (
        <div className="flex h-[100vh]">
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
                    <h2 className="mt-10 text-3xl text-[#010101]">Đăng ký</h2>
                    <p className="mt-3 text-center text-[#777e90]">
                        Hãy tạo tài khoản và bắt đầu trải nghiệm cùng chúng tôi
                    </p>
                    <form
                        action=""
                        onSubmit={handleSubmit}
                        className="mt-7 w-full"
                    >
                        <div className="mt-6">
                            <div className="flex h-12 items-center rounded-xl border-2 border-solid border-[#d9d9d9] px-3 focus-within:border-[#77dae6]">
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    placeholder="User Name"
                                    className="h-full w-full text-base"
                                />
                                <img
                                    src="/message.svg"
                                    alt=""
                                    className="ml-3"
                                />
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="flex h-12 items-center rounded-xl border-2 border-solid border-[#d9d9d9] px-3 focus-within:border-[#77dae6]">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Email"
                                    className="h-full w-full text-base"
                                    autoFocus
                                    pattern="^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$"
                                />
                                <img
                                    src="/message.svg"
                                    alt=""
                                    className="ml-3"
                                />
                            </div>
                            {emailError && (
                                <p className="mt-2 text-sm text-red-500">
                                    {emailError}
                                </p>
                            )}
                        </div>
                        <div className="mt-6">
                            <div className="flex h-12 items-center rounded-xl border-2 border-solid border-[#d9d9d9] px-3 focus-within:border-[#77dae6]">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    placeholder="Mật khẩu"
                                    className="h-full w-full"
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="ml-3"
                                >
                                    <img
                                        src={
                                            showPassword
                                                ? "/unlock.svg"
                                                : "/lock.svg"
                                        }
                                        alt="toggle password"
                                    />
                                </button>
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="flex h-12 items-center rounded-xl border-2 border-solid border-[#d9d9d9] px-3 focus-within:border-[#77dae6]">
                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    placeholder="Nhập lại mật khẩu"
                                    className="h-full w-full"
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() =>
                                        setShowConfirmPassword((p) => !p)
                                    }
                                    className="ml-3"
                                >
                                    <img
                                        src={
                                            showConfirmPassword
                                                ? "/unlock.svg"
                                                : "/lock.svg"
                                        }
                                        alt="toggle confirm password"
                                    />
                                </button>
                            </div>
                            {passwordError && (
                                <p className="mt-2 text-sm text-red-500">
                                    {passwordError}
                                </p>
                            )}
                        </div>
                        {error && <p className="mt-3 text-red-500">{error}</p>}
                        <div className="mt-10">
                            <button
                                type="submit"
                                className="flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-[#0166ff] px-5 text-white"
                            >
                                Đăng ký
                            </button>
                        </div>
                    </form>
                    <p className="mt-7 flex gap-1">
                        Đã có tài khoản?
                        <a
                            href="/sign-in"
                            className="font-medium text-[#0166ff]"
                        >
                            Đăng nhập ngay
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
