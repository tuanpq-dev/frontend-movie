import MediaList from "@components/MediaList";
import { MEDIA_TABS } from "@libs/constants";
import axios from "axios";
import { useEffect, useState } from "react";
import { API_URL } from "@libs/config";

const SingleMovie = () => {
    const [movies, setMovies] = useState([]);
    const [filteredMovieSingles, setFilteredMovieSingles] = useState([]);
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
        // Lọc phim có type là "single"
        const filterSingle = movies.filter((movie) => movie.type === "single");
        setFilteredMovieSingles(filterSingle);
    }, [movies]);
    return (
        <div className="min-h-screen bg-[#292e39]">
            <MediaList movies={filteredMovieSingles} title={`Phim lẻ`} />
        </div>
    );
};

export default SingleMovie;
