import Movie from "./Movie";
import { HeroSkeleton } from "@components/Skeleton";

const FeatureMovies = ({ movies = [], loading = false }) => {
    if (loading && movies.length === 0) {
        return <HeroSkeleton />;
    }

    if (!movies.length) {
        return null;
    }

    return (
        <div className="bg-[#292e39]">
            <div className="relative block overflow-hidden text-white">
                <Movie movies={movies} />
            </div>
        </div>
    );
};

export default FeatureMovies;
