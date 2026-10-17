import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronLeft,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

const getPageItems = (current, total) => {
    const pages = new Set([1, total, current - 1, current, current + 1]);
    const sorted = [...pages]
        .filter((page) => page >= 1 && page <= total)
        .sort((a, b) => a - b);

    return sorted.flatMap((page, index) =>
        index > 0 && page - sorted[index - 1] > 1 ? ["…", page] : [page],
    );
};

const buttonClass =
    "flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-medium transition-colors";

const Pagination = ({ currentPage = 1, totalPages = 1, onChange }) => {
    if (totalPages <= 1) return null;

    return (
        <nav
            className="mt-10 flex flex-wrap items-center justify-center gap-2 text-white"
            aria-label="Phân trang"
        >
            <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => onChange(currentPage - 1)}
                className={`${buttonClass} bg-surface-2 hover:bg-surface-3 disabled:opacity-40`}
                aria-label="Trang trước"
            >
                <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            {getPageItems(currentPage, totalPages).map((item, index) =>
                item === "…" ? (
                    <span key={`gap-${index}`} className="px-1 text-muted">
                        …
                    </span>
                ) : (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onChange(item)}
                        className={`${buttonClass} ${
                            item === currentPage
                                ? "bg-primary text-primary-ink"
                                : "bg-surface-2 hover:bg-surface-3"
                        }`}
                        aria-current={item === currentPage ? "page" : undefined}
                    >
                        {item}
                    </button>
                ),
            )}
            <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => onChange(currentPage + 1)}
                className={`${buttonClass} bg-surface-2 hover:bg-surface-3 disabled:opacity-40`}
                aria-label="Trang sau"
            >
                <FontAwesomeIcon icon={faChevronRight} />
            </button>
        </nav>
    );
};

export default Pagination;
