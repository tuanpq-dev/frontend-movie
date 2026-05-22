import MovieCard from "@components/MediaList/MovieCard";
import { MovieGridSkeleton } from "@components/Skeleton";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo, useState } from "react";
import { API_URL } from "@libs/config";
import { useSearchMovies } from "@/hooks/useMovieData";

const getPosterUrl = (media) => {
    if (!media?.posterUrl) return "/img-placeholder.jpg";
    return media.posterUrl.startsWith("http")
        ? media.posterUrl
        : `${API_URL}/images/movies/${media.posterUrl}`;
};

const SearchPage = () => {
    const [searchText, setSearchText] = useState("");
    const [submittedSearch, setSubmittedSearch] = useState("");
    const { data: movieList = [], loading } = useSearchMovies(submittedSearch, {
        enabled: Boolean(submittedSearch),
    });

    const movies = useMemo(
        () => (Array.isArray(movieList) ? movieList : []),
        [movieList],
    );

    const handleSearch = (e) => {
        e.preventDefault();
        setSubmittedSearch(searchText.trim());
    };

    const clearSearch = () => {
        setSearchText("");
        setSubmittedSearch("");
    };

    return (
        <div className="page-surface px-5 py-3 lg:py-5">
            <div className="mx-auto max-w-screen-xl">
                <form
                    onSubmit={handleSearch}
                    className="flex items-center gap-2"
                >
                    <div className="flex h-12 w-full items-center rounded-lg border-[2px] border-solid border-[#d2d1d6] px-3 transition-colors focus-within:border-[#77dae6] sm:w-1/2 xl:w-1/3">
                        <input
                            type="text"
                            placeholder="Nhập tên phim bạn cần tìm"
                            className="h-full w-full"
                            autoFocus
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <button
                            type="button"
                            className="ml-3 flex h-11 w-11 items-center justify-center"
                            onClick={clearSearch}
                            aria-label="Xóa tìm kiếm"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                    <button
                        className="flex h-[52px] min-w-[52px] items-center justify-center rounded-lg bg-[#0d6efd] px-5 transition-colors hover:bg-[#0b5ed7]"
                        type="submit"
                    >
                        <img
                            src="/search.svg"
                            alt="Search"
                            className="invert"
                        />
                    </button>
                </form>

                {loading && movies.length === 0 ? (
                    <MovieGridSkeleton title={false} />
                ) : (
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                        {movies.map((media) => (
                            <MovieCard
                                key={media._id}
                                name={media.originName}
                                posterUrl={getPosterUrl(media)}
                                year={media.year}
                                time={media.time}
                                type={media.type}
                                _id={media._id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
