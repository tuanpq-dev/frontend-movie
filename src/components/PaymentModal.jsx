import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const PaymentModal = ({ handlePayment, isLoading, hidePaymentModal }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center">
            <div className="absolute z-[99] overflow-hidden rounded-lg bg-white text-black shadow-lg">
                <div className="flex">
                    <div className="p-7">
                        <div className="flex items-center gap-5">
                            <div className="flex h-14 w-14 items-center justify-center rounded-[50%] bg-black text-center">
                                <h1 className="text-xs font-bold uppercase text-red-500">
                                    Mọt chill
                                </h1>
                            </div>
                            <h2 className="text-lg font-semibold text-[#2c2c2c]">
                                Tài khoản Mọt chill Pro
                            </h2>
                        </div>
                        <div>
                            <p className="mt-8 text-sm font-semibold">
                                Bạn nhận được gì khi sở hữu tài khoản Pro?
                            </p>
                            <ul className="ml-5 mt-2 list-disc text-sm">
                                <li>
                                    Xem phim với chất lượng, tốc độ tốt nhất
                                </li>
                                <li>
                                    Tận hưởng tất cả nội dung phim mới nhất của
                                    chúng tôi
                                </li>
                                <li>Mua một lần xem mãi mãi</li>
                                <li>
                                    Bạn sẽ được nhiều hơn với số tiền bỏ ra!
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="relative min-w-72 flex-shrink-0 bg-[#f5f5f5] p-7">
                        <h3 className="my-2 font-semibold">
                            Chi tiết thanh toán
                        </h3>
                        <div className="mt-2 h-[1px] bg-[#d5d5d5]"></div>
                        <p className="mt-2 text-sm font-semibold text-[#2e3441]">
                            Tài khoản Mọt chill Pro
                        </p>
                        <ul className="ml-4 mt-2 space-y-1 text-sm">
                            <li className="flex justify-between">
                                <span>Giá gốc</span>
                                <span className="line-through">499.000đ</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Giá ưu đãi hôm nay</span>
                                <span>200.000đ</span>
                            </li>
                        </ul>
                        <div className="mt-2 h-[1px] bg-[#d5d5d5]"></div>
                        <div className="mt-4 flex justify-between">
                            <span className="font-semibold text-[#2e3441]">
                                TỔNG
                            </span>
                            <span className="font-semibold text-[#2e3441]">
                                200.000đ
                            </span>
                        </div>
                        <button
                            onClick={handlePayment}
                            disabled={isLoading}
                            className="ml-auto mt-5 flex cursor-pointer items-center justify-center rounded-full bg-[#0265dc] px-6 py-2 text-sm font-semibold text-white hover:opacity-90"
                        >
                            {isLoading
                                ? "Đang xử lý..."
                                : "Tiếp tục thanh toán"}
                        </button>
                        <button
                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-[50%] bg-[#16182314] text-[#4c4c4c] opacity-80 transition-opacity hover:opacity-100"
                            onClick={hidePaymentModal}
                        >
                            <FontAwesomeIcon icon={faClose} />
                        </button>
                    </div>
                </div>
            </div>
            <div
                className="absolute inset-0 bg-[#0009]"
                onClick={hidePaymentModal}
            ></div>
        </div>
    );
};
export default PaymentModal;
