import MovieCard from "./MovieCard";
import { API_URL } from "@libs/config";

const MediaList = ({ movies = [], title }) => {
    return (
        <div className="bg-[#292e39] px-5 py-6 text-white lg:px-8 lg:py-10">
            <h2 className="mb-2 text-xl font-bold md:text-2xl lg:text-3xl">
                {title}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                {movies.map((movie) => (
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
                        _id={movie._id}
                    />
                ))}
            </div>
        </div>
    );
};
export default MediaList;
