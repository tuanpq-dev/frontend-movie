import MovieCard from "@components/MediaList/MovieCard";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { API_URL } from "@libs/config";

const FavoriteList = () => {
    const [movieList, setMovieList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Hàm bất đồng bộ để lấy dữ liệu từ API
        const fetchFavoriteMovies = async () => {
            try {
                // Gửi yêu cầu GET để lấy danh sách phim yêu thích
                const response = await axios.get(
                    `${API_URL}/api/favoriteMovies`,
                    {
                        headers: {
                            Authorization: `Bearer ${Cookies.get("accessToken")}`, // Đảm bảo token đã được lưu trong localStorage
                        },
                    },
                );
                setMovieList(response.data.movieNames);
            } catch (err) {
                console.log("error", err);
                // Nếu response trả về message là danh sách không tồn tại, set danh sách rỗng
                if (
                    err.response?.data?.message ===
                    "Danh sách yêu thích không tồn tại!"
                ) {
                    setMovieList([]);
                } else {
                    setError("Đã xảy ra lỗi khi lấy danh sách yêu thích!");
                }
            } finally {
                setLoading(false); // Dừng trạng thái loading khi hoàn tất
            }
        };

        fetchFavoriteMovies();
    }, []);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    const deleteFavoriteMovie = async (id) => {
        try {
            // Gọi API xóa phim khỏi danh sách yêu thích
            const response = await axios.delete(
                `${API_URL}/api/favoriteMovies/deleteMovieId/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("accessToken")}`, // Đảm bảo token được lưu ở localStorage
                    },
                },
            );
            const updatedMediaList = movieList.filter((movie) => {
                return movie._id !== id;
            });
            setMovieList(updatedMediaList);
        } catch (error) {
            console.error("Error deleting favorite movie:", error);
            alert("Xóa phim không thành công!"); // Hiển thị thông báo lỗi cho người dùng
        }
    };
    return (
        <div className="bg-[#292e39] px-5 py-6 text-white lg:px-8 lg:py-10">
            <div className="mx-auto max-w-screen-2xl">
                <h1 className="mb-8 rounded-xl bg-red-500 py-4 text-center text-xl font-medium text-white">
                    Danh sách yêu thích
                </h1>
                {movieList && movieList.length === 0 ? (
                    <div className="py-6 text-center text-gray-400">
                        Hiện chưa có phim yêu thích nào!
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {movieList.map((movie) => (
                            <div key={movie._id} className="relative">
                                <MovieCard
                                    key={movie._id}
                                    name={movie.originName}
                                    posterUrl={
                                        movie.posterUrl
                                            ? `${API_URL}/images/movies/${movie.posterUrl}`
                                            : "/img-placeholder.jpg"
                                    }
                                    year={movie.year}
                                    time={movie.time}
                                    type={movie.type}
                                    slug={movie.slug}
                                    _id={movie._id}
                                />
                                <button
                                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-[50%] bg-[#fd5465] hover:bg-[#f7941e]"
                                    onClick={() => {
                                        deleteFavoriteMovie(movie?._id);
                                    }}
                                >
                                    <div className="h-1 w-4 rounded-sm bg-white"></div>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
export default FavoriteList;
