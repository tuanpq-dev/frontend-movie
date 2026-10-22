import Hls from "hls.js";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

// Phát m3u8 bằng hls.js; lỗi nghiêm trọng thì gọi onFatal để chuyển sang iframe embed.
// ref trỏ tới thẻ <video>; props còn lại (onPlay, onSeeked...) gắn thẳng lên <video>.
const HlsPlayer = forwardRef(function HlsPlayer(
    { src, onFatal, autoPlay = true, ...videoProps },
    ref,
) {
    const videoRef = useRef(null);
    useImperativeHandle(ref, () => videoRef.current, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !src) return undefined;

        if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true });
            hls.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) onFatal?.();
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            return () => hls.destroy();
        }

        video.src = src;
        video.load();
        return () => {
            video.removeAttribute("src");
            video.load();
        };
    }, [src, onFatal]);

    return (
        <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full"
            controls
            autoPlay={autoPlay}
            playsInline
            onError={onFatal}
            {...videoProps}
        />
    );
});

export default HlsPlayer;
