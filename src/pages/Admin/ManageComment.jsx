import DataTableWrapper from "src/@crema/core/DataTable/index";
import { Button, Modal, Popconfirm, Space, Tag, message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import { createContext, useContext, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import { useDataTableContext } from "src/@crema/core/DataTable/DataTableContext";
import { API_URL } from "@libs/config";
import { invalidateCache } from "@libs/requestCache";

const CommentActionContext = createContext({});

const truncate = (text = "", maxLength = 60) => {
    if (typeof text !== "string") {
        return "";
    }
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const ActionColumn = ({ record }) => {
    const { reloadPage } = useDataTableContext() || {};
    const token = Cookies.get("accessToken");
    const { getCommentContent, onViewReplies } = useContext(
        CommentActionContext,
    );

    const handleDelete = async (id, content) => {
        try {
            await axios.delete(`${API_URL}/api/comments/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            message.success(`Đã xóa bình luận "${truncate(content, 40)}"`);
            invalidateCache("comments");
            reloadPage();
        } catch (error) {
            message.error("Lỗi khi xóa bình luận");
            console.error("Error deleting comment:", error);
        }
    };

    const commentId = record?._id || record?.id;
    const commentContent = getCommentContent(record);

    return (
        <Space size="small" wrap>
            <Button
                size="small"
                icon={<FontAwesomeIcon icon={faEye} />}
                title="Xem phản hồi"
                onClick={() => onViewReplies?.(record)}
            />
            <Popconfirm
                title="Xóa bình luận"
                description={`Bạn có chắc muốn xóa "${truncate(commentContent)}"?`}
                onConfirm={() => handleDelete(commentId, commentContent)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                <Button
                    size="small"
                    danger
                    icon={<FontAwesomeIcon icon={faTrash} />}
                    title="Xóa"
                />
            </Popconfirm>
        </Space>
    );
};

const ManageComment = () => {
    const [replyModal, setReplyModal] = useState({
        open: false,
        comment: null,
    });

    const getCommentContent = (record) =>
        record?.content || record?.contentReplies || "";

    const onViewReplies = (comment) => {
        setReplyModal({
            open: true,
            comment,
        });
    };

    const handleCloseModal = () => {
        setReplyModal({
            open: false,
            comment: null,
        });
    };

    const replies = replyModal?.comment?.replies || [];
    const replyTitle =
        replyModal?.comment?.username ||
        replyModal?.comment?.userId?.username ||
        "Người dùng";
    const parentContent = getCommentContent(replyModal?.comment);

    const columns = [
        {
            title: "STT",
            key: "index",
            width: 60,
            align: "center",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Người dùng",
            key: "username",
            width: 160,
            render: (_, record) =>
                record?.username || record?.userId?.username || "N/A",
        },
        {
            title: "Phim",
            key: "movie",
            width: 220,
            ellipsis: true,
            responsive: ["md"],
            render: (_, record) =>
                record?.originName ||
                record?.movieName ||
                record?.movieId?.originName ||
                record?.movieId?.name ||
                "N/A",
        },
        {
            title: "Nội dung",
            key: "content",
            ellipsis: true,
            render: (_, record) => (
                <p className="line-clamp-2">{getCommentContent(record)}</p>
            ),
        },
        {
            title: "Phản hồi",
            dataIndex: "replies",
            key: "replies",
            width: 110,
            align: "center",
            responsive: ["xl"],
            render: (replies) => {
                const totalReplies = Array.isArray(replies)
                    ? replies.length
                    : 0;
                return totalReplies > 0 ? (
                    <Tag color="blue">{totalReplies}</Tag>
                ) : (
                    <Tag>0</Tag>
                );
            },
        },
        {
            title: "Thời gian tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 160,
            sorter: true,
            responsive: ["lg"],
            render: (date) =>
                date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "N/A",
        },
        {
            title: "Hành động",
            key: "action",
            width: 100,
            fixed: "right",
            render: (_, record) => <ActionColumn record={record} />,
        },
    ];

    return (
        <CommentActionContext.Provider
            value={{ getCommentContent, onViewReplies }}
        >
            <div className="mb-4 md:mb-6">
                <h1 className="mb-2 text-xl font-bold text-gray-800 sm:text-2xl md:mb-4 md:text-3xl">
                    Quản lý bình luận
                </h1>
            </div>
            <div className="overflow-x-auto rounded-lg bg-white p-2 shadow sm:p-3 md:p-4">
                <DataTableWrapper
                    url={`${API_URL}/api/comments`}
                    disableParams
                    columns={columns}
                    rowKey="_id"
                    scroll={{ x: 1100 }}
                    tableProps={{
                        size: "small",
                    }}
                    showColumnIndex={false}
                />
            </div>
            <Modal
                open={replyModal.open}
                title={`Phản hồi từ ${replyTitle}`}
                onCancel={handleCloseModal}
                footer={null}
                width={720}
            >
                <div className="space-y-3">
                    <div className="rounded bg-gray-50 p-3">
                        <p className="text-sm text-gray-600">Bình luận gốc</p>
                        <p className="mt-1 text-base font-medium text-gray-800">
                            {parentContent || "N/A"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-700">
                            Phản hồi ({replies.length})
                        </p>
                        {replies.length === 0 ? (
                            <p className="mt-2 text-gray-500">
                                Chưa có phản hồi.
                            </p>
                        ) : (
                            <div className="mt-2 space-y-3 max-h-96 overflow-y-auto pr-1">
                                {replies.map((reply) => (
                                    <div
                                        key={reply?._id || reply?.id}
                                        className="rounded border border-gray-200 p-3"
                                    >
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>
                                                {reply?.username ||
                                                    reply?.userId?.username ||
                                                    "Người dùng"}
                                            </span>
                                            <span>
                                                {reply?.createdAt
                                                    ? dayjs(
                                                          reply.createdAt,
                                                      ).format(
                                                          "DD/MM/YYYY HH:mm",
                                                      )
                                                    : ""}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-800">
                                            {reply?.content || "N/A"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </CommentActionContext.Provider>
    );
};

export default ManageComment;
