import {
    faMagnifyingGlass,
    faSpinner,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "@libs/config";
import { useSearchMovies } from "@/hooks/useMovieData";

const getPosterUrl = (movie) => {
    if (!movie?.posterUrl) return "/img-placeholder.jpg";
    return movie.posterUrl.startsWith("http")
        ? movie.posterUrl
        : `${API_URL}/images/movies/${movie.posterUrl}`;
};

const getMovieMeta = (movie) =>
    [
        movie?.year || movie?.releaseYear,
        movie?.type === "series"
            ? "Phim bộ"
            : movie?.type === "single"
              ? "Phim lẻ"
              : movie?.genres?.[0]?.nameGenre,
    ]
        .filter(Boolean)
        .join(" • ");

const HeaderSearch = ({ className = "", onNavigate }) => {
    const navigate = useNavigate();
    const rootRef = useRef(null);
    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword, setDebouncedKeyword] = useState("");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedKeyword(keyword.trim());
        }, 350);

        return () => clearTimeout(timer);
    }, [keyword]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const {
        data: searchData = [],
        loading,
        fetching,
    } = useSearchMovies(debouncedKeyword, {
        enabled: Boolean(debouncedKeyword),
        staleTime: 30 * 1000,
    });

    const movies = useMemo(
        () => (Array.isArray(searchData) ? searchData.slice(0, 6) : []),
        [searchData],
    );
    const hasKeyword = Boolean(keyword.trim());
    const isDebouncing = hasKeyword && keyword.trim() !== debouncedKeyword;
    const isSearching = hasKeyword && (isDebouncing || loading || fetching);
    const shouldShowDropdown = open && Boolean(keyword.trim());

    const clearSearch = () => {
        setKeyword("");
        setDebouncedKeyword("");
        setOpen(false);
    };

    const handleKeyDown = (event) => {
        if (event.key !== "Enter") return;

        event.preventDefault();
        if (movies[0]?._id) {
            setOpen(false);
            onNavigate?.();
            navigate(`/info/${movies[0]._id}`);
        } else {
            setOpen(true);
        }
    };

    const handleMovieClick = () => {
        setOpen(false);
        onNavigate?.();
    };

    return (
        <div ref={rootRef} className={`relative min-w-0 ${className}`}>
            <div className="flex h-11 w-full items-center gap-3 rounded-lg bg-white/10 px-4 text-gray-200 transition-colors focus-within:bg-white/15">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-lg" />
                <input
                    type="text"
                    value={keyword}
                    onChange={(event) => {
                        setKeyword(event.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => {
                        if (keyword.trim()) setOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Tìm kiếm phim..."
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-gray-300"
                    autoComplete="off"
                />
                {keyword && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="Xóa tìm kiếm"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                )}
            </div>

            {shouldShowDropdown && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[min(390px,calc(100dvh-120px))] overflow-y-auto rounded-xl border border-white/10 bg-[#101827] p-2 shadow-2xl shadow-black/50 max-sm:fixed max-sm:left-4 max-sm:right-4 max-sm:top-[76px]">
                    {isSearching ? (
                        <div className="flex items-center gap-3 px-3 py-4 text-sm text-gray-300">
                            <FontAwesomeIcon
                                icon={faSpinner}
                                className="animate-spin text-[#ffc83d]"
                            />
                            Đang tìm phim...
                        </div>
                    ) : movies.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-gray-400">
                            Không tìm thấy phim phù hợp.
                        </div>
                    ) : (
                        <ul className="space-y-1">
                            {movies.map((movie) => (
                                <li key={movie._id}>
                                    <Link
                                        to={`/info/${movie._id}`}
                                        onClick={handleMovieClick}
                                        className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-white/10"
                                    >
                                        <img
                                            src={getPosterUrl(movie)}
                                            alt={movie.originName}
                                            className="h-14 w-10 flex-shrink-0 rounded-md object-cover"
                                            loading="lazy"
                                            decoding="async"
                                            draggable="false"
                                        />
                                        <div className="min-w-0 py-1">
                                            <p className="line-clamp-1 font-semibold text-white">
                                                {movie.originName}
                                            </p>
                                            {getMovieMeta(movie) && (
                                                <p className="mt-1 text-sm text-gray-400">
                                                    {getMovieMeta(movie)}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default HeaderSearch;
