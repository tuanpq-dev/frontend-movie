import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "@libs/config";

const VnPayReturn = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("pending");
    const [message, setMessage] = useState("Đang xác thực thanh toán...");

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
            } catch (error) {
                setStatus("error");
                console.error("Lỗi thanh toán", error);
                setMessage("Lỗi khi xác thực thanh toán!");
            }
        };

        verifyPayment();
    }, [searchParams]);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2 className="text-2xl">{message}</h2>
            {status === "success" ? (
                <>
                    <p style={{ color: "green" }} className="mt-2 text-xl">
                        🎉 Cảm ơn bạn đã thanh toán!
                    </p>
                    <Link
                        to="/"
                        className="mt-3 inline-block cursor-pointer text-lg hover:opacity-90"
                    >
                        Về trang chủ
                    </Link>
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
