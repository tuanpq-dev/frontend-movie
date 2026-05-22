import Hls from "hls.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { DetailSkeleton } from "@components/Skeleton";
import { useMovie } from "@/hooks/useMovieData";

const Watch = () => {
    const { id } = useParams();
    const videoRef = useRef(null);
    const [currentChap, setCurrentChap] = useState(0);
    const { data: movieInfo, loading } = useMovie(id);

    const chapterList = useMemo(
        () => (Array.isArray(movieInfo?.episodes) ? movieInfo.episodes : []),
        [movieInfo?.episodes],
    );

    const srcMovie = chapterList[currentChap]?.video || "";

    useEffect(() => {
        setCurrentChap(0);
    }, [id]);

    useEffect(() => {
        if (currentChap >= chapterList.length) {
            setCurrentChap(0);
        }
    }, [chapterList.length, currentChap]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !srcMovie) return undefined;

        if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true });
            hls.loadSource(srcMovie);
            hls.attachMedia(video);

            return () => {
                hls.destroy();
            };
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = srcMovie;
            video.load();

            return () => {
                video.removeAttribute("src");
                video.load();
            };
        }

        video.src = srcMovie;
        video.load();

        return () => {
            video.removeAttribute("src");
            video.load();
        };
    }, [srcMovie]);

    if (loading && !movieInfo) {
        return <DetailSkeleton />;
    }

    if (!movieInfo) {
        return (
            <div className="page-surface px-5 py-3 text-white lg:py-5">
                <div className="mx-auto max-w-screen-xl">
                    Không tìm thấy phim
                </div>
            </div>
        );
    }

    return (
        <div className="page-surface px-5 py-3 text-white lg:py-5">
            <div className="mx-auto max-w-screen-xl">
                <h1 className="text-2xl font-bold lg:text-3xl">
                    {movieInfo?.type === "single"
                        ? movieInfo.originName
                        : `${movieInfo.originName} - Tập ${currentChap + 1}`}
                </h1>
                <div className="mt-5 flex flex-col gap-3 md:flex-row">
                    <div className="flex-[3]">
                        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black">
                            {srcMovie ? (
                                <video
                                    ref={videoRef}
                                    className="absolute inset-0 h-full w-full"
                                    controls
                                    playsInline
                                    preload="metadata"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
                                    Video chưa sẵn sàng
                                </div>
                            )}
                        </div>
                    </div>
                    {movieInfo?.type !== "single" && (
                        <aside className="flex-1">
                            <div className="h-[300px] overflow-auto overscroll-contain rounded-md bg-[#1a1c21] p-3 lg:h-[400px]">
                                <p className="text-lg font-medium">
                                    Chọn tập phim
                                </p>
                                <ul className="mt-4 flex flex-wrap items-center gap-3">
                                    {chapterList.map((chap, index) => (
                                        <li key={chap._id || chap.video || index}>
                                            <button
                                                type="button"
                                                className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
                                                    currentChap === index
                                                        ? "bg-green-700"
                                                        : "bg-[#292e39] hover:bg-[#343a46]"
                                                }`}
                                                onClick={() =>
                                                    setCurrentChap(index)
                                                }
                                                aria-label={`Tập ${index + 1}`}
                                            >
                                                {index + 1}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </aside>
                    )}
                </div>
                <div className="mt-4 space-y-3 lg:text-lg">
                    {movieInfo.time && (
                        <div className="flex gap-2">
                            <p className="font-medium">Thời gian:</p>
                            <p>{movieInfo.time}</p>
                        </div>
                    )}
                    {movieInfo.content && (
                        <div className="flex gap-2">
                            <p className="whitespace-nowrap font-medium">
                                Nội dung:
                            </p>
                            <p>{movieInfo.content}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Watch;
