import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { faFilm, faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CircularProgressBar from "@components/CircularProgressBar";
import EpisodeList from "@components/EpisodeList";
import PosterImage from "@components/PosterImage";
import MediaList from "@components/MediaList";
import { DetailSkeleton } from "@components/Skeleton";
import { useModalContext } from "@context/ModalProvider";
import { useKKList, useKKMovie } from "@/hooks/useMovieData";

const InfoRow = ({ label, children }) => (
    <div className="flex gap-3 text-sm leading-6">
        <span className="w-24 shrink-0 text-muted">{label}</span>
        <span className="min-w-0 text-gray-100">{children}</span>
    </div>
);

const TaxonomyLinks = ({ items, basePath }) =>
    items.map((item, index) => (
        <span key={item.slug}>
            {index > 0 && ", "}
            <Link
                to={`${basePath}/${item.slug}`}
                className="transition-colors hover:text-primary"
            >
                {item.name}
            </Link>
        </span>
    ));

const MovieDetail = () => {
    const { slug } = useParams();
    const { handlePlayTrailer } = useModalContext();
    const { data: movie, loading, error } = useKKMovie(slug);

    const relatedCategory = movie?.categories?.[0];
    const { data: related } = useKKList(
        relatedCategory ? `/v1/api/the-loai/${relatedCategory.slug}` : "",
        { limit: 13 },
    );
    const relatedMovies = useMemo(
        () =>
            (related?.items || [])
                .filter((item) => item.slug !== slug)
                .slice(0, 12),
        [related, slug],
    );

    if (loading && !movie) {
        return <DetailSkeleton />;
    }

    if (!movie || error) {
        return (
            <div className="page-surface px-5 py-16 text-center text-white">
                Không tìm thấy phim
            </div>
        );
    }

    const firstEpisode = movie.servers?.[0]?.episodes?.[0];
    const tags = [
        movie.quality,
        movie.lang,
        movie.year,
        movie.typeLabel,
        movie.episodeCurrent,
        movie.time,
    ].filter(Boolean);

    return (
        <div className="page-surface overflow-x-hidden">
            <div className="relative">
                <div className="absolute inset-0 h-[420px] overflow-hidden sm:h-[520px]">
                    <img
                        src={movie.thumbUrl}
                        alt=""
                        className="h-full w-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-surface/10" />
                </div>

                <div className="relative mx-auto flex max-w-screen-xl flex-col gap-6 px-4 pt-10 text-white sm:flex-row sm:px-6 sm:pt-16 min-[1025px]:pt-24">
                    <PosterImage
                        src={movie.posterUrl}
                        alt={movie.name}
                        widths={[480]}
                        loading="eager"
                        className="mx-auto aspect-[2/3] w-40 shrink-0 rounded-lg bg-surface-3 object-cover shadow-2xl shadow-black/50 sm:mx-0 sm:w-52 min-[1025px]:w-60"
                    />
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl font-bold leading-tight sm:text-3xl min-[1025px]:text-4xl">
                            {movie.name}
                        </h1>
                        <p className="mt-1 text-primary">{movie.originName}</p>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs sm:text-sm">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-md border border-white/30 px-2.5 py-1"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            {firstEpisode && (
                                <Link
                                    to={`/xem/${movie.slug}`}
                                    className="flex h-11 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-ink transition-colors hover:bg-primary-hover"
                                >
                                    <FontAwesomeIcon icon={faPlay} />
                                    Xem ngay
                                </Link>
                            )}
                            {movie.trailerKey && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        handlePlayTrailer(movie.trailerKey)
                                    }
                                    className="flex h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 font-medium transition-colors hover:bg-white/20"
                                >
                                    <FontAwesomeIcon icon={faFilm} />
                                    Trailer
                                </button>
                            )}
                            {movie.voteAverage > 0 && (
                                <div className="flex items-center gap-2">
                                    <CircularProgressBar
                                        percent={Math.round(
                                            movie.voteAverage * 10,
                                        )}
                                    />
                                    <span className="text-sm text-muted">
                                        TMDB
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 space-y-1.5">
                            {movie.categories.length > 0 && (
                                <InfoRow label="Thể loại">
                                    <TaxonomyLinks
                                        items={movie.categories}
                                        basePath="/the-loai"
                                    />
                                </InfoRow>
                            )}
                            {movie.countries.length > 0 && (
                                <InfoRow label="Quốc gia">
                                    <TaxonomyLinks
                                        items={movie.countries}
                                        basePath="/quoc-gia"
                                    />
                                </InfoRow>
                            )}
                            {movie.year && (
                                <InfoRow label="Năm">
                                    <Link
                                        to={`/nam/${movie.year}`}
                                        className="transition-colors hover:text-primary"
                                    >
                                        {movie.year}
                                    </Link>
                                </InfoRow>
                            )}
                            {movie.directors.length > 0 && (
                                <InfoRow label="Đạo diễn">
                                    {movie.directors.join(", ")}
                                </InfoRow>
                            )}
                            {movie.actors.length > 0 && (
                                <InfoRow label="Diễn viên">
                                    {movie.actors.slice(0, 10).join(", ")}
                                </InfoRow>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-screen-xl space-y-6 px-4 py-8 text-white sm:px-6">
                {movie.content && (
                    <section className="rounded-xl bg-surface-2 p-4 sm:p-5">
                        <h2 className="mb-2 text-lg font-semibold">
                            Nội dung phim
                        </h2>
                        <p className="text-sm leading-7 text-gray-200 sm:text-base">
                            {movie.content}
                        </p>
                    </section>
                )}

                <section className="rounded-xl bg-surface-2 p-4 sm:p-5">
                    <h2 className="mb-4 text-lg font-semibold">Danh sách tập</h2>
                    <EpisodeList movie={movie} />
                </section>
            </div>

            <MediaList movies={relatedMovies} title="Có thể bạn sẽ thích" />
        </div>
    );
};

export default MovieDetail;
