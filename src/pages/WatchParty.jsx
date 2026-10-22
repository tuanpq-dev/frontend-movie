import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faComments,
    faCrown,
    faLink,
    faUsers,
} from "@fortawesome/free-solid-svg-icons";
import EpisodeList from "@components/EpisodeList";
import PartyPlayer from "@components/WatchParty/PartyPlayer";
import PartyPanel, { Avatar } from "@components/WatchParty/PartyPanel";
import { showErrorToast, showSuccessToast } from "@components/Toast/Toast";
import { useKKMovie } from "@/hooks/useMovieData";
import useWatchParty from "@/hooks/useWatchParty";
import {
    buildRoomPath,
    loadIdentity,
    markKicked,
    saveNickname,
    wasKicked,
} from "@libs/watchParty/room";
import {
    NICKNAME_MAX,
    PLAYBACK_RATES,
    cleanText,
    isSlug,
    nearestRate,
} from "@libs/watchParty/protocol";

const ROOM_ID_RE = /^[a-z0-9]{6,32}$/;
const DEFAULT_PLAYBACK = { currentTime: 0, isPlaying: false, rate: 1 };

const Notice = ({ title, children }) => (
    <div className="page-surface flex justify-center px-4 py-16 text-white">
        <div className="w-full max-w-md rounded-xl bg-surface-2 p-6 text-center">
            <h1 className="text-xl font-bold">{title}</h1>
            <div className="mt-3 text-sm leading-6 text-muted">{children}</div>
            <Link
                to="/"
                className="mt-6 inline-block rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-ink transition-colors hover:bg-primary-hover"
            >
                Về trang chủ
            </Link>
        </div>
    </div>
);

const StatusBadge = ({ tone, children }) => (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-3 px-3 py-1 text-xs">
        <span
            className={`h-2 w-2 rounded-full ${
                tone === "ok"
                    ? "bg-emerald-400"
                    : tone === "warn"
                      ? "bg-primary"
                      : "bg-red-400"
            }`}
        />
        {children}
    </span>
);

const JoinForm = ({ identity, onJoin }) => {
    const [nickname, setNickname] = useState(identity.nickname);
    const clean = cleanText(nickname, NICKNAME_MAX);

    const submit = (event) => {
        event.preventDefault();
        if (clean) onJoin(clean);
    };

    return (
        <div className="page-surface flex justify-center px-4 py-16 text-white">
            <form
                onSubmit={submit}
                className="w-full max-w-md rounded-xl bg-surface-2 p-6"
            >
                <h1 className="text-xl font-bold">Xem chung</h1>
                <p className="mt-2 text-sm leading-6 text-muted">
                    Xem cùng lúc với bạn bè, video được đồng bộ và có khung trò
                    chuyện. Không cần tài khoản, chỉ cần một biệt danh.
                </p>
                <label
                    htmlFor="party-nickname"
                    className="mt-5 block text-sm font-medium"
                >
                    Biệt danh
                </label>
                <div className="mt-2 flex items-center gap-3">
                    <Avatar
                        nickname={clean}
                        hue={identity.hue}
                        className="h-10 w-10 text-base"
                    />
                    <input
                        id="party-nickname"
                        value={nickname}
                        onChange={(event) => setNickname(event.target.value)}
                        maxLength={NICKNAME_MAX}
                        autoFocus
                        placeholder="Ví dụ: Tuấn"
                        className="min-w-0 flex-1 rounded-lg bg-surface-3 px-4 py-2.5 text-sm text-white outline-none placeholder:text-muted focus:ring-1 focus:ring-primary"
                    />
                </div>
                <button
                    type="submit"
                    disabled={!clean}
                    className="mt-5 w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-ink transition-colors hover:bg-primary-hover disabled:opacity-50"
                >
                    Vào phòng
                </button>
            </form>
        </div>
    );
};

const readInitialMedia = (searchParams) => {
    const movieSlug = searchParams.get("phim");
    const episode = searchParams.get("tap");
    return {
        movieSlug: isSlug(movieSlug) ? movieSlug : null,
        server: Math.max(Number(searchParams.get("sv")) || 0, 0),
        episode: isSlug(episode) ? episode : null,
    };
};

