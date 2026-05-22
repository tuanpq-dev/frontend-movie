import { memo } from "react";
import CommentForm from "./CommentForm";

const getUserId = (user) =>
    typeof user === "string" ? user : user?._id || user?.id || "";

const getCommentText = (comment) =>
    comment?.content || comment?.contentReplies || "";

const timeAgo = (createdAt) => {
    if (!createdAt) return "";

    const now = new Date();
    const past = new Date(createdAt);
    const diffInSeconds = Math.max(Math.floor((now - past) / 1000), 0);

    const intervals = [
        { label: "năm", seconds: 31536000 },
        { label: "tháng", seconds: 2592000 },
        { label: "ngày", seconds: 86400 },
        { label: "giờ", seconds: 3600 },
        { label: "phút", seconds: 60 },
        { label: "giây", seconds: 1 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label} trước`;
        }
    }

    return "Vừa xong";
};

const Comment = memo(function Comment({
    comment,
    activeComment,
    setActiveComment,
    replies,
    addComment,
    updateComment,
    deleteComment,
    currentUserId,
    submittingTarget,
    parentId = null,
    parentCreatedAt = null,
}) {
    const commentId = comment?._id || comment?.id;
    const commentUserId = getUserId(comment?.userId);
    const commentText = getCommentText(comment);
    const isReply = Boolean(parentId);
    const isReplying =
        activeComment?.id === commentId && activeComment.type === "replying";
    const isEditing =
        activeComment?.id === commentId && activeComment.type === "editing";
    const canReply = Boolean(currentUserId) && !isReply;
    const canEdit =
        currentUserId === commentUserId &&
        (comment?.replies?.length || 0) === 0;
    const canDelete =
        currentUserId === commentUserId &&
        (comment?.replies?.length || 0) === 0;
    const displayName =
        comment?.username || comment?.userId?.username || "Người dùng";
    const initials = displayName.slice(0, 2).toUpperCase();
    const displayTime = isReply
        ? comment?.createdAt || comment?.updatedAt || parentCreatedAt
        : comment?.createdAt || comment?.updatedAt;

    return (
        <article
            className={`flex gap-3 rounded-2xl transition-colors ${
                isReply
                    ? "border-l border-white/10 py-2.5 pl-2.5 sm:ml-6 sm:pl-4 min-[1025px]:ml-8"
                    : "bg-[#171c28] p-3.5 sm:p-4"
            }`}
        >
            <div
                className={`flex shrink-0 items-center justify-center rounded-full bg-[#fd7e97] font-semibold text-white ${
                    isReply ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"
                }`}
            >
                {initials}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-semibold text-white sm:text-base">
                        {displayName}
                    </p>
                    {timeAgo(displayTime) && (
                        <p className="text-[11px] text-gray-500 sm:text-xs">
                            {timeAgo(displayTime)}
                        </p>
                    )}
                </div>

                {!isEditing && (
                    <p className="mt-1 break-words text-sm leading-6 text-gray-100">
                        {commentText}
                    </p>
                )}

                {isEditing && (
                    <CommentForm
                        submitLabel="Cập nhật"
                        hasCancelButton
                        initialText={commentText}
                        handleSubmit={(text) => updateComment(text, commentId)}
                        handleCancel={() => setActiveComment(null)}
                    />
                )}

                <div className="mt-2 flex flex-wrap gap-1.5">
                    {canReply && (
                        <button
                            type="button"
                            className="rounded-full px-2.5 py-1 text-xs font-semibold text-[#ffcf45] transition-colors hover:bg-white/5"
                            onClick={() =>
                                setActiveComment({
                                    id: commentId,
                                    type: "replying",
                                })
                            }
                        >
                            Trả lời
                        </button>
                    )}
                    {canEdit && (
                        <button
                            type="button"
                            className="rounded-full px-2.5 py-1 text-xs font-semibold text-[#4ea1ff] transition-colors hover:bg-white/5"
                            onClick={() =>
                                setActiveComment({
                                    id: commentId,
                                    type: "editing",
                                })
                            }
                        >
                            Sửa
                        </button>
                    )}
                    {canDelete && (
                        <button
                            type="button"
                            className="rounded-full px-2.5 py-1 text-xs font-semibold text-[#ff6b7d] transition-colors hover:bg-white/5"
                            onClick={() =>
                                deleteComment(commentId, commentText)
                            }
                        >
                            Xóa
                        </button>
                    )}
                </div>

                {isReplying && (
                    <div className="mt-3 rounded-xl bg-white/[0.03] p-3">
                        <CommentForm
                            handleSubmit={(text) => addComment(text, commentId)}
                            submitLabel="Bình luận"
                            handleCancel={() => setActiveComment(null)}
                            isSubmitting={submittingTarget === commentId}
                            className="mt-0"
                        />
                    </div>
                )}

                {Array.isArray(replies) && replies.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                        {replies.map((reply) => (
                            <Comment
                                key={reply._id || reply.id}
                                comment={reply}
                                activeComment={activeComment}
                                setActiveComment={setActiveComment}
                                replies={[]}
                                addComment={addComment}
                                updateComment={updateComment}
                                deleteComment={deleteComment}
                                currentUserId={currentUserId}
                                submittingTarget={submittingTarget}
                                parentId={commentId}
                                parentCreatedAt={comment?.createdAt}
                            />
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
});

export default Comment;
