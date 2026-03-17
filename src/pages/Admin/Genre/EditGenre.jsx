import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@libs/config";

const EditGenre = () => {
    const { handleSubmit, register, reset, setValue } = useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const token = Cookies.get("accessToken");
    const onSubmit = async (data) => {
        try {
            const response = await axios.put(`${API_URL}/api/genres/`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            navigate("/admin/genre");
        } catch (error) {
            console.error("Error updating genre:", error);
        }
    };

    const [nameGenre, setNameGenre] = useState("");
    const [desc, setDesc] = useState("");

    // Hàm fetch dữ liệu người dùng từ API
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(
                    `${API_URL}/api/genres/find/${id}`,
                );
                const genreData = response.data;
                // Cập nhật state với dữ liệu người dùng
                setNameGenre(genreData.nameGenre);
                setDesc(genreData.desc);

                setValue("nameGenre", genreData.nameGenre);
                setValue("desc", genreData.desc);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu người dùng:", error);
            }
        };
        fetchUser();
    }, [id, setValue]);

    return (
        <section>
            <h1
                    className="mt-10 bg-[#f4f6f9] px-2 py-2 text-3xl"
                    id="heading-top"
                >
                    Cập nhật thông tin thể loại
                </h1>
                <div className="mx-2 mt-4 rounded-md bg-white pb-4 shadow-md shadow-slate-400">
                    <h2 className="px-2 py-2 text-lg font-medium">
                        Thông tin cập nhật Thể loại
                    </h2>
                    <form
                        action=""
                        className="border-2 border-[#e3e3e9] border-l-transparent border-r-transparent p-4"
                        autoComplete="off"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="mb-3">
                            <label
                                htmlFor="nameGenre"
                                className="mb-1 block font-bold"
                            >
                                Tên thể loại
                            </label>

                            <input {...register("_id")} value={id} hidden />
                            <input
                                id="nameGenre"
                                {...register("nameGenre")}
                                type="text"
                                value={nameGenre}
                                onChange={(e) => setNameGenre(e.target.value)}
                                placeholder="Nhập tên thể loại"
                                className="h-10 w-full rounded-lg border border-solid border-[#d2d1d6] px-3 focus:border-[#77dae6]"
                            />
                        </div>
                        <div className="mb-3">
                            <label
                                htmlFor="desc"
                                className="mb-1 block font-bold"
                            >
                                Mô tả
                            </label>
                            <input
                                id="desc"
                                {...register("desc")}
                                type="text"
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                placeholder="Nhập mô tả"
                                className="h-10 w-full rounded-lg border border-solid border-[#d2d1d6] px-3 focus:border-[#77dae6]"
                            />
                        </div>

                        <div className="mt-4 flex justify-between">
                            <button
                                className="rounded-lg bg-[#28a745] px-4 py-3 text-white"
                                type="submit"
                            >
                                Cập nhật thể loại
                            </button>
                        </div>
                    </form>
                </div>
            </section>
    );
};
export default EditGenre;
