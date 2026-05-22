import { memo } from "react";
import MovieCard from "./MovieCard";
import { API_URL } from "@libs/config";

const getPosterUrl = (movie) => {
    if (!movie?.posterUrl) return "/img-placeholder.jpg";
    return movie.posterUrl.startsWith("http")
        ? movie.posterUrl
        : `${API_URL}/images/movies/${movie.posterUrl}`;
};

const MediaList = ({ movies = [], title }) => {
    return (
        <section className="media-section px-3 py-6 text-white sm:px-5 min-[1025px]:px-8 min-[1025px]:py-11">
            <div className="mb-4 flex items-center gap-2.5 sm:mb-5 sm:gap-3">
                <span className="h-6 w-1 rounded-full bg-[#ffc83d] sm:h-7" />
                <h2 className="text-lg font-black tracking-tight sm:text-xl md:text-2xl min-[1025px]:text-3xl">
                    {title}
                </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 md:gap-5 min-[1025px]:grid-cols-5 xl:grid-cols-6">
                {movies.map((movie) => (
                    <MovieCard
                        key={movie._id}
                        name={movie.originName}
                        posterUrl={getPosterUrl(movie)}
                        year={movie.year}
                        time={movie.time}
                        type={movie.type}
                        content={movie.content}
                        _id={movie._id}
                    />
                ))}
            </div>
        </section>
    );
};

export default memo(MediaList);
