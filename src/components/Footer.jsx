import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFacebookF,
    faTiktok,
    faTwitter,
    faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="border-t border-white/10 bg-surface px-6 py-12 text-white">
            <div className="mx-auto grid gap-10 sm:grid-cols-2 lg:max-w-screen-xl lg:grid-cols-footer">
                <div>
                    <h2>
                        <Link
                            to="/"
                            className="text-3xl font-black uppercase tracking-wide text-red-500"
                        >
                            Một phim
                        </Link>
                    </h2>
                    <p className="mt-5 max-w-[90%] text-sm leading-6 text-gray-400">
                        Trang web xem phim trực tuyến với giao diện tối, tốc độ
                        tải nhanh và danh sách phim được cập nhật thường xuyên.
                    </p>
                    <p className="mt-8 text-sm font-medium text-gray-300">
                        Nhận thông tin về những bộ phim sắp khởi chiếu
                    </p>
                    <form className="my-4 flex gap-2" autoComplete="off">
                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Nhập email"
                            required
                            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                            className="w-full rounded-full border border-solid border-white/10 bg-white/[0.04] px-4 py-2 font-medium text-white placeholder:text-gray-500 focus:border-primary"
                        />
                        <button className="flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-primary-ink">
                            Gửi
                        </button>
                    </form>
                </div>
                <div>
                    <h3 className="text-lg font-bold uppercase text-gray-100">
                        Danh mục
                    </h3>
                    <ul className="mt-4">
                        <li>
                            <a
                                href="#!"
                                className="inline-block py-1 text-gray-400 hover:text-primary"
                            >
                                Phim mới
                            </a>
                        </li>
                        <li>
                            <Link
                                to="/danh-sach/hoat-hinh"
                                className="inline-block py-1 text-gray-400 hover:text-primary"
                            >
                                Phim hoạt hình
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/danh-sach/phim-bo"
                                className="inline-block py-1 text-gray-400 hover:text-primary"
                            >
                                Phim bộ
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/danh-sach/phim-le"
                                className="inline-block py-1 text-gray-400 hover:text-primary"
                            >
                                Phim lẻ
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-bold uppercase text-gray-100">
                        Thể loại
                    </h3>
                    <ul className="mt-4">
                        <li>
                            <a
                                href="#!"
                                className="inline-block py-1 text-gray-400 hover:text-primary"
                            >
                                Cổ trang
                            </a>
                        </li>
                        <li>
                            <a
                                href="#!"
                                className="inline-block py-1 text-gray-400 hover:text-primary"
                            >
                                Hành động
                            </a>
                        </li>
                        <li>
                            <a
                                href="#!"
                                className="inline-block py-1 text-gray-400 hover:text-primary"
                            >
                                Tình cảm
                            </a>
                        </li>
                        <li>
                            <a
                                href="#!"
                                className="inline-block py-1 text-gray-400 hover:text-primary"
                            >
                                Viễn tưởng
                            </a>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-bold uppercase text-gray-100">
                        Điều khoản
                    </h3>
                    <ul className="mt-4">
                        <li>
                            <a
                                href="#!"
                                className="inline-block py-1 text-gray-400 hover:text-primary"
                            >
                                DMCA
                            </a>
                        </li>
                        <li>
                            <a
                                href="#!"
                                className="inline-block py-1 text-gray-400 hover:text-primary"
                            >
                                Liên hệ
                            </a>
                        </li>
                        <li>
                            <a
                                href="#!"
                                className="inline-block py-1 text-gray-400 hover:text-primary"
                            >
                                Quyền riêng tư
                            </a>
                        </li>
                        <li>
                            <a
                                href="#!"
                                className="inline-block py-1 text-gray-400 hover:text-primary"
                            >
                                Điều khoản dịch vụ
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="mx-auto mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 py-4 text-sm text-gray-400 md:flex-row lg:max-w-screen-xl">
                <p>© 2026 Mot Phim. All rights reserved.</p>
                <div className="flex items-center gap-3">
                    <a
                        href="#!"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-200 transition-transform duration-300 hover:-translate-y-1 hover:bg-primary hover:text-primary-ink"
                    >
                        <FontAwesomeIcon icon={faFacebookF} className="w-4" />
                    </a>
                    <a
                        href="#!"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-200 transition-transform duration-300 hover:-translate-y-1 hover:bg-primary hover:text-primary-ink"
                    >
                        <FontAwesomeIcon icon={faYoutube} />
                    </a>
                    <a
                        href="#!"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-200 transition-transform duration-300 hover:-translate-y-1 hover:bg-primary hover:text-primary-ink"
                    >
                        <FontAwesomeIcon icon={faTiktok} />
                    </a>
                    <a
                        href="#!"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-200 transition-transform duration-300 hover:-translate-y-1 hover:bg-primary hover:text-primary-ink"
                    >
                        <FontAwesomeIcon icon={faTwitter} />
                    </a>
                </div>
            </div>
        </footer>
    );
};
export default Footer;
