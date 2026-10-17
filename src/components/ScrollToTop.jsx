import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";

const ScrollToTop = () => {
    const { pathname } = useLocation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 300);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollBackToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <button
            type="button"
            onClick={scrollBackToTop}
            aria-label="Quay lên đầu trang"
            className={`fixed bottom-5 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-surface-2/90 text-primary shadow-[0_12px_35px_rgba(0,0,0,0.45)] backdrop-blur transition-all duration-200 hover:bg-surface-3 hover:text-white sm:bottom-6 sm:right-6 sm:h-12 sm:w-12 ${
                isVisible
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-4 opacity-0"
            }`}
        >
            <FontAwesomeIcon icon={faArrowUp} />
        </button>
    );
};

export default ScrollToTop;
