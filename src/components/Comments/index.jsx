import { useCallback, useEffect, useMemo, useState } from "react";
import CommentForm from "./CommentForm";
import Comment from "./Comment";
import { apiClient } from "@libs/apiClient";
import { invalidateCache } from "@libs/requestCache";
import { useCachedResource } from "@/hooks/useCachedResource";

const truncateText = (text = "", maxLength = 100) =>
    text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

const getReplyFromResponse = (response, parentId, text) => {
    const candidates = [
        response?.reply,
        response?.data,
        response?.comment,
        response?.createdReply,
        response,
    ].filter(Boolean);

    const directReply = candidates.find(
        (item) =>
            (item?._id || item?.id) &&
            (item?.content || item?.contentReplies) &&
            !Array.isArray(item?.replies),
    );

    if (directReply) {
        return directReply;
    }

    const returnedReplies = candidates
        .flatMap((item) => (Array.isArray(item?.replies) ? item.replies : []))
        .filter(Boolean);

    return (
        returnedReplies.find(
            (reply) =>
                (reply.parentId === parentId ||
                    reply.parentId?._id === parentId) &&
                (reply.content === text || reply.contentReplies === text),
        ) || returnedReplies[returnedReplies.length - 1]
    );
};

const normalizeReply = (reply, { parentId, text, userId }) => {
    return {
        ...reply,
        _id: reply?._id || reply?.id || crypto.randomUUID(),
        parentId: reply?.parentId || parentId,
        userId: reply?.userId || userId,
        username: reply?.username || reply?.userId?.username || "Bạn",
        content: reply?.content || reply?.contentReplies || text,
        createdAt: reply?.createdAt,
        updatedAt: reply?.updatedAt,
        replies: [],
    };
};

const appendReplyToParent = (comments, parentId, reply) =>
    comments.map((comment) => {
        if (comment._id !== parentId && comment.id !== parentId) {
            return comment;
        }

        return {
            ...comment,
            replies: [
                ...(Array.isArray(comment.replies) ? comment.replies : []),
                reply,
            ],
        };
    });

const CommentsSkeleton = () => (
    <div className="mt-8 space-y-5">
        {[0, 1, 2].map((item) => (
            <div key={item} className="flex gap-3 rounded-2xl bg-[#171c28] p-4">
                <div className="skeleton-shimmer h-11 w-11 rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="skeleton-shimmer h-5 w-40 rounded" />
                    <div className="skeleton-shimmer h-4 w-full max-w-2xl rounded" />
                </div>
            </div>
        ))}
    </div>
);

const Comments = ({ movieId, userId, onLoadComplete }) => {
    const [backendComments, setBackendComments] = useState([]);
    const [activeComment, setActiveComment] = useState(null);
    const [submittingTarget, setSubmittingTarget] = useState(null);
    const cacheKey = useMemo(
        () => (movieId && userId ? `comments:movie:${movieId}` : null),
        [movieId, userId],
    );

    const fetchComments = useCallback(
        () => apiClient.get(`/api/comments/${movieId}`),
        [movieId],
    );

    const {
        data: cachedComments,
        loading,
        reload,
    } = useCachedResource(cacheKey, fetchComments, {
        enabled: Boolean(cacheKey),
        staleTime: 30 * 1000,
    });

    useEffect(() => {
        if (Array.isArray(cachedComments)) {
            setBackendComments(cachedComments);
        }
    }, [cachedComments]);

    useEffect(() => {
        if (!loading) {
            onLoadComplete?.();
        }
    }, [loading, onLoadComplete]);

    const reloadComments = useCallback(() => {
        if (cacheKey) {
            invalidateCache(cacheKey);
            reload({ force: true });
        }
    }, [cacheKey, reload]);

    const addComment = useCallback(
        async (text, parentId = null) => {
            const target = parentId || "root";
            setSubmittingTarget(target);

            try {
                if (parentId == null) {
                    await apiClient.post("/api/comments", {
                        content: text,
                        movieId,
                        userId,
                    });
                    setActiveComment(null);
                    reloadComments();
                    return true;
                }

                const response = await apiClient.post("/api/comments/replies", {
                    contentReplies: text,
                    parentId,
                });
                const reply = normalizeReply(
                    getReplyFromResponse(response, parentId, text),
                    { parentId, text, userId },
                );

                setBackendComments((prevComments) =>
                    appendReplyToParent(prevComments, parentId, reply),
                );
                if (cacheKey) {
                    invalidateCache(cacheKey);
                }
                setActiveComment(null);
                return true;
            } catch (err) {
                console.error("Lỗi khi thêm bình luận:", err);
                return false;
            } finally {
                setSubmittingTarget(null);
            }
        },
        [cacheKey, movieId, reloadComments, userId],
    );

    const updateComment = useCallback(
        async (text, commentId) => {
            try {
                await apiClient.put(`/api/comments/${commentId}`, {
                    content: text,
                });

                setBackendComments((prevComments) =>
                    prevComments.map((comment) =>
                        comment._id === commentId
                            ? { ...comment, content: text }
                            : comment,
                    ),
                );

                if (cacheKey) {
                    invalidateCache(cacheKey);
                }
                setActiveComment(null);
            } catch (err) {
                console.error("Lỗi khi cập nhật bình luận:", err);
            }
        },
        [cacheKey],
    );

    const deleteComment = useCallback(
        async (commentId, content) => {
            if (
                !window.confirm(
                    `Bạn có chắc muốn xóa bình luận "${truncateText(content)}"?`,
                )
            ) {
                return;
            }

            try {
                await apiClient.delete(`/api/comments/${commentId}`);
                reloadComments();
            } catch (err) {
                console.error("Lỗi khi xóa bình luận:", err);
            }
        },
        [reloadComments],
    );

    return (
        <section className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-[#202631] p-3 text-white shadow-xl shadow-black/20 sm:mt-8 sm:p-5 min-[1025px]:p-6">
            <div className="mb-5">
                <h2 className="text-xl font-semibold lg:text-2xl">
                    Danh sách bình luận
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                    Để lại bình luận của bạn
                </p>
            </div>

            <CommentForm
                handleSubmit={addComment}
                submitLabel="Bình luận"
                hasCancelButton={false}
                isSubmitting={submittingTarget === "root"}
            />

            {loading && backendComments.length === 0 ? (
                <CommentsSkeleton />
            ) : backendComments.length === 0 ? (
                <p className="mt-6 rounded-xl bg-white/5 p-4 text-center text-gray-300">
                    Chưa có bình luận nào.
                </p>
            ) : (
                <div className="mt-6 space-y-3 sm:mt-7">
                    {backendComments.map((rootComment) => (
                        <Comment
                            key={rootComment._id}
                            comment={rootComment}
                            activeComment={activeComment}
                            setActiveComment={setActiveComment}
                            replies={rootComment?.replies}
                            addComment={addComment}
                            updateComment={updateComment}
                            deleteComment={deleteComment}
                            currentUserId={userId}
                            submittingTarget={submittingTarget}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default Comments;
