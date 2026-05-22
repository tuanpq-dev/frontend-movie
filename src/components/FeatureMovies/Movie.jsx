import { memo, useCallback, useEffect, useRef, useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "@components/FeatureMovies/carousel.css";
import { API_URL } from "@libs/config";
import { Link } from "react-router-dom";

const responsive = {
    desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 1,
        slidesToSlide: 1,
    },
    tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 1,
        slidesToSlide: 1,
    },
    mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 1,
        slidesToSlide: 1,
    },
};

const getMovieThumbUrl = (movie) => {
    if (!movie?.thumbUrl) return "/img-placeholder.jpg";
    return movie.thumbUrl.startsWith("http")
        ? movie.thumbUrl
        : `${API_URL}/images/movies/${movie.thumbUrl}`;
};

const MovieSlide = memo(({ movie }) => (
    <div className="feature-movie-slide relative h-[calc(100dvh-68px)] max-h-[560px] min-h-[460px] w-full overflow-hidden sm:max-h-[620px] min-[1025px]:h-[720px] min-[1025px]:max-h-none">
        <div className="absolute inset-0 overflow-hidden">
            <img
                src={getMovieThumbUrl(movie)}
                className="h-full w-full object-cover"
                alt={movie?.originName || "movie thumbnail"}
                draggable={false}
                onDragStart={(event) => event.preventDefault()}
                loading="eager"
                decoding="async"
                width={1280}
                height={720}
            />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-black/25 backdrop-blur-[1px]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/20 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#070b14]/90 via-[#070b14]/30 to-transparent" />

        <div className="absolute bottom-10 left-4 max-w-[min(760px,calc(100vw-32px))] pr-4 sm:bottom-14 sm:left-8 min-[1025px]:bottom-24 min-[1025px]:left-16">
            <h3 className="mb-2 line-clamp-2 text-[clamp(2rem,11vw,3.5rem)] font-black leading-none drop-shadow-xl sm:text-6xl min-[1025px]:mb-3 min-[1025px]:text-7xl">
                {movie?.originName}
            </h3>
            <p className="line-clamp-1 text-sm font-medium text-[#ffcf45] sm:text-base min-[1025px]:text-lg">
                {movie?.name || movie?.slug}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-white sm:text-sm min-[1025px]:mt-4">
                {movie?.year && (
                    <span className="rounded-lg border border-white/40 px-2.5 py-1 sm:px-3">
                        {movie.year}
                    </span>
                )}
                {movie?.type && (
                    <span className="rounded-lg border border-white/40 px-2.5 py-1 sm:px-3">
                        {movie.type === "series" ? "Phim bộ" : "Phim lẻ"}
                    </span>
                )}
                {movie?.time && (
                    <span className="rounded-lg border border-white/40 px-2.5 py-1 sm:px-3">
                        {movie.time}
                    </span>
                )}
            </div>
            <p className="mt-4 line-clamp-2 max-w-3xl text-sm leading-6 text-gray-100 sm:line-clamp-3 sm:text-base min-[1025px]:mt-5 min-[1025px]:text-lg min-[1025px]:leading-7">
                {movie?.content || "Nội dung phim đang được cập nhật."}
            </p>
            <div className="mt-5 flex items-center gap-3 sm:mt-7 sm:gap-4 min-[1025px]:mt-8">
                <Link
                    to={`/info/${movie._id}`}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ffd45a] text-[#120d02] shadow-2xl shadow-[#ffd45a]/25 transition-transform hover:scale-[1.04] sm:h-16 sm:w-16 min-[1025px]:h-20 min-[1025px]:w-20"
                    aria-label="Xem phim"
                >
                    <span className="ml-1 h-0 w-0 border-y-[9px] border-l-[14px] border-y-transparent border-l-[#120d02] sm:border-y-[10px] sm:border-l-[16px] min-[1025px]:border-y-[12px] min-[1025px]:border-l-[18px]" />
                </Link>
                <Link
                    to={`/info/${movie._id}`}
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15 sm:px-5 min-[1025px]:px-6 min-[1025px]:py-4 min-[1025px]:text-base"
                >
                    Thông tin
                </Link>
            </div>
        </div>
    </div>
));

MovieSlide.displayName = "MovieSlide";

const Movie = ({ movies }) => {
    const [isPaused, setIsPaused] = useState(false);
    const carouselRef = useRef(null);
    const frameRef = useRef(null);
    const isHoveringRef = useRef(false);
    const isDraggingRef = useRef(false);
    const isPausedRef = useRef(false);

    const setPaused = useCallback((paused) => {
        if (isPausedRef.current === paused) return;
        isPausedRef.current = paused;
        setIsPaused(paused);
    }, []);

    const setDraggingClass = useCallback((isDragging) => {
        if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
        }

        frameRef.current = requestAnimationFrame(() => {
            carouselRef.current?.classList.toggle("is-dragging", isDragging);
        });
    }, []);

    const handleMouseEnter = useCallback(() => {
        isHoveringRef.current = true;
        setPaused(true);
    }, [setPaused]);

    const handleMouseLeave = useCallback(() => {
        isHoveringRef.current = false;
        isDraggingRef.current = false;
        setDraggingClass(false);
        setPaused(false);
    }, [setDraggingClass, setPaused]);

    const startDrag = useCallback(() => {
        isDraggingRef.current = true;
        setDraggingClass(true);
        setPaused(true);
    }, [setDraggingClass, setPaused]);

    const moveDrag = useCallback(() => {
        if (isDraggingRef.current) {
            setDraggingClass(true);
        }
    }, [setDraggingClass]);

    const endDrag = useCallback(() => {
        isDraggingRef.current = false;
        setDraggingClass(false);
        setPaused(isHoveringRef.current);
    }, [setDraggingClass, setPaused]);

    useEffect(() => {
        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, []);

    return (
        <div
            ref={carouselRef}
            className="feature-movie-carousel"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={startDrag}
            onMouseMove={moveDrag}
            onMouseUp={endDrag}
            onTouchStart={startDrag}
            onTouchMove={moveDrag}
            onTouchEnd={endDrag}
            onTouchCancel={endDrag}
        >
            <Carousel
                responsive={responsive}
                swipeable
                draggable
                arrows
                autoPlay={!isPaused}
                autoPlaySpeed={4000}
                infinite
                pauseOnHover
                shouldResetAutoplay
                minimumTouchDrag={60}
                keyBoardControl
                customTransition="transform 560ms cubic-bezier(0.16, 1, 0.3, 1)"
                transitionDuration={560}
                containerClass="feature-movie-carousel__container"
                sliderClass="feature-movie-carousel__track"
                itemClass="feature-movie-carousel__item"
            >
                {movies.map((movie) => (
                    <MovieSlide key={movie._id} movie={movie} />
                ))}
            </Carousel>
        </div>
    );
};

export default memo(Movie);
