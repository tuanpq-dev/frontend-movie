import { useState } from "react";
import { Link } from "react-router-dom";

// Chọn server + tập; link sang /xem/:slug?sv=&tap=
const EpisodeList = ({ movie, activeServer = 0, activeEpisode }) => {
    const [serverIndex, setServerIndex] = useState(activeServer);
    const servers = movie.servers || [];
    const server = servers[serverIndex] || servers[0];

    if (!server) {
        return <p className="text-sm text-muted">Phim chưa có tập nào.</p>;
    }

    return (
        <div>
            {servers.length > 1 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {servers.map((item, index) => (
                        <button
                            key={item.name}
                            type="button"
                            onClick={() => setServerIndex(index)}
                            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                index === serverIndex
                                    ? "bg-primary text-primary-ink"
                                    : "bg-surface-3 text-white hover:bg-surface-4"
                            }`}
                        >
                            {item.name}
                        </button>
                    ))}
                </div>
            )}
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6 min-[1025px]:grid-cols-8 xl:grid-cols-10">
                {server.episodes.map((episode) => {
                    const isActive =
                        serverIndex === activeServer &&
                        episode.slug === activeEpisode;
                    return (
                        <li key={episode.slug}>
                            <Link
                                to={`/xem/${movie.slug}?sv=${serverIndex}&tap=${episode.slug}`}
                                className={`block truncate rounded-lg px-2 py-2 text-center text-sm transition-colors ${
                                    isActive
                                        ? "bg-primary font-semibold text-primary-ink"
                                        : "bg-surface-3 text-white hover:bg-surface-4"
                                }`}
                            >
                                {episode.name}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default EpisodeList;
