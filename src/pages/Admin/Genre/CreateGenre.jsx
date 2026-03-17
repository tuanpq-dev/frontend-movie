import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useState } from "react";
import { API_URL } from "@libs/config";

const CreateGenre = () => {
    const { handleSubmit, register, reset } = useForm();
    const [nameGenre, setNameGenre] = useState("");
    const [desc, setDesc] = useState("");
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        const token = Cookies.get("accessToken");
        try {
            const response = await axios.post(`${API_URL}/api/genres`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            navigate("/admin/genre");
        } catch (err) {
            setError("Đăng ký thất bại, vui lòng thử lại.");
        }
    };

    return (
        <section>
            <h1
                className="mt-10 bg-[#f4f6f9] px-2 py-2 text-3xl"
                id="heading-top"
            >
                Thêm mới thể loại
            </h1>
            <div className="mx-2 mt-4 rounded-md bg-white pb-4 shadow-md shadow-slate-400">
                <h2 className="px-2 py-2 text-lg font-medium">
                    Thông tin thêm mới Thể loại
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
                        <input
                            id="nameGenre"
                            {...register("nameGenre")}
                            type="text"
                            placeholder="Nhập tên thể loại"
                            onChange={(e) => setNameGenre(e.target.value)}
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
                            placeholder="Nhập mô tả"
                            onChange={(e) => setDesc(e.target.value)}
                            className="h-10 w-full rounded-lg border border-solid border-[#d2d1d6] px-3 focus:border-[#77dae6]"
                        />
                    </div>

                    <div className="mt-4 flex justify-between">
                        <button
                            className="rounded-lg bg-[#28a745] px-4 py-3 text-white"
                            type="submit"
                        >
                            Thêm mới
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};
export default CreateGenre;
