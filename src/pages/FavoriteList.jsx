import { useCallback, useMemo } from "react";
import MovieCard from "@components/MediaList/MovieCard";
import { MovieGridSkeleton } from "@components/Skeleton";
import { API_URL } from "@libs/config";
import { apiClient } from "@libs/apiClient";
import { invalidateCache } from "@libs/requestCache";
import { useCachedResource } from "@/hooks/useCachedResource";

const getPosterUrl = (posterUrl) => {
    if (!posterUrl) return "/img-placeholder.jpg";
    return posterUrl.startsWith("http")
        ? posterUrl
        : `${API_URL}/images/movies/${posterUrl}`;
};

const FavoriteList = () => {
    const fetchFavorites = useCallback(
        () => apiClient.get("/api/favoriteMovies"),
        [],
    );

    const {
        data,
        loading,
        error,
        reload,
    } = useCachedResource("favorite:list", fetchFavorites, {
        staleTime: 30 * 1000,
    });

    const movieList = useMemo(() => data?.movieNames || [], [data]);

    const deleteFavoriteMovie = useCallback(
        async (id) => {
            try {
                await apiClient.delete(`/api/favoriteMovies/deleteMovieId/${id}`);
                invalidateCache("favorite");
                reload({ force: true });
            } catch (err) {
                console.error("Error deleting favorite movie:", err);
                alert("Xóa phim không thành công!");
            }
        },
        [reload],
    );

    return (
        <div className="page-surface px-5 py-6 text-white lg:px-8 lg:py-10">
            <div className="mx-auto max-w-screen-2xl">
                <h1 className="mb-8 rounded-lg bg-red-500 py-4 text-center text-xl font-medium text-white">
                    Danh sách yêu thích
                </h1>

                {loading && movieList.length === 0 ? (
                    <MovieGridSkeleton />
                ) : error ? (
                    <div className="py-6 text-center text-gray-300">
                        Đã xảy ra lỗi khi lấy danh sách yêu thích!
                    </div>
                ) : movieList.length === 0 ? (
                    <div className="py-6 text-center text-gray-400">
                        Hiện chưa có phim yêu thích nào!
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {movieList.map((movie) => (
                            <div key={movie._id} className="relative">
                                <MovieCard
                                    name={movie.originName}
                                    posterUrl={getPosterUrl(movie.posterUrl)}
                                    year={movie.year}
                                    time={movie.time}
                                    type={movie.type}
                                    slug={movie.slug}
                                    _id={movie._id}
                                />
                                <button
                                    type="button"
                                    className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full bg-[#fd5465] transition-colors hover:bg-[#f7941e]"
                                    onClick={() =>
                                        deleteFavoriteMovie(movie?._id)
                                    }
                                    aria-label="Xóa khỏi danh sách yêu thích"
                                >
                                    <span className="h-1 w-4 rounded-sm bg-white" />
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
