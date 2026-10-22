import { useCallback, useEffect, useRef, useState } from "react";
import {
    Link,
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";
import { DetailSkeleton } from "@components/Skeleton";
import EpisodeList from "@components/EpisodeList";
import HlsPlayer from "@components/HlsPlayer";
import { buildRoomPath, createRoomId } from "@libs/watchParty/room";
import { useKKMovie } from "@/hooks/useMovieData";

const Watch = () => {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const { data: movie, loading } = useKKMovie(slug);
    const [useEmbed, setUseEmbed] = useState(false);
    const switchToEmbed = useCallback(() => setUseEmbed(true), []);
    const navigate = useNavigate();

    const servers = movie?.servers || [];
    const serverIndex = Math.min(
        Number(searchParams.get("sv")) || 0,
        Math.max(servers.length - 1, 0),
    );
    const server = servers[serverIndex];
    const episodes = server?.episodes || [];
    const episodeIndex = Math.max(
        episodes.findIndex((ep) => ep.slug === searchParams.get("tap")),
        0,
    );
    const episode = episodes[episodeIndex];
    const nextEpisode = episodes[episodeIndex + 1];

    useEffect(() => {
        setUseEmbed(false);
    }, [episode?.m3u8]);

    // Đổi tập (cùng route nên ScrollToTop không chạy): đưa player về tầm nhìn.
    const playerRef = useRef(null);
    const previousEpisode = useRef(null);
    useEffect(() => {
        const current = episode?.slug;
        if (previousEpisode.current && current !== previousEpisode.current) {
            playerRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
        previousEpisode.current = current;
    }, [episode?.slug]);

    if (loading && !movie) {
        return <DetailSkeleton />;
    }

    if (!movie) {
        return (
            <div className="page-surface px-5 py-16 text-center text-white">
                Không tìm thấy phim
            </div>
        );
    }

    const showEmbed = (useEmbed || !episode?.m3u8) && episode?.embed;

    const startWatchParty = () => {
        navigate(
            buildRoomPath(createRoomId(), {
                movieSlug: movie.slug,
                server: serverIndex,
                episode: episode?.slug,
            }),
        );
    };

    return (
        <div className="page-surface px-3 py-4 text-white sm:px-5 min-[1025px]:py-6">
            <div className="mx-auto max-w-screen-xl">
                <div
                    ref={playerRef}
                    className="relative aspect-video w-full scroll-mt-20 overflow-hidden rounded-lg bg-black"
                >
                    {!episode ? (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">
                            Video chưa sẵn sàng
                        </div>
                    ) : showEmbed ? (
                        <iframe
                            key={episode.embed}
                            src={episode.embed}
                            title={movie.name}
                            className="absolute inset-0 h-full w-full"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            style={{ border: 0 }}
                        />
                    ) : (
                        <HlsPlayer src={episode.m3u8} onFatal={switchToEmbed} />
                    )}
                </div>

                <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold sm:text-2xl">
                            <Link
                                to={`/phim/${movie.slug}`}
                                className="transition-colors hover:text-primary"
                            >
                                {movie.name}
                            </Link>
                        </h1>
                        <p className="mt-1 text-sm text-muted">
                            {[movie.originName, server?.name, episode?.name]
                                .filter(Boolean)
                                .join(" • ")}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {episode && (
                            <button
                                type="button"
                                onClick={startWatchParty}
                                className="rounded-full bg-surface-3 px-4 py-2 text-sm transition-colors hover:bg-surface-4"
                            >
                                Xem chung
                            </button>
                        )}
                        {episode?.m3u8 && episode?.embed && (
                            <button
                                type="button"
                                onClick={() => setUseEmbed((value) => !value)}
                                className="rounded-full bg-surface-3 px-4 py-2 text-sm transition-colors hover:bg-surface-4"
                            >
                                {showEmbed ? "Player chính" : "Player dự phòng"}
                            </button>
                        )}
                        {nextEpisode && (
                            <Link
                                to={`/xem/${movie.slug}?sv=${serverIndex}&tap=${nextEpisode.slug}`}
                                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-ink transition-colors hover:bg-primary-hover"
                            >
                                Tập tiếp
                            </Link>
                        )}
                    </div>
                </div>

                {episodes.length > 1 || servers.length > 1 ? (
                    <section className="mt-6 rounded-xl bg-surface-2 p-4 sm:p-5">
                        <h2 className="mb-4 text-lg font-semibold">
                            Danh sách tập
                        </h2>
                        <EpisodeList
                            key={`${slug}-${serverIndex}`}
                            movie={movie}
                            activeServer={serverIndex}
                            activeEpisode={episode?.slug}
                        />
                    </section>
                ) : null}

                {movie.content && (
                    <section className="mt-6 rounded-xl bg-surface-2 p-4 text-sm leading-7 text-gray-200 sm:p-5 sm:text-base">
                        {movie.content}
                    </section>
                )}
            </div>
        </div>
    );
};

export default Watch;
