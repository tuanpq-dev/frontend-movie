import CommentForm from "./CommentForm";

const Comment = ({
    comment,
    activeComment,
    setActiveComment,
    replies,
    addComment,
    updateComment,
    deleteComment,
    currentUserId,
    parentId = null,
}) => {
    const isReplying =
        activeComment?.id &&
        activeComment.id === comment._id &&
        activeComment.type === "replying";
    const isEditing =
        activeComment?.id &&
        activeComment.id === comment._id &&
        activeComment.type === "editing";
    const canReply = !!currentUserId;
    const canEdit =
        currentUserId === comment.userId && comment?.replies?.length === 0;
    const canDelete =
        currentUserId === comment.userId && comment?.replies?.length === 0;

    function timeAgo(createdAt) {
        const now = new Date();
        const past = new Date(createdAt);
        const diffInSeconds = Math.floor((now - past) / 1000);

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
                return count === 1
                    ? `1 ${interval.label} trước`
                    : `${count} ${interval.label} trước`;
            }
        }
        return "Vừa xong";
    }

    return (
        <div className="mb-6 flex gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[50%] bg-[#fd7e97] text-white">
                {comment?.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <p className="text-lg font-medium">{comment.username}</p>
                    {/* <p>
                        {new Date(comment.createdAt).toLocaleDateString(
                            "vi-VN",
                            {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                            },
                        )}{" "}
                        {new Date(comment.createdAt).toLocaleTimeString(
                            "vi-VN",
                            {
                                hour: "2-digit",
                                minute: "2-digit",
                            },
                        )}
                    </p> */}
                    <p>{timeAgo(comment.createdAt)}</p>
                </div>
                {!isEditing && <p className="mt-1">{comment.content}</p>}
                {isEditing && (
                    <CommentForm
                        submitLabel="Cập nhật"
                        hasCancelButton
                        initialText={comment.content}
                        handleSubmit={(text) =>
                            updateComment(text, comment._id)
                        }
                        handleCancel={() => setActiveComment(null)}
                    />
                )}
                <div className="flex gap-1">
                    {canReply && (
                        <p
                            className="mt-1 cursor-pointer px-1 text-[#0071dc] hover:underline"
                            onClick={() =>
                                setActiveComment({
                                    id: comment._id,
                                    type: "replying",
                                })
                            }
                        >
                            Trả lời
                        </p>
                    )}
                    {canEdit && (
                        <p
                            className="mt-1 cursor-pointer px-1 text-[#0071dc] hover:underline"
                            onClick={() =>
                                setActiveComment({
                                    id: comment._id,
                                    type: "editing",
                                })
                            }
                        >
                            Sửa
                        </p>
                    )}
                    {canDelete && (
                        <p
                            className="mt-1 cursor-pointer px-1 text-[#0071dc] hover:underline"
                            onClick={() =>
                                deleteComment(comment._id, comment.content)
                            }
                        >
                            Xóa
                        </p>
                    )}
                </div>

                {isReplying && (
                    <CommentForm
                        handleSubmit={(text) =>
                            addComment(text, parentId ? parentId : comment._id)
                        }
                        submitLabel="Bình luận"
                        handleCancel={() => setActiveComment(null)}
                    />
                )}

                {/* Replies */}
                {replies && (
                    <div className="mt-5">
                        {replies.map((reply) => (
                            <Comment
                                key={reply._id}
                                comment={reply}
                                activeComment={activeComment}
                                setActiveComment={setActiveComment}
                                replies={[]}
                                addComment={addComment}
                                updateComment={updateComment}
                                deleteComment={deleteComment}
                                currentUserId={currentUserId}
                                parentId={comment._id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
export default Comment;
