import FormField from "@components/AdminForm/FormField";
import EpisodesInput from "@components/AdminForm/FormInput/EpisodesInput";
import GenresInput from "@components/AdminForm/FormInput/GenresInput";
import TypeInput from "@components/AdminForm/FormInput/TypeInput";
import SideBar from "@components/SideBar";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "@libs/config";

const EditMovie = () => {
    const { handleSubmit, register, control, setValue } = useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const token = Cookies.get("accessToken");

    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append("_id", id);
        formData.append("originName", data.originName);
        formData.append("slug", data.slug);
        formData.append("type", data.type);
        if (data.posterUrl) {
            formData.append("posterUrl", data.posterUrl[0]);
        }
        if (data.thumbUrl) {
            formData.append("thumbUrl", data.thumbUrl[0]);
        }
        formData.append("year", data.year);
        formData.append("actor", data.actor);
        formData.append("director", data.director);
        formData.append("content", data.content);
        formData.append("voteAverage", data.voteAverage);
        // Xử lý genres thành chuỗi và thêm vào formData

        formData.append("genres", data.genres);
        formData.append("time", data.time);
        formData.append("trailerKey", data.trailerKey);
        formData.append("episodes", JSON.stringify(data.episodes));

        const response = await axios.put(`${API_URL}/api/movies`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
        // Log dữ liệu trong formData
        for (const [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
        navigate("/admin/movie");
    };

    const [originName, setOriginName] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState();
    const [posterPreview, setPosterPreview] = useState("");
    const [thumbPreview, setThumbPreview] = useState("");
    const [voteAverage, setVoteAverage] = useState(9);
    const [time, setTime] = useState("");
    const [year, setYear] = useState(2023);
    const [director, setDirector] = useState("");
    const [actor, setActor] = useState("");
    const [trailerKey, setTrailerKey] = useState("");

    const handleChangePoster = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setPosterPreview(previewUrl);
            setValue("posterUrl", e.target.files);
        }
    };

    const handleChangeThumb = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setThumbPreview(previewUrl);
            setValue("thumbUrl", e.target.files);
        }
    };
    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/movies/${id}`);
                const movieData = response.data;
                const genreIds = movieData.genres.map((genre) => genre._id);
                console.log(genreIds);

                // Cập nhật form với danh sách genreIds từ API
                setValue("genres", genreIds);
                setOriginName(movieData.originName);
                setSlug(movieData.slug);
                setContent(movieData.content);
                setPosterPreview(
                    movieData.posterUrl
                        ? `${API_URL}/images/movies/` + movieData.posterUrl
                        : movieData.posterUrl,
                );
                setThumbPreview(
                    movieData.thumbUrl
                        ? `${API_URL}/images/movies/` + movieData.thumbUrl
                        : movieData.thumbUrl,
                );
                setYear(movieData.year);
                setActor(movieData.actor);
                setDirector(movieData.director);
                setVoteAverage(movieData.voteAverage);
                setTime(movieData.time);
                setTrailerKey(movieData.trailerKey);

                setValue("type", movieData.type);
                setValue("originName", movieData.originName);
                setValue("slug", movieData.slug);
                setValue("content", movieData.content);
                setValue("posterUrl", movieData.posterUrl);
                setValue("thumbUrl", movieData.thumbUrl);
                setValue("year", movieData.year);
                setValue("actor", movieData.actor);
                setValue("director", movieData.director);
                setValue("voteAverage", movieData.voteAverage);
                setValue("time", movieData.time);
                setValue("trailerKey", movieData.trailerKey);
                setValue("episodes", movieData.episodes);
                console.log(movieData.episodes);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu người dùng:", error);
            }
        };
        fetchMovie();
    }, [id, setValue]);
    return (
        <div className="flex bg-[#f9f9fb]">
            <SideBar className="flex-1" />
            <section className="flex-[4]">
                <h1
                    className="mt-10 bg-[#f4f6f9] px-2 py-2 text-3xl"
                    id="heading-top"
                >
                    Cập nhật thông tin phim
                </h1>
                <div className="mx-2 mt-4 rounded-md bg-white pb-4 shadow-md shadow-slate-400">
                    <h2 className="px-2 py-2 text-lg font-medium">
                        Thông tin cập nhật Phim
                    </h2>
                    <form
                        action=""
                        className="border-2 border-[#e3e3e9] border-l-transparent border-r-transparent p-4"
                        autoComplete="off"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="mb-3">
                            <label
                                htmlFor="origin-name"
                                className="mb-1 block font-bold"
                            >
                                Tên phim
                            </label>
                            <input
                                id="origin-name"
                                {...register("originName")}
                                type="text"
                                placeholder="Nhập tên phim"
                                value={originName}
                                onChange={(e) => setOriginName(e.target.value)}
                                className="h-10 w-full rounded-lg border border-solid border-[#d2d1d6] px-3 focus:border-[#77dae6]"
                            />
                        </div>
                        <div className="mb-3">
                            <label
                                htmlFor="slug"
                                className="mb-1 block font-bold"
                            >
                                Slug
                            </label>
                            <input
                                id="slug"
                                {...register("slug")}
                                type="text"
                                placeholder="Nhập slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="h-10 w-full rounded-lg border border-solid border-[#d2d1d6] px-3 focus:border-[#77dae6]"
                            />
                        </div>
                        <div className="mb-3">
                            <label
                                htmlFor="poster-img"
                                className="mb-1 font-bold"
                            >
                                Chọn ảnh Poster
                            </label>
                            <input
                                type="file"
                                id="poster-img"
                                accept="image/*"
                                hidden
                                onChange={handleChangePoster}
                            />
                            <label htmlFor="poster-img">
                                <img
                                    id="poster-preview"
                                    src={
                                        posterPreview
                                            ? `${posterPreview}`
                                            : "/img-placeholder.jpg"
                                    }
                                    alt=""
                                    className="mt-1 h-32 w-32 cursor-pointer rounded-xl object-cover"
                                />
                            </label>
                        </div>

                        <div className="mb-3">
                            <label
                                htmlFor="thumb-img"
                                className="mb-1 font-bold"
                            >
                                Chọn ảnh Thumb
                            </label>
                            <input
                                type="file"
                                id="thumb-img"
                                accept="image/*"
                                hidden
                                onChange={handleChangeThumb}
                            />
                            <label htmlFor="thumb-img">
                                <img
                                    id="thumb-preview"
                                    src={
                                        thumbPreview
                                            ? `${thumbPreview}`
                                            : "/img-placeholder.jpg"
                                    }
                                    alt=""
                                    className="mt-1 h-32 w-32 cursor-pointer rounded-xl object-cover"
                                />
                            </label>
                        </div>

                        <div className="mb-3">
                            {/* <label
                                htmlFor="typeSelect"
                                className="mb-1 block font-bold"
                            >
                                Chọn loại phim
                            </label>
                            <select
                                {...register("type")}
                                id="typeSelect"
                                className="block w-full rounded-lg border border-solid border-[#ced4da] bg-white px-3 py-2 focus:border-[#77dae6]"
                                value={movieType}
                                onChange={handleChangeMovieType}
                            >
                                <option value="">---Chọn loại phim---</option>
                                <option value="single">Phim lẻ</option>
                                <option value="series">Phim bộ</option>
                            </select> */}
                            <FormField
                                label="Chọn loại phim"
                                name="type"
                                control={control}
                                Component={TypeInput}
                            />
                        </div>

                        <div className="mb-3">
                            <FormField
                                label="Thể loại"
                                name="genres"
                                control={control}
                                Component={GenresInput}
                            />
                        </div>

                        <div className="mb-3">
                            <label
                                htmlFor="content"
                                className="mb-1 block font-bold"
                            >
                                Nội dung phim
                            </label>
                            <textarea
                                {...register("content")}
                                id="content"
                                className="w-full resize-none rounded-lg border border-solid border-[#d2d1d6] px-3 py-2 focus:border-[#77dae6]"
                                rows={4}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="mb-3">
                            <label
                                htmlFor="vote-average"
                                className="mb-1 block font-bold"
                            >
                                Điểm đánh giá
                            </label>
                            <input
                                id="vote-average"
                                {...register("voteAverage")}
                                type="text"
                                placeholder="Nhập điểm đánh giá"
                                value={voteAverage}
                                onChange={(e) => setVoteAverage(e.target.value)}
                                className="h-10 w-full rounded-lg border border-solid border-[#d2d1d6] px-3 focus:border-[#77dae6]"
                            />
                        </div>

                        <div className="mb-3">
                            <label
                                htmlFor="time"
                                className="mb-1 block font-bold"
                            >
                                Thời gian
                            </label>
                            <input
                                id="time"
                                {...register("time")}
                                type="text"
                                placeholder="Nhập thời gian"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="h-10 w-full rounded-lg border border-solid border-[#d2d1d6] px-3 focus:border-[#77dae6]"
                            />
                        </div>
                        <div className="mb-3">
                            <label
                                htmlFor="year"
                                className="mb-1 block font-bold"
                            >
                                Năm phát hành
                            </label>
                            <input
                                id="year"
                                {...register("year")}
                                type="text"
                                placeholder="Nhập năm phát hành"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="h-10 w-full rounded-lg border border-solid border-[#d2d1d6] px-3 focus:border-[#77dae6]"
                            />
                        </div>
                        <div className="mb-3">
                            <label
                                htmlFor="director"
                                className="mb-1 block font-bold"
                            >
                                Đạo diễn
                            </label>
                            <input
                                id="director"
                                {...register("director")}
                                type="text"
                                placeholder="Nhập đạo diễn"
                                value={director}
                                onChange={(e) => setDirector(e.target.value)}
                                className="h-10 w-full rounded-lg border border-solid border-[#d2d1d6] px-3 focus:border-[#77dae6]"
                            />
                        </div>
                        <div className="mb-3">
                            <label
                                htmlFor="actor"
                                className="mb-1 block font-bold"
                            >
                                Diễn viên
                            </label>
                            <input
                                id="actor"
                                {...register("actor")}
                                type="text"
                                placeholder="Nhập diễn viên"
                                value={actor}
                                onChange={(e) => setActor(e.target.value)}
                                className="h-10 w-full rounded-lg border border-solid border-[#d2d1d6] px-3 focus:border-[#77dae6]"
                            />
                        </div>

                        <div className="mb-3">
                            <label
                                htmlFor="trailer-key"
                                className="mb-1 block font-bold"
                            >
                                Trailer
                            </label>
                            <input
                                id="trailer-key"
                                {...register("trailerKey")}
                                type="text"
                                placeholder="Nhập trailer key"
                                value={trailerKey}
                                onChange={(e) => setTrailerKey(e.target.value)}
                                className="h-10 w-full rounded-lg border border-solid border-[#d2d1d6] px-3 focus:border-[#77dae6]"
                            />
                        </div>

                        <FormField
                            name="episodes"
                            control={control}
                            Component={EpisodesInput}
                        />

                        <div className="mt-4 flex justify-between">
                            <button className="rounded-lg bg-[#28a745] px-4 py-3 text-white">
                                Cập nhật phim
                            </button>
                            <a
                                href="#heading-top"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#779b96]"
                            >
                                <FontAwesomeIcon
                                    icon={faArrowUp}
                                    className="text-white"
                                />
                            </a>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default EditMovie;
