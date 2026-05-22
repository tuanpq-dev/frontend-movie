import MediaList from "@components/MediaList";
import { useMemo } from "react";
import { MovieGridSkeleton } from "@components/Skeleton";
import { useMovies } from "@/hooks/useMovieData";

const SingleMovie = () => {
    const { data: movies = [], loading } = useMovies();
    const filteredMovieSingles = useMemo(() => {
        const movieList = Array.isArray(movies) ? movies : [];
        return movieList.filter((movie) => movie.type === "single");
    }, [movies]);

    return (
        <div className="page-surface">
            {loading && filteredMovieSingles.length === 0 ? (
                <MovieGridSkeleton />
            ) : (
                <MediaList movies={filteredMovieSingles} title="Phim lẻ" />
            )}
        </div>
    );
};

export default SingleMovie;
