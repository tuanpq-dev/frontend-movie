import { memo } from "react";
import { Link } from "react-router-dom";
import PosterImage from "@components/PosterImage";

// Khớp với lưới MovieGrid (2/3/4/5/6 cột)
const CARD_SIZES =
    "(min-width: 1280px) 16vw, (min-width: 1025px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw";

// movie: object đã qua normalizeKKMovie (libs/kkphim.js)
const MovieCard = ({ movie }) => {
    const badges = [movie.lang, movie.episodeCurrent].filter(Boolean);

    return (
        <Link to={`/phim/${movie.slug}`} className="group block min-w-0">
            <div className="relative overflow-hidden rounded-lg bg-surface-3 pb-[150%]">
                <PosterImage
                    src={movie.posterUrl}
                    alt={movie.name || "poster"}
                    sizes={CARD_SIZES}
                    className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                />
                {movie.quality && (
                    <span className="absolute left-2 top-2 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-ink">
                        {movie.quality}
                    </span>
                )}
                {badges.length > 0 && (
                    <div className="absolute bottom-0 left-1/2 flex max-w-[95%] -translate-x-1/2 overflow-hidden rounded-t-md text-[11px] text-white shadow">
                        {badges.map((badge, index) => (
                            <span
                                key={badge}
                                className={`truncate px-2 py-0.5 ${
                                    index === 0 ? "bg-surface-5" : "bg-accent"
                                }`}
                            >
                                {badge}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <h3 className="mt-2 line-clamp-1 text-sm font-medium text-white transition-colors group-hover:text-primary sm:text-[15px]">
                {movie.name}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted sm:text-[13px]">
                {movie.originName}
            </p>
        </Link>
    );
};

export default memo(MovieCard);
