import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import FormField from "@components/AdminForm/FormField";
import AccountTypeInput from "@components/AdminForm/FormInput/AccountTypeInput";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL, getAvatarUrl } from "@libs/config";

const EditUser = () => {
    const navigate = useNavigate();
    const { handleSubmit, register, control, setValue } = useForm();
    const { id } = useParams();
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarPreview, setAvatarPreview] = useState("");

    // Hàm fetch dữ liệu người dùng từ API
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = Cookies.get("accessToken");
                const response = await axios.get(
                    `${API_URL}/api/users/find/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );
                const userData = response.data;
                // Cập nhật state với dữ liệu người dùng
                setUserName(userData.username);
                setEmail(userData.email);
                setAvatarPreview(
                    getAvatarUrl(userData.avatar),
                );// Nếu có avatar từ DB
                setValue("username", userData.username);
                setValue("email", userData.email);
                setValue("isAdmin", userData.isAdmin);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu người dùng:", error);
            }
        };
        fetchUser();
    }, [id, setValue]);

    const onSubmit = async (data) => {
        const token = Cookies.get("accessToken");

        try {
            const formData = new FormData();

            // Thêm các trường dữ liệu khác vào formData
            formData.append("_id", id);
            formData.append("username", data.username);
            formData.append("email", data.email);
            formData.append("isAdmin", data.isAdmin);

            // Nếu có ảnh mới, thêm file vào formData
            if (data.avatar) {
                formData.append("avatar", data.avatar[0]); // data.avatar[0] vì file là array
            }

            const response = await axios.put(
                `${API_URL}/api/users/`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data", // Đảm bảo header phù hợp
                    },
                },
            );

            navigate("/admin/user");
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    const handleChangeAvatar = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
            setValue("avatar", e.target.files);
        }
    };

    return (
        <section>
            <h1
                    className="mt-10 bg-[#f4f6f9] px-2 py-2 text-3xl"
                    id="heading-top"
                >
                    Cập nhật thông tin người dùng
                </h1>
                <div className="mx-2 mt-4 rounded-md bg-white pb-4 shadow-md shadow-slate-400">
                    <h2 className="px-2 py-2 text-lg font-medium">
                        Thông tin cập nhật Người dùng
                    </h2>
                    <form
                        action=""
                        className="border-2 border-[#e3e3e9] border-l-transparent border-r-transparent p-4"
                        autoComplete="off"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="mb-3">
                            <label
                                htmlFor="user-name"
                                className="mb-1 block font-bold"
                            >
                                Tên người dùng
                            </label>
                            <input
                                id="username"
                                {...register("username")}
                                type="text"
                                placeholder="Nhập tên người dùng"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="h-10 w-full rounded-lg border border-solid border-[#d2d1d6] px-3 focus:border-[#77dae6]"
                            />
                        </div>
                        <div className="mb-3">
                            <label
                                htmlFor="email"
                                className="mb-1 block font-bold"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                {...register("email")}
                                type="email"
                                placeholder="Nhập email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-10 w-full rounded-lg border border-solid border-[#d2d1d6] px-3 focus:border-[#77dae6]"
                            />
                        </div>
                        <div className="mb-3">
                            <label
                                htmlFor="avatar-img"
                                className="mb-1 font-bold"
                            >
                                Chọn ảnh Avatar
                            </label>
                            <input
                                type="file"
                                id="avatar-img"
                                accept="image/*"
                                hidden
                                onChange={handleChangeAvatar}
                            />
                            <label htmlFor="avatar-img">
                                <img
                                    id="avatar-preview"
                                    src={avatarPreview}
                                    alt=""
                                    className="mt-1 h-32 w-32 cursor-pointer rounded-xl object-cover"
                                />
                            </label>
                        </div>

                        <div className="mb-3">
                            <FormField
                                label="Quyền"
                                name="isAdmin"
                                control={control}
                                defaultValue={setValue}
                                Component={AccountTypeInput}
                            />
                        </div>

                        <div className="mt-4">
                            <button className="rounded-lg bg-[#28a745] px-4 py-3 text-white">
                                Cập nhật người dùng
                            </button>
                        </div>
                    </form>
                </div>
            </section>
    );
};
export default EditUser;
