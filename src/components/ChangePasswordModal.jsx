import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { showSuccessToast, showErrorToast } from "./Toast/Toast";

const ChangePasswordModal = ({ isOpen, onClose, userId }) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleClose = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrors({});
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        onClose();
    };

    const validateForm = () => {
        const newErrors = {};

        if (!currentPassword) {
            newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
        }

        if (!newPassword) {
            newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
        } else if (newPassword.length < 6) {
            newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        const token = Cookies.get("accessToken");

        try {
            await axios.put(
                "http://localhost:8080/api/users/change-password",
                {
                    userId: userId,
                    oldPassword: currentPassword,
                    newPassword: newPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            showSuccessToast(
                "Đổi mật khẩu thành công",
                "Mật khẩu của bạn đã được cập nhật",
                3000,
            );
            handleClose();
        } catch (error) {
            console.error("Error changing password:", error);
            if (
                error.response?.status === 401 ||
                error.response?.data?.message?.includes(
                    "Mật khẩu cũ không đúng",
                )
            ) {
                setErrors({
                    ...errors,
                    currentPassword: "Mật khẩu hiện tại không đúng",
                });
                showErrorToast(
                    "Đổi mật khẩu thất bại",
                    "Mật khẩu hiện tại không đúng",
                    3000,
                );
            } else {
                showErrorToast(
                    "Đổi mật khẩu thất bại",
                    error.response?.data?.message ||
                        "Có lỗi xảy ra, vui lòng thử lại",
                    3000,
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={handleClose}
            ></div>
            <div className="relative z-[1000] w-[500px] max-w-[calc(100%-48px)] rounded-2xl bg-[#fbf7f4] p-8 shadow-2xl">
                <h2 className="mb-6 text-2xl font-semibold text-[#384d6c]">
                    Đổi mật khẩu
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* Mật khẩu hiện tại */}
                    <div className="mb-4">
                        <label
                            htmlFor="current-pwd"
                            className="mb-2 block font-bold text-[#384d6c]"
                        >
                            Mật khẩu hiện tại
                        </label>
                        <div
                            className={`flex h-12 items-center rounded-lg border border-solid px-3 focus-within:border-[#77dae6] ${
                                errors.currentPassword
                                    ? "border-red-500 bg-red-50"
                                    : "border-[#d1d5db] bg-white"
                            }`}
                        >
                            <img src="/lock.svg" alt="" className="mr-2" />
                            <input
                                id="current-pwd"
                                type={showCurrentPassword ? "text" : "password"}
                                className="h-full w-full bg-transparent outline-none"
                                placeholder="Nhập mật khẩu hiện tại"
                                value={currentPassword}
                                onChange={(e) => {
                                    setCurrentPassword(e.target.value);
                                    setErrors({
                                        ...errors,
                                        currentPassword: "",
                                    });
                                }}
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowCurrentPassword(!showCurrentPassword)
                                }
                                className="ml-2"
                            >
                                <img
                                    src={
                                        showCurrentPassword
                                            ? "/show.svg"
                                            : "/hide.svg"
                                    }
                                    alt=""
                                    className="h-5 w-5"
                                />
                            </button>
                        </div>
                        {errors.currentPassword && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.currentPassword}
                            </p>
                        )}
                    </div>

                    {/* Mật khẩu mới */}
                    <div className="mb-4">
                        <label
                            htmlFor="new-pwd"
                            className="mb-2 block font-bold text-[#384d6c]"
                        >
                            Mật khẩu mới
                        </label>
                        <div
                            className={`flex h-12 items-center rounded-lg border border-solid px-3 focus-within:border-[#77dae6] ${
                                errors.newPassword
                                    ? "border-red-500 bg-red-50"
                                    : "border-[#d1d5db] bg-white"
                            }`}
                        >
                            <img src="/lock.svg" alt="" className="mr-2" />
                            <input
                                id="new-pwd"
                                type={showNewPassword ? "text" : "password"}
                                className="h-full w-full bg-transparent outline-none"
                                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    setErrors({ ...errors, newPassword: "" });
                                }}
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowNewPassword(!showNewPassword)
                                }
                                className="ml-2"
                            >
                                <img
                                    src={
                                        showNewPassword
                                            ? "/show.svg"
                                            : "/hide.svg"
                                    }
                                    alt=""
                                    className="h-5 w-5"
                                />
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.newPassword}
                            </p>
                        )}
                    </div>

                    {/* Xác nhận mật khẩu */}
                    <div className="mb-6">
                        <label
                            htmlFor="confirm-pwd"
                            className="mb-2 block font-bold text-[#384d6c]"
                        >
                            Xác nhận mật khẩu mới
                        </label>
                        <div
                            className={`flex h-12 items-center rounded-lg border border-solid px-3 focus-within:border-[#77dae6] ${
                                errors.confirmPassword
                                    ? "border-red-500 bg-red-50"
                                    : "border-[#d1d5db] bg-white"
                            }`}
                        >
                            <img src="/lock.svg" alt="" className="mr-2" />
                            <input
                                id="confirm-pwd"
                                type={showConfirmPassword ? "text" : "password"}
                                className="h-full w-full bg-transparent outline-none"
                                placeholder="Nhập lại mật khẩu mới"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setErrors({
                                        ...errors,
                                        confirmPassword: "",
                                    });
                                }}
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="ml-2"
                            >
                                <img
                                    src={
                                        showConfirmPassword
                                            ? "/show.svg"
                                            : "/hide.svg"
                                    }
                                    alt=""
                                    className="h-5 w-5"
                                />
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-lg border border-[#384d6c] bg-white px-6 py-2 font-medium text-[#384d6c] transition-colors hover:bg-gray-50"
                            disabled={isLoading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-[#384d6c] px-6 py-2 font-medium text-white transition-colors hover:bg-[#2d3d54] disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? "Đang xử lý..." : "Xác nhận"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
