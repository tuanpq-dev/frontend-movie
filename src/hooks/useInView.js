import { useEffect, useRef, useState } from "react";

// Trả về [ref, inView]; khi đã vào viewport (cộng rootMargin) thì giữ true luôn.
export const useInView = ({ rootMargin = "400px 0px" } = {}) => {
    const ref = useRef(null);
    const [inView, setInView] = useState(
        () => typeof IntersectionObserver === "undefined",
    );

    useEffect(() => {
        const node = ref.current;
        if (inView || !node) return undefined;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin },
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [inView, rootMargin]);

    return [ref, inView];
};
