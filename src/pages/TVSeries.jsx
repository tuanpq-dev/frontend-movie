import MediaList from "@components/MediaList";
import { useMemo } from "react";
import { MovieGridSkeleton } from "@components/Skeleton";
import { useMovies } from "@/hooks/useMovieData";

const TVSeries = () => {
    const { data: movies = [], loading } = useMovies();
    const filteredMovieSeries = useMemo(() => {
        const movieList = Array.isArray(movies) ? movies : [];
        return movieList.filter((movie) => movie.type === "series");
    }, [movies]);

    return (
        <div className="page-surface">
            {loading && filteredMovieSeries.length === 0 ? (
                <MovieGridSkeleton />
            ) : (
                <MediaList movies={filteredMovieSeries} title="Phim bộ" />
            )}
        </div>
    );
};

export default TVSeries;
