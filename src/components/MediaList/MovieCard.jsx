import { memo } from "react";
import { Link } from "react-router-dom";

const MovieCard = ({ name, year, posterUrl, time, type, content, _id }) => {
    return (
        <Link to={`/info/${_id}`} className="block h-full">
            <article className="card-hover group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#101827] p-2 shadow-lg shadow-black/25 sm:rounded-2xl sm:p-2.5">
                <div className="relative overflow-hidden rounded-lg pt-[138%] sm:rounded-xl">
                    <img
                        src={posterUrl}
                        width={273}
                        height={273}
                        alt={name || "card-film"}
                        loading="lazy"
                        decoding="async"
                        className="absolute left-0 top-0 h-full w-full object-cover transition-opacity duration-300 ease-out group-hover:opacity-45"
                    />
                    <div className="absolute inset-0 bg-[#070b14]/65 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute inset-x-0 bottom-0 translate-y-3 p-2 opacity-0 transition-all delay-0 duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-[2000ms] sm:p-3">
                        <p className="line-clamp-3 text-xs leading-5 text-gray-100 sm:line-clamp-4 sm:text-sm">
                            {content || "Nội dung phim đang được cập nhật."}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-gray-200 sm:mt-3 sm:gap-2 sm:text-xs">
                            {year && (
                                <span className="rounded-md border border-white/30 px-2 py-1">
                                    {year}
                                </span>
                            )}
                            {type && (
                                <span className="rounded-md border border-white/30 px-2 py-1">
                                    {type === "series" ? "Phim bộ" : "Phim lẻ"}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <h3 className="mt-2 line-clamp-2 min-h-[38px] break-words text-sm font-semibold leading-5 text-white transition-colors group-hover:text-[#ffcf45] sm:mt-3 sm:text-base min-[1025px]:text-lg">
                    {name}
                </h3>
                <div className="mt-auto flex min-w-0 justify-between gap-2 pt-2 text-xs text-gray-400 sm:pt-3 sm:text-sm">
                    <p>{year}</p>
                    <p className="truncate">{time}</p>
                </div>
            </article>
        </Link>
    );
};

export default memo(MovieCard);
