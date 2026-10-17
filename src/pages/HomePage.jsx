import FeatureMovies from "@components/FeatureMovies";
import MediaList from "@components/MediaList";
import { MovieGridSkeleton } from "@components/Skeleton";
import { useKKList, useKKNewest } from "@/hooks/useMovieData";
import { useInView } from "@/hooks/useInView";

const HOME_SECTIONS = [
    { title: "Phim lẻ mới", path: "/v1/api/danh-sach/phim-le", to: "/danh-sach/phim-le" },
    { title: "Phim bộ mới", path: "/v1/api/danh-sach/phim-bo", to: "/danh-sach/phim-bo" },
    { title: "Phim Hàn Quốc", path: "/v1/api/quoc-gia/han-quoc", to: "/quoc-gia/han-quoc" },
    { title: "Phim Trung Quốc", path: "/v1/api/quoc-gia/trung-quoc", to: "/quoc-gia/trung-quoc" },
    { title: "Phim Âu Mỹ", path: "/v1/api/quoc-gia/au-my", to: "/quoc-gia/au-my" },
    { title: "Phim chiếu rạp", path: "/v1/api/danh-sach/phim-chieu-rap", to: "/danh-sach/phim-chieu-rap" },
    { title: "Hoạt hình", path: "/v1/api/danh-sach/hoat-hinh", to: "/danh-sach/hoat-hinh" },
];

// Section chỉ gọi API khi cuộn tới gần (400px) để trang chủ không bắn 8 request cùng lúc.
const HomeSection = ({ title, path, to }) => {
    const [ref, inView] = useInView();
    const { data, loading } = useKKList(path, { limit: 12 }, { enabled: inView });

    return (
        <div ref={ref}>
            {!inView || (loading && !data) ? (
                <MovieGridSkeleton count={12} />
            ) : (
                <MediaList movies={data?.items} title={title} viewAllTo={to} />
            )}
        </div>
    );
};

function HomePage() {
    const { data: newest, loading } = useKKNewest(1);

    return (
        <div className="page-surface">
            <FeatureMovies
                movies={newest?.items?.slice(0, 8) || []}
                loading={loading}
            />
            {HOME_SECTIONS.map((section) => (
                <HomeSection key={section.path} {...section} />
            ))}
        </div>
    );
}

export default HomePage;
