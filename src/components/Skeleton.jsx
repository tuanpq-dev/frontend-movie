const SkeletonBlock = ({ className = "" }) => (
    <div className={`skeleton-shimmer ${className}`} />
);

export const RouteFallback = () => (
    <div className="page-surface px-5 py-6 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-screen-xl">
            <SkeletonBlock className="h-8 w-48 rounded-md" />
            <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 min-[1025px]:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index}>
                        <SkeletonBlock className="aspect-[2/3] rounded-lg" />
                        <SkeletonBlock className="mt-2 h-4 w-4/5 rounded" />
                        <SkeletonBlock className="mt-1.5 h-3 w-2/5 rounded" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const HeroSkeleton = () => (
    <div className="hidden bg-surface md:block">
        <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonBlock key={index} className="aspect-video" />
            ))}
        </div>
    </div>
);

export const MovieGridSkeleton = ({ title = true, count = 12 }) => (
    <div className="media-section px-5 py-6 text-white lg:px-8 lg:py-10">
        {title && <SkeletonBlock className="mb-4 h-8 w-56 rounded-md" />}
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 min-[1025px]:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index}>
                    <SkeletonBlock className="aspect-[2/3] rounded-lg" />
                    <SkeletonBlock className="mt-2 h-4 w-5/6 rounded" />
                    <SkeletonBlock className="mt-1.5 h-3 w-1/2 rounded" />
                </div>
            ))}
        </div>
    </div>
);

export const DetailSkeleton = () => (
    <div className="page-surface px-5 py-3 lg:py-5">
        <div className="mx-auto max-w-screen-xl">
            <SkeletonBlock className="h-[480px] rounded-md lg:h-[450px]" />
            <SkeletonBlock className="mt-4 h-10 w-2/3 rounded-md" />
            <SkeletonBlock className="mt-3 h-5 w-full rounded" />
            <SkeletonBlock className="mt-2 h-5 w-5/6 rounded" />
            <SkeletonBlock className="mt-8 h-32 w-full rounded-xl" />
        </div>
    </div>
);

export const TableSkeleton = () => (
    <div className="rounded-lg bg-white p-4 shadow">
        <SkeletonBlock className="h-10 w-64 rounded-md" />
        <div className="mt-5 space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-12 rounded-md" />
            ))}
        </div>
    </div>
);
