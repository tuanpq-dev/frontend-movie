import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "@libs/config";

const VnPayReturn = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("pending");
    const [message, setMessage] = useState("Đang xác thực thanh toán...");
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const { data } = await axios.get(
                    `${API_URL}/api/payment/payment_return`,
                    {
                        params: Object.fromEntries(searchParams.entries()),
                    },
                );

                setStatus(data.status);
                setMessage(data.message);

                if (data.status === "success") {
                    // Notify the original tab
                    localStorage.setItem(
                        "paymentSuccess",
                        JSON.stringify({ time: Date.now() }),
                    );
                }
            } catch (error) {
                setStatus("error");
                console.error("Lỗi thanh toán", error);
                setMessage("Lỗi khi xác thực thanh toán!");
            }
        };

        verifyPayment();
    }, [searchParams]);

    // Auto-close tab after countdown when success
    useEffect(() => {
        if (status !== "success") return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    window.close();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [status]);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2 className="text-2xl">{message}</h2>
            {status === "success" ? (
                <>
                    <p style={{ color: "green" }} className="mt-2 text-xl">
                        🎉 Cảm ơn bạn đã thanh toán!
                    </p>
                    <p className="mt-2 text-gray-500">
                        Tab sẽ tự đóng sau {countdown} giây...
                    </p>
                    <button
                        onClick={() => window.close()}
                        className="mt-3 inline-block cursor-pointer rounded bg-blue-500 px-4 py-2 text-lg text-white hover:bg-blue-600"
                    >
                        Đóng tab ngay
                    </button>
                </>
            ) : status === "failed" ? (
                <p style={{ color: "red" }}>
                    ❌ Giao dịch thất bại, vui lòng thử lại.
                </p>
            ) : (
                <p>⏳ Đang xử lý...</p>
            )}
            <img
                src={
                    status === "success"
                        ? "/payment-success.webp"
                        : "/payment-failed.jpg"
                }
                className="mx-auto mt-4"
            />
        </div>
    );
};

export default VnPayReturn;
