import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { faFilm, faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CircularProgressBar from "@components/CircularProgressBar";
import { DetailSkeleton } from "@components/Skeleton";
import { useModalContext } from "@context/ModalProvider";
import { useUserContext } from "@context/UserContext";
import Comments from "@components/Comments";
import { showSuccessToast } from "@components/Toast/Toast";
import PaymentModal from "@components/PaymentModal";
import { API_URL } from "@libs/config";
import { apiClient } from "@libs/apiClient";
import { invalidateCache } from "@libs/requestCache";
import { useMovie, usePaymentStatus } from "@/hooks/useMovieData";
import Cookies from "js-cookie";

const MovieDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [isShowModal, setIsShowModal] = useState(false);

    const { id: userId, isAdmin } = useUserContext();
    const { handlePlayTrailer } = useModalContext();
    const {
        data: movieInfo,
        loading: isLoadingMovie,
        error: movieError,
    } = useMovie(id);
    const { data: paymentStatus } = usePaymentStatus(userId, {
        enabled: Boolean(userId && !isAdmin),
        staleTime: 30 * 1000,
    });

    const showPaymentModal = useCallback(() => {
        document.documentElement.style.overflow = "hidden";
        setIsShowModal(true);
    }, []);

    const hidePaymentModal = useCallback(() => {
        document.documentElement.style.overflow = "auto";
        setIsShowModal(false);
    }, []);

    useEffect(() => {
        return () => {
            document.documentElement.style.overflow = "auto";
        };
    }, []);

    const token = Cookies.get("accessToken");

    const handleAddFavoriteMovie = useCallback(async () => {
        if (!userId || !token) {
            showSuccessToast("Thông báo", "Vui lòng đăng nhập để tiếp tục");
            return;
        }

        try {
            await apiClient.post("/api/favoriteMovies", { movieIds: [id] });
            invalidateCache("favorite");
            showSuccessToast(
                "Thành công",
                "Bạn đã thêm phim vào danh sách yêu thích",
            );
        } catch (error) {
            console.error("Lỗi khi thêm phim vào danh sách yêu thích:", error);
            const status = error.response?.status;

            if (status === 400) {
                showSuccessToast(
                    "Thông báo",
                    "Phim này đã có trong danh sách yêu thích",
                );
            } else if (status === 403) {
                showSuccessToast(
                    "Lỗi",
                    "Bạn không có quyền thêm phim vào danh sách",
                );
            } else {
                showSuccessToast("Lỗi", "Không thể thêm phim vào danh sách");
            }
        }
    }, [userId, token, id]);

    const handleWatchMovie = useCallback(async () => {
        if (!movieInfo?._id) return;

        if (isAdmin) {
            navigate(`/watch/${movieInfo._id}`);
            return;
        }

        try {
            const status =
                paymentStatus ||
                (userId
                    ? await apiClient.get(
                          `/api/payment/payment-status/${userId}`,
                      )
                    : null);

            if (status?.paid) {
                navigate(`/watch/${movieInfo._id}`);
            } else {
                showPaymentModal();
            }
        } catch (error) {
            console.error("Lỗi khi kiểm tra thanh toán:", error);
            showPaymentModal();
        }
    }, [
        userId,
        movieInfo?._id,
        isAdmin,
        navigate,
        paymentStatus,
        showPaymentModal,
    ]);

    const handlePayment = useCallback(async () => {
        if (!userId) {
            showSuccessToast("Thông báo", "Vui lòng đăng nhập!");
            return;
        }

        setIsLoadingPayment(true);
        try {
            const data = await apiClient.post("/api/payment/create_payment", {
                userId,
            });

            window.open(data.paymentUrl, "_blank");

            const onPaymentSuccess = (e) => {
                if (e.key === "paymentSuccess") {
                    localStorage.removeItem("paymentSuccess");
                    window.removeEventListener("storage", onPaymentSuccess);
                    invalidateCache(`payment:status:${userId}`);
                    navigate(`/watch/${movieInfo._id}`);
                }
            };

            window.addEventListener("storage", onPaymentSuccess);

            setTimeout(() => {
                window.removeEventListener("storage", onPaymentSuccess);
            }, 600000);
        } catch (error) {
            const message = error.response?.data?.message || "Lỗi kết nối!";
            showSuccessToast("Lỗi", message);
        } finally {
            setIsLoadingPayment(false);
        }
    }, [userId, movieInfo?._id, navigate]);

    const getImageUrl = useCallback((url) => {
        if (!url) return "/img-placeholder.jpg";
        if (url.startsWith("http")) return url;
        return `${API_URL}/images/movies/${url}`;
    }, []);

    const genresText = useMemo(() => {
        return (movieInfo?.genres || [])
            .map((genre) => genre.nameGenre)
            .join(", ");
    }, [movieInfo?.genres]);

    if (isLoadingMovie && !movieInfo) {
        return <DetailSkeleton />;
    }

    if (!movieInfo || movieError) {
        return (
            <div className="page-surface px-5 py-3 lg:py-5">
                <div className="mx-auto max-w-screen-xl text-center text-white">
                    <p>Không tìm thấy phim</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-surface overflow-x-hidden px-3 py-3 sm:px-5 min-[1025px]:py-5">
            <div className="mx-auto max-w-screen-xl">
                <div className="relative py-3">
                    <figure className="h-[380px] overflow-hidden rounded-md sm:h-[430px] min-[1025px]:h-[450px]">
                        <img
                            src={getImageUrl(movieInfo.thumbUrl)}
                            alt={movieInfo.originName}
                            width={1280}
                            height={450}
                            loading="eager"
                            decoding="async"
                            className="h-full w-full object-cover brightness-50"
                        />
                    </figure>
                    <figure className="absolute left-4 top-4 hidden h-[220px] w-[154px] overflow-hidden rounded-sm sm:block md:h-[260px] md:w-[182px] min-[1025px]:left-5 min-[1025px]:top-5 min-[1025px]:h-[285px] min-[1025px]:w-[200px]">
                        <img
                            src={getImageUrl(movieInfo.posterUrl)}
                            alt={`${movieInfo.originName} poster`}
                            width={200}
                            height={285}
                            loading="eager"
                            decoding="async"
                            className="h-full w-full object-cover"
                        />
                    </figure>

                    <div className="absolute inset-x-4 bottom-4 sm:bottom-6 sm:left-5 sm:right-5 md:bottom-7 min-[1025px]:bottom-9">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-[10px]">
                            {movieInfo.voteAverage > 0 && (
                                <div className="flex items-center gap-1">
                                    <CircularProgressBar
                                        percent={Math.round(
                                            movieInfo.voteAverage * 10,
                                        )}
                                    />
                                    <span className="text-white">Rating</span>
                                </div>
                            )}
                            <ul className="flex flex-wrap gap-2">
                                {(movieInfo.genres || [])
                                    .slice(0, 3)
                                    .map((genre) => (
                                        <li
                                            key={genre._id}
                                            className="rounded-lg bg-white px-2 py-1 text-xs font-medium text-black sm:p-[6px] sm:text-sm"
                                        >
                                            {genre.nameGenre}
                                        </li>
                                    ))}
                            </ul>
                        </div>

                        <div className="left-5 mt-2 flex flex-wrap items-center gap-2 sm:mt-3">
                            <button
                                className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full bg-black px-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 min-[420px]:flex-none sm:min-h-11 sm:text-base"
                                onClick={() =>
                                    handlePlayTrailer(movieInfo?.trailerKey)
                                }
                                aria-label="Xem trailer"
                            >
                                <FontAwesomeIcon icon={faFilm} />
                                Xem Trailer
                            </button>
                            <button
                                onClick={handleWatchMovie}
                                className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#ffb700] px-4 text-sm font-medium text-[#171c28] transition-colors hover:bg-[#e6a600] min-[420px]:flex-none sm:min-h-11 sm:px-5 sm:text-base"
                                aria-label="Xem phim ngay"
                            >
                                <FontAwesomeIcon
                                    icon={faPlay}
                                    className="text-white"
                                />
                                Xem ngay
                            </button>
                            <button
                                className="flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-[#ff0000] px-4 text-sm text-white transition-colors hover:bg-[#cc0000] min-[520px]:w-auto sm:min-h-11 sm:px-5 sm:text-base"
                                onClick={handleAddFavoriteMovie}
                                aria-label="Thêm vào yêu thích"
                            >
                                <img
                                    src="/heart.svg"
                                    alt=""
                                    className="invert"
                                />
                                Thêm vào yêu thích
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-3 min-w-0 space-y-2 break-words text-sm leading-6 text-white sm:text-base min-[1025px]:text-lg">
                    <h1 className="text-2xl font-bold leading-tight sm:text-3xl min-[1025px]:text-4xl">
                        {movieInfo.originName}
                    </h1>
                    {movieInfo.time && (
                        <p>
                            <span className="font-medium">Thời gian:</span>{" "}
                            {movieInfo.time}
                        </p>
                    )}
                    {movieInfo.year && (
                        <p>
                            <span className="font-medium">Năm phát hành:</span>{" "}
                            {movieInfo.year}
                        </p>
                    )}
                    {genresText && (
                        <p>
                            <span className="font-medium">Thể loại:</span>{" "}
                            {genresText}
                        </p>
                    )}
                    {movieInfo.content && (
                        <p>
                            <span className="font-medium">Nội dung:</span>{" "}
                            {movieInfo.content}
                        </p>
                    )}
                    {movieInfo.director && (
                        <p>
                            <span className="font-medium">Đạo diễn:</span>{" "}
                            {movieInfo.director}
                        </p>
                    )}
                    {movieInfo.actor && (
                        <p>
                            <span className="font-medium">Diễn viên:</span>{" "}
                            {movieInfo.actor}
                        </p>
                    )}
                </div>

                {movieInfo._id && (
                    <Comments movieId={movieInfo._id} userId={userId} />
                )}

                {isShowModal && (
                    <PaymentModal
                        isLoading={isLoadingPayment}
                        hidePaymentModal={hidePaymentModal}
                        handlePayment={handlePayment}
                    />
                )}
            </div>
        </div>
    );
};

export default MovieDetail;
