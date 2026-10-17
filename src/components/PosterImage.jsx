import { memo, useState } from "react";
import { getResizedImageUrl } from "@libs/kkphim";

// Ảnh poster đã resize qua proxy (xem getResizedImageUrl). Proxy lỗi → dùng ảnh gốc.
// widths: các chiều rộng sinh srcSet; sizes: như thuộc tính sizes của <img>.
const PosterImage = ({
    src,
    alt = "",
    widths = [240, 360, 480],
    sizes,
    className = "",
    loading = "lazy",
}) => {
    const [failed, setFailed] = useState(false);
    const useProxy = !failed && src && !src.startsWith("/");

    return (
        <img
            src={useProxy ? getResizedImageUrl(src, widths[widths.length - 1]) : src}
            srcSet={
                useProxy && sizes
                    ? widths
                          .map((w) => `${getResizedImageUrl(src, w)} ${w}w`)
                          .join(", ")
                    : undefined
            }
            sizes={useProxy ? sizes : undefined}
            alt={alt}
            loading={loading}
            decoding="async"
            onError={() => setFailed(true)}
            className={className}
        />
    );
};

export default memo(PosterImage);
