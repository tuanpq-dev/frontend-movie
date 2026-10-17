import {
    faMagnifyingGlass,
    faSpinner,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useKKSearch } from "@/hooks/useMovieData";
import PosterImage from "./PosterImage";

const getMovieMeta = (movie) =>
    [movie?.year, movie?.typeLabel, movie?.episodeCurrent]
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
        data: searchData,
        loading,
        fetching,
    } = useKKSearch(debouncedKeyword, { limit: 6 }, {
        staleTime: 5 * 60 * 1000,
    });

    const movies = useMemo(() => searchData?.items || [], [searchData]);
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
        const trimmed = keyword.trim();
        if (!trimmed) return;
        setOpen(false);
        onNavigate?.();
        navigate(`/tim-kiem?keyword=${encodeURIComponent(trimmed)}`);
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
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[min(390px,calc(100dvh-120px))] overflow-y-auto rounded-xl border border-white/10 bg-surface-2 p-2 shadow-2xl shadow-black/50 max-sm:fixed max-sm:left-4 max-sm:right-4 max-sm:top-[60px]">
                    {isSearching ? (
                        <div className="flex items-center gap-3 px-3 py-4 text-sm text-gray-300">
                            <FontAwesomeIcon
                                icon={faSpinner}
                                className="animate-spin text-primary"
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
                                <li key={movie._id || movie.slug}>
                                    <Link
                                        to={`/phim/${movie.slug}`}
                                        onClick={handleMovieClick}
                                        className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-white/10"
                                    >
                                        <PosterImage
                                            src={movie.posterUrl}
                                            alt={movie.name}
                                            widths={[80]}
                                            className="h-14 w-10 flex-shrink-0 rounded-md object-cover"
                                        />
                                        <div className="min-w-0 py-1">
                                            <p className="line-clamp-1 font-semibold text-white">
                                                {movie.name}
                                            </p>
                                            <p className="line-clamp-1 text-xs text-muted">
                                                {movie.originName}
                                            </p>
                                            {getMovieMeta(movie) && (
                                                <p className="mt-0.5 text-xs text-gray-400">
                                                    {getMovieMeta(movie)}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                    {!isSearching && movies.length > 0 && (
                        <Link
                            to={`/tim-kiem?keyword=${encodeURIComponent(keyword.trim())}`}
                            onClick={handleMovieClick}
                            className="mt-1 block rounded-lg py-2.5 text-center text-sm font-medium text-primary transition-colors hover:bg-white/10"
                        >
                            Xem tất cả kết quả
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default HeaderSearch;
