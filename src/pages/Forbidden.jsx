import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faHome, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const Forbidden = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
            <div className="max-w-md text-center">
                {/* Icon */}
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20"></div>
                        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-2xl">
                            <FontAwesomeIcon
                                icon={faLock}
                                className="h-16 w-16 text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Error Code */}
                <h1 className="mb-4 text-6xl font-bold text-gray-800">403</h1>

                {/* Title */}
                <h2 className="mb-4 text-2xl font-semibold text-gray-700">
                    Truy cập bị từ chối
                </h2>

                {/* Description */}
                <p className="mb-8 text-gray-600">
                    Xin lỗi, bạn không có quyền truy cập vào trang này. Vui lòng
                    liên hệ quản trị viên nếu bạn nghĩ đây là lỗi.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
                    >
                        <FontAwesomeIcon
                            icon={faArrowLeft}
                            className="transition-transform group-hover:-translate-x-1"
                        />
                        Quay lại
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="group flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:from-red-600 hover:to-red-700 hover:shadow-xl"
                    >
                        <FontAwesomeIcon
                            icon={faHome}
                            className="transition-transform group-hover:scale-110"
                        />
                        Về trang chủ
                    </button>
                </div>

                {/* Additional Info */}
                <div className="mt-12 rounded-lg bg-white p-6 shadow-md">
                    <h3 className="mb-2 font-semibold text-gray-800">
                        Tại sao tôi thấy trang này?
                    </h3>
                    <ul className="space-y-2 text-left text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="mt-1 text-red-500">•</span>
                            <span>Bạn không có quyền truy cập module này</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1 text-red-500">•</span>
                            <span>
                                Tài khoản của bạn có vai trò bị hạn chế (Mod)
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1 text-red-500">•</span>
                            <span>
                                Liên hệ quản trị viên để được cấp quyền truy cập
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Forbidden;
