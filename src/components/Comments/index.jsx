import { useEffect, useState } from "react";
import CommentForm from "./CommentForm";
import Comment from "./Comment";
import Cookies from "js-cookie";
import axios from "axios";
import { API_URL } from "@libs/config";

const Comments = ({ movieId, userId, onLoadComplete }) => {
    const [loading, setLoading] = useState(true);
    console.log("loading", loading);
    const [backendComments, setBackendComments] = useState([]);
    const [activeComment, setActiveComment] = useState(null);
    const token = Cookies.get("accessToken");

    function truncateText(text, maxLength = 100) {
        return text.length > maxLength
            ? text.slice(0, maxLength) + "..."
            : text;
    }

    const addComment = async (text, parentId = null) => {
        try {
            let response;
            if (parentId == null) {
                const comment = {
                    content: text,
                    movieId: movieId,
                    userId: userId,
                };

                response = await axios.post(
                    `${API_URL}/api/comments`,
                    comment,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );
            } else {
                const replies = {
                    contentReplies: text,
                    parentId: parentId,
                };

                response = await axios.post(
                    `${API_URL}/api/comments/replies`,
                    replies,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );
            }

            if (response?.status === 201) {
                console.log("Thêm bình luận thành công:", response.data);
                fetchComments();
            }

            setActiveComment(null);
        } catch (err) {
            console.error("Lỗi khi thêm bình luận:", err);
        }
    };

    const updateComment = async (text, commentId) => {
        try {
            await axios.put(
                `${API_URL}/api/comments/${commentId}`,
                { content: text },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            setBackendComments((prevComments) =>
                prevComments.map((comment) =>
                    comment._id === commentId
                        ? { ...comment, content: text }
                        : comment,
                ),
            );

            setActiveComment(null);
        } catch (err) {
            console.error("Lỗi khi cập nhật bình luận:", err);
        }
    };

    const deleteComment = async (commentId, content) => {
        if (
            window.confirm(
                `Bạn có chắc muốn xóa bình luận "${truncateText(content)}"?`,
            )
        ) {
            try {
                await axios.delete(`${API_URL}/api/comments/${commentId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                fetchComments();
            } catch (err) {
                console.error("Lỗi khi xóa bình luận:", err);
            }
        }
    };

    const fetchComments = async () => {
        try {
            if (userId) {
                const response = await axios.get(
                    `${API_URL}/api/comments/${movieId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );
                setBackendComments(response.data);
            }
        } catch (error) {
            console.error("Lỗi khi lấy bình luận:", error);
        } finally {
            setLoading(false);
            onLoadComplete();
        }
    };

    // Gọi fetchComments khi component mount
    useEffect(() => {
        fetchComments();
    }, [onLoadComplete]);

    return (
        <div className="mt-6 text-white">
            <h2 className="text-3xl font-medium">Danh sách bình luận</h2>
            <p className="mb-2 mt-3 text-xl">Để lại bình luận của bạn</p>

            <CommentForm
                handleSubmit={addComment}
                submitLabel="Bình luận"
                hasCancelButton={false}
            />

            <div className="mt-8">
                {(backendComments || []).map((rootComment) => (
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
                    />
                ))}
            </div>
        </div>
    );
};
export default Comments;
