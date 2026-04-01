import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { faFilm, faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Spinner from "@/components/Spinner";
import CircularProgressBar from "@components/CircularProgressBar";
import { useModalContext } from "@context/ModalProvider";
import { useUserContext } from "@context/UserContext";
import Comments from "@components/Comments";
import axios from "axios";
import Toast from "@components/Toast/Toast";
import { showSuccessToast } from "@components/Toast/Toast";
import PaymentModal from "@components/PaymentModal";
import { API_URL } from "@libs/config";

const MovieDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movieInfo, setMovieInfo] = useState(null);
    const [isLoadingMovie, setIsLoadingMovie] = useState(true);
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [isShowModal, setIsShowModal] = useState(false);
    
    const { id: userId, isAdmin } = useUserContext();
    const { handlePlayTrailer } = useModalContext();

    // Fetch movie data
    useEffect(() => {
        const fetchMovie = async () => {
            setIsLoadingMovie(true);
            try {
                const response = await axios.get(`${API_URL}/api/movies/${id}`);
                setMovieInfo(response.data);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu phim:", error);
            } finally {
                setIsLoadingMovie(false);
            }
        };
        fetchMovie();
    }, [id]);
    // Get auth token from cookie
    const token = useMemo(() => {
        try {
            const authCookie = document.cookie
                .split("; ")
                .find((row) => row.startsWith("accessToken="));
            return authCookie ? authCookie.split("=")[1] : null;
        } catch {
            return null;
        }
    }, []);

    // Handle add to favorites
    const handleAddFavoriteMovie = useCallback(async () => {
        if (!userId || !token) {
            showSuccessToast("Thông báo", "Vui lòng đăng nhập để tiếp tục");
            return;
        }

        try {
            const response = await axios.post(
                `${API_URL}/api/favoriteMovies`,
                { movieIds: [id] },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (response.status === 201 || response.status === 200) {
                showSuccessToast(
                    "Thành công",
                    "Bạn đã thêm phim vào danh sách yêu thích",
                );
            }
        } catch (error) {
            console.error("Lỗi khi thêm phim vào danh sách yêu thích:", error);
            const status = error.response?.status;
            
            if (status === 400) {
                showSuccessToast("Thông báo", "Phim này đã có trong danh sách yêu thích");
            } else if (status === 403) {
                showSuccessToast("Lỗi", "Bạn không có quyền thêm phim vào danh sách");
            } else {
                showSuccessToast("Lỗi", "Không thể thêm phim vào danh sách");
            }
        }
    }, [userId, token, id]);

    // Handle watch movie
    const handleWatchMovie = useCallback(async () => {
        if (!movieInfo?._id) return;

        // Admin can watch directly
        if (isAdmin) {
            navigate(`/watch/${movieInfo._id}`);
            return;
        }

        // Check payment status for regular users
        try {
            const response = await axios.get(
                `${API_URL}/api/payment/payment-status/${userId}`,
            );
            if (response.data.paid) {
                navigate(`/watch/${movieInfo._id}`);
            } else {
                showPaymentModal();
            }
        } catch (error) {
            console.error("Lỗi khi kiểm tra thanh toán:", error);
            showPaymentModal();
        }
    }, [userId, movieInfo?._id, isAdmin, navigate]);

    // Handle payment
    const handlePayment = useCallback(async () => {
        if (!userId) {
            showSuccessToast("Thông báo", "Vui lòng đăng nhập!");
            return;
        }

        setIsLoadingPayment(true);
        try {
            const { data } = await axios.post(
                `${API_URL}/api/payment/create_payment`,
                { userId },
            );
            
            window.open(data.paymentUrl, "_blank");

            // Listen for payment success from VNPay return tab
            const onPaymentSuccess = (e) => {
                if (e.key === "paymentSuccess") {
                    localStorage.removeItem("paymentSuccess");
                    window.removeEventListener("storage", onPaymentSuccess);
                    navigate(`/watch/${movieInfo._id}`);
                }
            };
            
            window.addEventListener("storage", onPaymentSuccess);
            
            // Cleanup listener after 10 minutes
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

    // Modal controls
    const showPaymentModal = useCallback(() => {
        document.documentElement.style.overflow = "hidden";
        setIsShowModal(true);
    }, []);

    const hidePaymentModal = useCallback(() => {
        document.documentElement.style.overflow = "auto";
        setIsShowModal(false);
    }, []);

    // Cleanup overflow on unmount
    useEffect(() => {
        return () => {
            document.documentElement.style.overflow = "auto";
        };
    }, []);

    // Helper function for image URL
    const getImageUrl = useCallback((url, type = "thumb") => {
        if (!url) return "/img-placeholder.jpg";
        if (url.startsWith("http")) return url;
        return `${API_URL}/images/movies/${url}`;
    }, []);

    // Memoized genres display
    const genresText = useMemo(() => {
        return (movieInfo?.genres || [])
            .map((genre) => genre.nameGenre)
            .join(", ");
    }, [movieInfo?.genres]);

    // Don't render until movie data is loaded
    if (isLoadingMovie) {
        return (
            <div className="min-h-[40vh] bg-[#06121d] px-5 py-3 lg:py-5">
                <Spinner />
            </div>
        );
    }

    // Don't render if no movie data
    if (!movieInfo) {
        return (
            <div className="min-h-[40vh] bg-[#06121d] px-5 py-3 lg:py-5">
                <div className="mx-auto max-w-screen-xl text-center text-white">
                    <p>Không tìm thấy phim</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[40vh] bg-[#06121d] px-5 py-3 lg:py-5">
            <div className="mx-auto max-w-screen-xl">
                {/* Hero Section */}
                <div className="relative py-3">
                    <figure className="h-[480px] lg:h-[450px]">
                        <img
                            src={getImageUrl(movieInfo.thumbUrl)}
                            alt={movieInfo.originName}
                            width={1280}
                            height={450}
                            loading="eager"
                            className="h-full w-full object-cover brightness-50"
                        />
                    </figure>
                    <figure className="absolute left-5 top-5 h-[285px] w-[200px]">
                        <img
                            src={getImageUrl(movieInfo.posterUrl, "poster")}
                            alt={`${movieInfo.originName} poster`}
                            width={200}
                            height={285}
                            loading="eager"
                            className="h-full w-full object-cover"
                        />
                    </figure>
                    
                    {/* Movie Info Overlay */}
                    <div className="absolute bottom-5 left-5 sm:bottom-6 md:bottom-7 lg:bottom-9">
                        <div className="flex items-center gap-[10px]">
                            {movieInfo.voteAverage > 0 && (
                                <div className="flex items-center gap-1">
                                    <CircularProgressBar
                                        percent={Math.round(movieInfo.voteAverage * 10)}
                                    />
                                    <span className="text-white">Rating</span>
                                </div>
                            )}
                            <ul className="flex flex-wrap gap-2">
                                {(movieInfo.genres || []).slice(0, 3).map((genre) => (
                                    <li
                                        key={genre._id}
                                        className="rounded-lg bg-white p-[6px] text-sm font-medium text-black"
                                    >
                                        {genre.nameGenre}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="left-5 mt-2 flex flex-wrap items-center gap-2 sm:mt-3">
                            <button
                                className="flex h-10 items-center justify-center gap-2 rounded-full bg-black px-3 font-medium text-white hover:bg-gray-800 transition-colors"
                                onClick={() => handlePlayTrailer(movieInfo?.trailerKey)}
                                aria-label="Xem trailer"
                            >
                                <FontAwesomeIcon icon={faFilm} />
                                Xem Trailer
                            </button>
                            {userId && (
                                <>
                                    <button
                                        onClick={handleWatchMovie}
                                        className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#ffb700] px-5 font-medium text-[#171c28] hover:bg-[#e6a600] transition-colors"
                                        aria-label="Xem phim ngay"
                                    >
                                        <FontAwesomeIcon icon={faPlay} className="text-white" />
                                        Xem ngay
                                    </button>
                                    <button
                                        className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#ff0000] px-5 text-base text-white hover:bg-[#cc0000] transition-colors"
                                        onClick={handleAddFavoriteMovie}
                                        aria-label="Thêm vào yêu thích"
                                    >
                                        <img src="/heart.svg" alt="" className="invert" />
                                        Thêm vào yêu thích
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Movie Details */}
                <div className="mt-3 space-y-2 text-base text-white lg:text-lg">
                    <h1 className="text-3xl font-bold lg:text-4xl">
                        {movieInfo.originName}
                    </h1>
                    {movieInfo.time && (
                        <p>
                            <span className="font-medium">Thời gian:</span> {movieInfo.time}
                        </p>
                    )}
                    {movieInfo.year && (
                        <p>
                            <span className="font-medium">Năm phát hành:</span> {movieInfo.year}
                        </p>
                    )}
                    {genresText && (
                        <p>
                            <span className="font-medium">Thể loại:</span> {genresText}
                        </p>
                    )}
                    {movieInfo.content && (
                        <p>
                            <span className="font-medium">Nội dung:</span> {movieInfo.content}
                        </p>
                    )}
                    {movieInfo.director && (
                        <p>
                            <span className="font-medium">Đạo diễn:</span> {movieInfo.director}
                        </p>
                    )}
                    {movieInfo.actor && (
                        <p>
                            <span className="font-medium">Diễn viên:</span> {movieInfo.actor}
                        </p>
                    )}
                </div>

                {/* Comments Section */}
                {movieInfo._id && <Comments movieId={movieInfo._id} userId={userId} />}

                <Toast />

                {/* Payment Modal */}
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
