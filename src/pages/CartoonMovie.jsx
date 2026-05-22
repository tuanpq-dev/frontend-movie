import MediaList from "@components/MediaList";
import { useMemo } from "react";
import { MovieGridSkeleton } from "@components/Skeleton";
import { useMovies } from "@/hooks/useMovieData";

const CartoonMovie = () => {
    const { data: movies = [], loading } = useMovies();
    const filteredMovieCartoons = useMemo(() => {
        const movieList = Array.isArray(movies) ? movies : [];
        return movieList.filter((movie) =>
            movie.genres?.some((gen) => gen?.nameGenre === "Hoạt hình"),
        );
    }, [movies]);

    return (
        <div className="page-surface">
            {loading && filteredMovieCartoons.length === 0 ? (
                <MovieGridSkeleton />
            ) : (
                <MediaList movies={filteredMovieCartoons} title="Hoạt hình" />
            )}
        </div>
    );
};

export default CartoonMovie;
