import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { faFilm, faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Spinner from "@/components/Spinner";
import CircularProgressBar from "@components/CircularProgressBar";
import { useModalContext } from "@context/ModalProvider";
import Comments from "@components/Comments";
import axios from "axios";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import Toast from "@components/Toast/Toast";
import { showSuccessToast } from "@components/Toast/Toast";
import PaymentModal from "@components/PaymentModal";
import { API_URL } from "@libs/config";

const MovieDetail = () => {
    const { id } = useParams();
    const [movieInfo, setMovieInfo] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState("");
    const [isShowModal, setIsShowModal] = useState(false);
    const { handlePlayTrailer } = useModalContext();
    const token = Cookies.get("accessToken");

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/movies/${id}`);
                setMovieInfo(response.data);
                if (token) {
                    const decodedToken = jwt_decode(token);
                    setUserId(decodedToken.id);
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu người dùng:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMovie();
    }, [id]);
    const handleAddFavoriteMovie = async (movieIds) => {
        try {
            if (!token) {
                throw new Error(
                    "Token không tồn tại hoặc người dùng chưa đăng nhập",
                );
            }

            const response = await axios.post(
                `${API_URL}/api/favoriteMovies`,
                { movieIds },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (response.status === 201 || response.status === 200) {
                const { userName, movieNames } = response.data;
                console.log(`Người dùng: ${userName}`);
                console.log(
                    "Danh sách phim yêu thích đã cập nhật:",
                    movieNames,
                );
                showSuccessToast(
                    "Thành công",
                    "Bạn đã thêm phim vào danh sách yêu thích",
                );
            }
        } catch (error) {
            console.error("Lỗi khi thêm phim vào danh sách yêu thích:", error);

            if (error.response) {
                if (error.response.status === 400) {
                    console.error("Phim này đã có trong danh sách yêu thích.");
                } else if (error.response.status === 403) {
                    console.error(
                        "Bạn không có quyền thêm phim vào danh sách.",
                    );
                } else if (error.response.status === 500) {
                    console.error("Lỗi máy chủ.");
                }
            }

            // Trả về thông tin lỗi
            return { success: false, error };
        }
    };
    const [commentLoaded, setcommentLoaded] = useState(false);
    console.log("commentLoaded", commentLoaded);
    const handleSidebarLoadComplete = () => {
        setcommentLoaded(true); // Cập nhật trạng thái khi sidebar đã tải xong
    };

    const handleWatchMovie = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/api/payment/payment-status/${userId}`,
            );
            console.log("Kết quả kiểm tra thanh toán:", response.data);
            if (response.data.paid) {
                window.location.href = `/watch/${movieInfo._id}`;
            } else {
                // window.location.href = `/payment`;
                // setIsShowModal(true);
                showPaymentModal();
            }
        } catch (error) {
            console.error("Lỗi khi kiểm tra thanh toán:", error);
            // window.location.href = `/payment`;
            // setIsShowModal(true);
            showPaymentModal();
        }
    };

    const handlePayment = async () => {
        if (!userId) {
            alert("Vui lòng đăng nhập!");
            return;
        }

        setIsLoading(true);
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
                    window.location.href = `/watch/${movieInfo._id}`;
                }
            };
            window.addEventListener("storage", onPaymentSuccess);
        } catch (error) {
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert("Lỗi kết nối!");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const showPaymentModal = () => {
        document.documentElement.style.overflow = "hidden";
        setIsShowModal(true);
    };

    const hidePaymentModal = () => {
        document.documentElement.style.overflow = "auto";
        setIsShowModal(false);
    };

    return (
        <div className="min-h-[40vh] bg-[#06121d] px-5 py-3 lg:py-5">
            {isLoading ? (
                <Spinner />
            ) : (
                <div className="mx-auto max-w-screen-xl">
                    <div className="relative py-3">
                        <figure className="h-[480px] lg:h-[450px]">
                            <img
                                src={
                                    movieInfo.thumbUrl
                                        ? movieInfo.thumbUrl.startsWith("http")
                                            ? movieInfo.thumbUrl
                                            : `${API_URL}/images/movies/${movieInfo.thumbUrl}`
                                        : "/img-placeholder.jpg"
                                }
                                width={1280}
                                height={450}
                                className="h-full w-full object-cover brightness-50"
                            />
                        </figure>
                        <figure className="absolute left-5 top-5 h-[285px] w-[200px]">
                            <img
                                src={
                                    movieInfo.posterUrl
                                        ? movieInfo.posterUrl.startsWith("http")
                                            ? movieInfo.posterUrl
                                            : `${API_URL}/images/movies/${movieInfo.posterUrl}`
                                        : "/img-placeholder.jpg"
                                }
                                width={200}
                                height={285}
                                className="h-full w-full object-cover"
                            />
                        </figure>
                        <div className="absolute bottom-5 left-5 sm:bottom-6 md:bottom-7 lg:bottom-9">
                            <div className="flex items-center gap-[10px]">
                                {movieInfo.voteAverage ? (
                                    <div className="flex items-center gap-1">
                                        <CircularProgressBar
                                            percent={Math.round(
                                                movieInfo.voteAverage * 10,
                                            )}
                                        />
                                        <span className="text-white">
                                            Rating
                                        </span>
                                    </div>
                                ) : null}
                                <ul className="flex flex-wrap gap-2">
                                    {(movieInfo.genres || [])
                                        .slice(0, 3)
                                        .map((genre) => (
                                            <li
                                                key={genre._id}
                                                className="rounded-lg bg-white p-[6px] text-sm font-medium text-black"
                                            >
                                                {genre.nameGenre}
                                            </li>
                                        ))}
                                </ul>
                            </div>
                            <div className="left-5 mt-2 flex flex-wrap items-center gap-2 sm:mt-3">
                                <button
                                    className="flex h-10 items-center justify-center gap-2 rounded-full bg-black px-3 font-medium text-white"
                                    onClick={() => {
                                        handlePlayTrailer(
                                            movieInfo?.trailerKey,
                                        );
                                    }}
                                >
                                    <FontAwesomeIcon icon={faFilm} />
                                    Xem Trailer
                                </button>
                                {userId && (
                                    <button
                                        // href={`/watch/${movieInfo._id}`}
                                        onClick={handleWatchMovie}
                                        className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#ffb700] px-5 font-medium text-[#171c28]"
                                    >
                                        <FontAwesomeIcon
                                            icon={faPlay}
                                            className="text-white"
                                        />
                                        Xem ngay
                                    </button>
                                )}
                                {userId && (
                                    <button
                                        className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#ff0000] px-5 text-base text-white"
                                        onClick={() =>
                                            handleAddFavoriteMovie([id])
                                        }
                                    >
                                        <img
                                            src="/heart.svg"
                                            alt=""
                                            className="invert"
                                        />
                                        Thêm vào yêu thích
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 space-y-2 text-base text-white lg:text-lg">
                        <h1 className="text-3xl font-bold lg:text-4xl">
                            {movieInfo?.originName}
                        </h1>
                        <p>
                            <span className="font-medium">Thời gian:</span>{" "}
                            {movieInfo?.time}
                        </p>
                        <p>
                            <span className="font-medium">Năm phát hành:</span>{" "}
                            {movieInfo?.year}
                        </p>
                        <p>
                            <span className="font-medium">Thể loại:</span>{" "}
                            {(movieInfo?.genres || [])
                                .map((genre) => genre.nameGenre)
                                .join(", ")}
                        </p>
                        <p>
                            <span className="font-medium">Nội dung:</span>{" "}
                            {movieInfo?.content}
                        </p>
                        <p>
                            <span className="font-medium">Đạo diễn:</span>{" "}
                            {movieInfo?.director || []}
                        </p>
                        <p>
                            <span className="font-medium">Diễn viên:</span>{" "}
                            {movieInfo?.actor || []}
                        </p>
                    </div>

                    <Comments
                        movieId={movieInfo._id}
                        userId={userId}
                        onLoadComplete={handleSidebarLoadComplete}
                    />

                    <Toast />

                    {isShowModal && (
                        <PaymentModal
                            isLoading={isLoading}
                            hidePaymentModal={hidePaymentModal}
                            handlePayment={handlePayment}
                        />
                    )}
                </div>
            )}
        </div>
    );
};
export default MovieDetail;