const WatchPartyRoom = ({ roomId, identity, onKicked }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [media, setMedia] = useState(() => readInitialMedia(searchParams));
    const [syncState, setSyncState] = useState("synced");
    const [panelOpen, setPanelOpen] = useState(true);
    const [blockedNotice, setBlockedNotice] = useState(false);
    const [rate, setRate] = useState(1);
    const { data: movie, loading } = useKKMovie(media.movieSlug);

    const playerRef = useRef(null);
    const pendingRef = useRef(null);
    const lastRemoteRef = useRef(null);
    const blockedTimer = useRef(null);

    const servers = movie?.servers || [];
    const serverIndex = Math.min(media.server, Math.max(servers.length - 1, 0));
    const episodes = servers[serverIndex]?.episodes || [];
    const episode =
        episodes.find((item) => item.slug === media.episode) || episodes[0];

    const resolvedRef = useRef(null);
    resolvedRef.current = {
        movieSlug: media.movieSlug,
        server: serverIndex,
        episode: episode?.slug || media.episode || null,
    };

    const getSnapshot = useCallback(() => {
        const current = resolvedRef.current;
        if (!current.movieSlug) return null;
        const playback =
            playerRef.current?.getPlayback() ||
            lastRemoteRef.current ||
            DEFAULT_PLAYBACK;
        return {
            ...current,
            currentTime: playback.currentTime,
            isPlaying: playback.isPlaying,
            rate: nearestRate(playback.rate),
        };
    }, []);

    const handleRemoteState = useCallback((state) => {
        lastRemoteRef.current = state;
        setRate(state.rate);
        const current = resolvedRef.current;
        if (
            state.movieSlug !== current.movieSlug ||
            state.server !== current.server ||
            state.episode !== current.episode
        ) {
            // Đổi phim/tập: chờ player nạp nguồn mới rồi mới áp dụng thời gian.
            pendingRef.current = state;
            setMedia({
                movieSlug: state.movieSlug,
                server: state.server,
                episode: state.episode,
            });
            return;
        }
        if (playerRef.current) playerRef.current.apply(state);
        else pendingRef.current = state; // player chưa mount (đang tải phim)
    }, []);

    const party = useWatchParty({
        roomId,
        identity,
        getSnapshot,
        onRemoteState: handleRemoteState,
        onKicked,
    });

    // Nguồn video mới đã gắn vào player: áp dụng trạng thái đang chờ.
    useEffect(() => {
        if (pendingRef.current && playerRef.current) {
            playerRef.current.apply(pendingRef.current);
            pendingRef.current = null;
        }
    }, [episode?.m3u8, episode?.embed]);

    // Giữ link mời luôn trỏ đúng phim/tập đang xem.
    useEffect(() => {
        const { movieSlug, server, episode: episodeSlug } = resolvedRef.current;
        if (!movieSlug) return;
        const next = buildRoomPath(roomId, {
            movieSlug,
            server,
            episode: episodeSlug,
        }).split("?")[1];
        if (next !== searchParams.toString()) {
            setSearchParams(next, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [media.movieSlug, serverIndex, episode?.slug, roomId]);

    useEffect(() => () => clearTimeout(blockedTimer.current), []);

    const handleBlocked = useCallback(() => {
        setBlockedNotice(true);
        clearTimeout(blockedTimer.current);
        blockedTimer.current = setTimeout(() => setBlockedNotice(false), 2500);
    }, []);

    const { publishState } = party;
    const handleUserAction = useCallback(() => {
        const snapshot = getSnapshot();
        if (snapshot) setRate(snapshot.rate);
        publishState("action");
    }, [getSnapshot, publishState]);

    const selectEpisode = (server, episodeSlug) => {
        if (!party.canControl) {
            handleBlocked();
            return;
        }
        const playback = getSnapshot() || DEFAULT_PLAYBACK;
        const state = {
            movieSlug: media.movieSlug,
            server,
            episode: episodeSlug,
            currentTime: 0,
            isPlaying: playback.isPlaying,
            rate: playback.rate,
        };
        pendingRef.current = { ...state, sentAt: Date.now() };
        lastRemoteRef.current = pendingRef.current;
        setMedia({ movieSlug: media.movieSlug, server, episode: episodeSlug });
        publishState("action", state);
    };

    const changeRate = (event) => {
        playerRef.current?.setRate(Number(event.target.value));
    };

    const copyInvite = async () => {
        const link = `${window.location.origin}${buildRoomPath(roomId, resolvedRef.current)}`;
        try {
            await navigator.clipboard.writeText(link);
            showSuccessToast("Đã sao chép link mời");
        } catch {
            showErrorToast("Không sao chép được", link);
        }
    };

    const hostName =
        party.members.find((member) => member.clientId === party.hostId)
            ?.nickname || "";
    const connection =
        party.status === "online"
            ? { tone: "ok", label: "Đang kết nối" }
            : party.status === "connecting"
              ? { tone: "warn", label: "Đang vào phòng..." }
              : { tone: "bad", label: "Mất kết nối, đang thử lại..." };
    const syncBadge = party.isHost
        ? { tone: "ok", label: "Bạn đang điều khiển" }
        : syncState === "synced"
          ? { tone: "ok", label: "Đã đồng bộ" }
          : { tone: "warn", label: "Đang bắt kịp..." };
    const embedOnly = episode && !episode.m3u8;

    return (
        <div className="page-surface px-3 py-4 text-white sm:px-5 min-[1025px]:py-6">
            <div className="mx-auto grid max-w-screen-2xl gap-4 min-[1025px]:grid-cols-[minmax(0,1fr)_360px]">
                <div className="min-w-0 min-[1025px]:col-start-1">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                        {!media.movieSlug ? (
                            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted">
                                Đang chờ host chia sẻ phim...
                            </div>
                        ) : loading && !movie ? (
                            <div className="skeleton-shimmer absolute inset-0" />
                        ) : !movie ? (
                            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">
                                Không tìm thấy phim
                            </div>
                        ) : (
                            <PartyPlayer
                                ref={playerRef}
                                episode={episode}
                                title={movie.name}
                                canControl={party.canControl}
                                onUserAction={handleUserAction}
                                onBlockedAction={handleBlocked}
                                onSyncChange={setSyncState}
                            />
                        )}
                        {blockedNotice && (
                            <p className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-surface/90 px-4 py-2 text-xs">
                                Chỉ host được điều khiển video
                            </p>
                        )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold sm:text-2xl">
                                {movie ? (
                                    <Link
                                        to={`/phim/${movie.slug}`}
                                        className="transition-colors hover:text-primary"
                                    >
                                        {movie.name}
                                    </Link>
                                ) : (
                                    "Phòng xem chung"
                                )}
                            </h1>
                            <p className="mt-1 text-sm text-muted">
                                {[
                                    servers[serverIndex]?.name,
                                    episode?.name,
                                    hostName && `Host: ${hostName}`,
                                ]
                                    .filter(Boolean)
                                    .join(" • ")}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <StatusBadge tone={connection.tone}>
                                    {connection.label}
                                </StatusBadge>
                                {party.status === "online" && (
                                    <StatusBadge tone={syncBadge.tone}>
                                        {syncBadge.label}
                                    </StatusBadge>
                                )}
                            </div>
                            {party.transportName === "p2p" &&
                                party.members.length <= 1 && (
                                    <p className="mt-2 max-w-xl text-xs leading-5 text-muted">
                                        Đang chờ người khác vào. Kết nối P2P có
                                        thể mất vài giây; nếu bạn bè mở link mà
                                        vẫn không thấy nhau, mạng của một bên
                                        (4G, wifi công ty) có thể chặn kết nối
                                        trực tiếp.
                                    </p>
                                )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={copyInvite}
                                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-ink transition-colors hover:bg-primary-hover"
                            >
                                <FontAwesomeIcon icon={faLink} />
                                Sao chép link mời
                            </button>
                            <button
                                type="button"
                                onClick={() => setPanelOpen((value) => !value)}
                                aria-expanded={panelOpen}
                                className="inline-flex items-center gap-2 rounded-full bg-surface-3 px-4 py-2 text-sm transition-colors hover:bg-surface-4 min-[1025px]:hidden"
                            >
                                <FontAwesomeIcon icon={faComments} />
                                {panelOpen ? "Ẩn trò chuyện" : "Trò chuyện"}
                            </button>
                        </div>
                    </div>

                    {embedOnly && (
                        <p className="mt-3 rounded-lg bg-surface-2 px-4 py-3 text-sm text-muted">
                            Tập này chỉ có player nhúng (iframe) của bên thứ ba,
                            không điều khiển được từ trang này. Phòng chỉ đồng
                            bộ phim/tập, mỗi người tự bấm phát.
                        </p>
                    )}

                    {party.status === "online" && (
                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-lg bg-surface-2 px-4 py-3 text-sm">
                            {party.isHost ? (
                                <label className="inline-flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={party.allowAll}
                                        onChange={(event) =>
                                            party.setAllowAll(
                                                event.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 accent-primary"
                                    />
                                    Cho phép mọi người điều khiển
                                </label>
                            ) : (
                                <span className="inline-flex items-center gap-2 text-muted">
                                    <FontAwesomeIcon
                                        icon={
                                            party.canControl ? faUsers : faCrown
                                        }
                                        className="text-primary"
                                    />
                                    {party.canControl
                                        ? "Mọi người đều có thể điều khiển"
                                        : "Chỉ host điều khiển video"}
                                </span>
                            )}
                            {party.canControl && !embedOnly && (
                                <label className="inline-flex items-center gap-2">
                                    Tốc độ
                                    <select
                                        value={rate}
                                        onChange={changeRate}
                                        className="rounded-md bg-surface-3 px-2 py-1 text-sm text-white outline-none"
                                    >
                                        {PLAYBACK_RATES.map((rate) => (
                                            <option key={rate} value={rate}>
                                                {rate}x
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            )}
                        </div>
                    )}
                </div>

                <PartyPanel
                    messages={party.messages}
                    members={party.members}
                    hostId={party.hostId}
                    me={identity.clientId}
                    isHost={party.isHost}
                    sendChat={party.sendChat}
                    transferHost={party.transferHost}
                    kick={party.kick}
                    className={`h-[420px] min-[1025px]:sticky min-[1025px]:top-20 min-[1025px]:col-start-2 min-[1025px]:row-span-2 min-[1025px]:row-start-1 min-[1025px]:flex min-[1025px]:h-[calc(100vh-6rem)] min-[1025px]:self-start ${
                        panelOpen ? "" : "hidden"
                    }`}
                />

                {movie && (episodes.length > 1 || servers.length > 1) && (
                    <section className="min-w-0 rounded-xl bg-surface-2 p-4 sm:p-5 min-[1025px]:col-start-1">
                        <h2 className="mb-4 text-lg font-semibold">
                            Danh sách tập
                        </h2>
                        <EpisodeList
                            key={`${movie.slug}-${serverIndex}`}
                            movie={movie}
                            activeServer={serverIndex}
                            activeEpisode={episode?.slug}
                            onSelect={selectEpisode}
                            disabled={!party.canControl}
                        />
                    </section>
                )}
            </div>
        </div>
    );
};

const WatchParty = () => {
    const { roomId } = useParams();
    const [identity, setIdentity] = useState(loadIdentity);
    const [joined, setJoined] = useState(false);
    const [kicked, setKicked] = useState(() => wasKicked(roomId));

    const handleKicked = useCallback(() => {
        markKicked(roomId);
        setKicked(true);
    }, [roomId]);

    if (!ROOM_ID_RE.test(roomId || "")) {
        return <Notice title="Link phòng không hợp lệ" />;
    }
    if (kicked) {
        return (
            <Notice title="Bạn đã được mời ra khỏi phòng">
                Host đã mời bạn ra khỏi phòng xem chung này.
            </Notice>
        );
    }
    if (!joined) {
        return (
            <JoinForm
                identity={identity}
                onJoin={(nickname) => {
                    saveNickname(nickname);
                    setIdentity((value) => ({ ...value, nickname }));
                    setJoined(true);
                }}
            />
        );
    }

    return (
        <WatchPartyRoom
            key={roomId}
            roomId={roomId}
            identity={identity}
            onKicked={handleKicked}
        />
    );
};

export default WatchParty;
