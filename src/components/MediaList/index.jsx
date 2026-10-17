import { memo } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import MovieCard from "./MovieCard";

export const MovieGrid = ({ movies = [] }) => (
    <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 md:gap-x-4 min-[1025px]:grid-cols-5 xl:grid-cols-6">
        {movies.map((movie) => (
            <MovieCard key={movie._id || movie.slug} movie={movie} />
        ))}
    </div>
);

// movies: danh sách đã normalize; viewAllTo: link "Xem tất cả" (tùy chọn)
const MediaList = ({ movies = [], title, viewAllTo }) => {
    if (!movies.length) return null;

    return (
        <section className="media-section px-3 py-6 text-white sm:px-5 min-[1025px]:px-8 min-[1025px]:py-8">
            <div className="mb-4 flex items-center gap-3 sm:mb-5">
                <h2 className="text-lg font-bold sm:text-xl md:text-2xl min-[1025px]:text-[28px]">
                    {title}
                </h2>
                {viewAllTo && (
                    <Link
                        to={viewAllTo}
                        className="ml-auto flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-primary sm:ml-2"
                    >
                        Xem tất cả
                        <FontAwesomeIcon
                            icon={faChevronRight}
                            className="text-[10px]"
                        />
                    </Link>
                )}
            </div>
            <MovieGrid movies={movies} />
        </section>
    );
};

export default memo(MediaList);
