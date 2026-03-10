import MediaList from "@components/MediaList";
import axios from "axios";
import { useEffect, useState } from "react";
import { API_URL } from "@libs/config";

const CartoonMovie = () => {
    const [movies, setMovies] = useState([]);
    const [filteredMovieCartoons, setFilteredMovieCartoons] = useState([]);
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                // Gửi yêu cầu để lấy toàn bộ danh sách phim
                const response = await axios.get(`${API_URL}/api/movies`);
                setMovies(response.data); // Lưu toàn bộ danh sách phim
            } catch (error) {
                console.error("Error fetching movies:", error);
            }
        };

        fetchMovies(); // Gọi hàm để lấy dữ liệu khi component mount
    }, []);
    useEffect(() => {
        const filterCartoons = movies.filter((movie) =>
            movie.genres.some((gen) => gen?.nameGenre === "Hoạt hình"),
        );
        setFilteredMovieCartoons(filterCartoons);
    }, [movies]);
    return (
        <div className="min-h-screen bg-[#292e39]">
            <MediaList movies={filteredMovieCartoons} title={`Hoạt hình`} />
        </div>
    );
};
export default CartoonMovie;
