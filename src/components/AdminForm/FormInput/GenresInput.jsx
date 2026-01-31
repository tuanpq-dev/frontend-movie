import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@libs/config";

const GenresInput = ({ onChange, value = [] }) => {
    const [genres, setGenres] = useState([]);
    useEffect(() => {
        // Gọi API để lấy dữ liệu
        const fetchGenres = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/genres`);
                setGenres(response.data); // Thay thế toàn bộ state bằng dữ liệu từ API
            } catch (error) {
                console.error("Error fetching genres:", error);
            }
        };

        fetchGenres(); // Gọi hàm để lấy dữ liệu khi component mount
    }, []);
    return (
        <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
                <div key={genre._id}>
                    <p
                        className={`cursor-pointer rounded-md border px-2 py-1 ${value?.includes(genre._id) ? "bg-black text-white" : ""}`}
                        onClick={() => {
                            let currentValue = [...value];
                            if (value.includes(genre._id)) {
                                currentValue = currentValue.filter(
                                    (g) => g !== genre._id,
                                );
                            } else {
                                currentValue = [...value, genre._id];
                            }
                            onChange(currentValue);
                        }}
                    >
                        {genre.nameGenre}
                    </p>
                </div>
            ))}
        </div>
    );
};
export default GenresInput;
