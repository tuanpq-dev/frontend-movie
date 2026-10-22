import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import HlsPlayer from "@components/HlsPlayer";
import { expectedTime, needsResync } from "@libs/watchParty/protocol";

const REMOTE_GUARD_MS = 700;
const SEEK_DEBOUNCE_MS = 300;

/**
 * Player của phòng xem chung.
 * ref: { apply(state), getPlayback() → { currentTime, isPlaying, rate } | null, setRate(rate) }
 * - onUserAction(): người dùng tự play/pause/seek/đổi tốc độ (đã lọc sự kiện do lệnh từ xa gây ra).
 * - onBlockedAction(): người không có quyền điều khiển vừa thao tác (player tự quay về trạng thái host).
 * - onSyncChange("synced" | "catching").
 */
const PartyPlayer = forwardRef(function PartyPlayer(
    { episode, title, canControl, onUserAction, onBlockedAction, onSyncChange },
    ref,
) {
    const videoRef = useRef(null);
    const [useEmbed, setUseEmbed] = useState(false);
    const [needsGesture, setNeedsGesture] = useState(false);
    const switchToEmbed = useCallback(() => setUseEmbed(true), []);

    // isRemoteUpdate: đang áp dụng lệnh từ xa thì không phát ngược sự kiện lên kênh.
    const isRemoteUpdate = useRef(false);
    const remoteTimer = useRef(null);
    const pendingSeek = useRef(null);
    const pendingState = useRef(null);
    const lastState = useRef(null);
    const seekTimer = useRef(null);
    const propsRef = useRef({});
    propsRef.current = {
        canControl,
        onUserAction,
        onBlockedAction,
        onSyncChange,
    };

    const showEmbed = (useEmbed || !episode?.m3u8) && Boolean(episode?.embed);

    useEffect(() => {
        setUseEmbed(false);
        setNeedsGesture(false);
        pendingSeek.current = null;
    }, [episode?.m3u8]);

    useEffect(
        () => () => {
            clearTimeout(remoteTimer.current);
            clearTimeout(seekTimer.current);
        },
        [],
    );

    const markRemote = () => {
        isRemoteUpdate.current = true;
        clearTimeout(remoteTimer.current);
        remoteTimer.current = setTimeout(() => {
            isRemoteUpdate.current = false;
        }, REMOTE_GUARD_MS);
    };

    const tryPlay = (video) => {
        video
            .play()
            .then(() => setNeedsGesture(false))
            .catch((error) => {
                // Trình duyệt chặn tự phát khi chưa có thao tác của người dùng.
                if (error?.name === "NotAllowedError") setNeedsGesture(true);
            });
    };

    const apply = useCallback((state) => {
        lastState.current = state;
        const video = videoRef.current;
        if (!video || video.readyState < 1) {
            pendingState.current = state;
            return;
        }
        pendingState.current = null;
        markRemote();
        if (video.playbackRate !== state.rate) video.playbackRate = state.rate;
        const target = expectedTime(state);
        if (needsResync(video.currentTime, target)) {
            pendingSeek.current = target;
            propsRef.current.onSyncChange?.("catching");
            video.currentTime = target;
        }
        if (state.isPlaying && video.paused) tryPlay(video);
        else if (!state.isPlaying && !video.paused) video.pause();
    }, []);

    useImperativeHandle(
        ref,
        () => ({
            apply,
            getPlayback: () => {
                const video = videoRef.current;
                if (!video || showEmbed) return null;
                return {
                    currentTime: video.currentTime,
                    isPlaying: !video.paused,
                    rate: video.playbackRate,
                };
            },
            setRate: (rate) => {
                if (videoRef.current) videoRef.current.playbackRate = rate;
            },
        }),
        [apply, showEmbed],
    );

    const handleUserEvent = (type) => {
        const video = videoRef.current;
        if (!video) return;
        if (type === "seeked" && pendingSeek.current !== null) {
            const target = pendingSeek.current;
            pendingSeek.current = null;
            if (Math.abs(video.currentTime - target) < 1) {
                propsRef.current.onSyncChange?.("synced");
                return;
            }
        }
        if (isRemoteUpdate.current) return;

        const { canControl: allowed, onUserAction: notify } = propsRef.current;
        if (allowed || !lastState.current) {
            if (type === "seeked") {
                // Kéo thanh thời gian sinh nhiều sự kiện: chỉ gửi lần cuối.
                clearTimeout(seekTimer.current);
                seekTimer.current = setTimeout(
                    () => notify?.(),
                    SEEK_DEBOUNCE_MS,
                );
            } else {
                notify?.();
            }
            return;
        }
        propsRef.current.onBlockedAction?.();
        apply(lastState.current);
    };

    const handleLoadedMetadata = () => {
        if (pendingState.current) apply(pendingState.current);
    };

    const resumeWithGesture = () => {
        const video = videoRef.current;
        if (!video) return;
        markRemote();
        tryPlay(video);
    };

    if (!episode) {
        return (
            <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-muted">
                Video chưa sẵn sàng
            </div>
        );
    }

    if (showEmbed) {
        return (
            <iframe
                key={episode.embed}
                src={episode.embed}
                title={title}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                style={{ border: 0 }}
            />
        );
    }

    return (
        <>
            <HlsPlayer
                ref={videoRef}
                src={episode.m3u8}
                onFatal={switchToEmbed}
                autoPlay={false}
                onPlay={() => handleUserEvent("play")}
                onPause={() => handleUserEvent("pause")}
                onSeeked={() => handleUserEvent("seeked")}
                onRateChange={() => handleUserEvent("ratechange")}
                onLoadedMetadata={handleLoadedMetadata}
                onWaiting={() => propsRef.current.onSyncChange?.("catching")}
                onPlaying={() => {
                    if (pendingSeek.current === null) {
                        propsRef.current.onSyncChange?.("synced");
                    }
                }}
            />
            {needsGesture && (
                <button
                    type="button"
                    onClick={resumeWithGesture}
                    className="absolute inset-0 flex items-center justify-center bg-surface/70 text-sm font-semibold"
                >
                    <span className="rounded-full bg-primary px-5 py-2.5 text-primary-ink">
                        Nhấn để phát cùng phòng
                    </span>
                </button>
            )}
        </>
    );
});

export default PartyPlayer;
