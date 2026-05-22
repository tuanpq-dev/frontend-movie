import FeatureMovies from "../components/FeatureMovies";
import MediaList from "@components/MediaList";
import { useMemo } from "react";
import { MovieGridSkeleton } from "@components/Skeleton";
import { useMovies } from "@/hooks/useMovieData";

function HomePage() {
    const { data: movies = [], loading } = useMovies();

    const filteredMovies = useMemo(() => {
        const movieList = Array.isArray(movies) ? movies : [];
        return {
            singles: movieList.filter((movie) => movie.type === "single"),
            series: movieList.filter((movie) => movie.type === "series"),
            cartoons: movieList.filter((movie) =>
                movie.genres?.some((gen) => gen?.nameGenre === "Hoạt hình"),
            ),
        };
    }, [movies]);

    return (
        <div className="page-surface">
            <FeatureMovies movies={movies} loading={loading} />
            {loading && movies.length === 0 ? (
                <>
                    <MovieGridSkeleton />
                    <MovieGridSkeleton />
                </>
            ) : (
                <>
                    <MediaList
                        movies={filteredMovies.singles}
                        title="Phim lẻ đề cử"
                    />
                    <MediaList
                        movies={filteredMovies.series}
                        title="Phim bộ đề cử"
                    />
                    <MediaList
                        movies={filteredMovies.cartoons}
                        title="Phim hoạt hình đề cử"
                    />
                </>
            )}
        </div>
    );
}

export default HomePage;
