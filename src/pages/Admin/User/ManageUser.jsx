import DataTableWrapper from "src/@crema/core/DataTable/index";
import FormRowDataTable from "src/@crema/component/FormRowDataTable/index";
import { Button, Space, Popconfirm, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useState, createContext, useContext } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useDataTableContext } from "src/@crema/core/DataTable/DataTableContext";
import { API_URL, getAvatarUrl } from "@libs/config";
import { invalidateCache } from "@libs/requestCache";
import UserForm from "./components/UserForm";

const DEFAULT_AVATAR =
    "https://img.freepik.com/free-psd/3d-rendering-avatar_23-2150833560.jpg?w=740&t=st=1728638508~exp=1728639108~hmac=59fcbd89a8d344fb2797ab35306b6b539a477e5dd919d73e04bd449290c3a5f4";

const EMPTY_INITIAL_VALUES = {};

const normalizeUserInitialValues = (user) => {
    if (!user) return EMPTY_INITIAL_VALUES;

    const moduleValues = Array.isArray(user.modules)
        ? user.modules
              .map((m) => (typeof m === "string" ? m : m?.id || m?._id))
              .filter(Boolean)
        : [];

    return {
        ...user,
        modules: moduleValues,
    };
};

// Create context for modal actions
const UserModalContext = createContext({});

// Action Column Component
const ActionColumn = ({ record }) => {
    const { openEditModal } = useContext(UserModalContext);
    const { reloadPage } = useDataTableContext() || {};
    const token = Cookies.get("accessToken");

    const handleDelete = async (id, name) => {
        try {
            await axios.delete(`${API_URL}/api/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            message.success(`Đã xóa người dùng "${name}"`);
            invalidateCache("users");
            reloadPage();
        } catch (error) {
            message.error("Lỗi khi xóa người dùng");
            console.error("Error deleting user:", error);
        }
    };

    return (
        <Space size="small" wrap>
            <Button
                size="small"
                icon={<FontAwesomeIcon icon={faEdit} />}
                onClick={() => openEditModal(record)}
                title="Sửa"
            />
            <Popconfirm
                title="Xóa người dùng"
                description={`Bạn có chắc muốn xóa "${record.username}"?`}
                onConfirm={() => handleDelete(record._id, record.username)}
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

const ManageUser = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(DEFAULT_AVATAR);
    const [avatarFile, setAvatarFile] = useState(null);
    const token = Cookies.get("accessToken");

    const openCreateModal = () => {
        setEditingUser(null);
        setAvatarPreview(DEFAULT_AVATAR);
        setAvatarFile(null);
        setModalVisible(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setAvatarPreview(getAvatarUrl(user?.avatar));
        setAvatarFile(null);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingUser(null);
        setAvatarPreview(DEFAULT_AVATAR);
        setAvatarFile(null);
    };

    const handleChangeAvatar = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
            setAvatarFile(file);
        }
    };

    const columns = [
        {
            title: "STT",
            key: "index",
            width: 60,
            align: "center",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Avatar",
            dataIndex: "avatar",
            key: "avatar",
            width: 80,
            render: (url) => (
                <img
                    src={getAvatarUrl(url)}
                    alt="Avatar"
                    className="h-12 w-12 rounded-full object-cover"
                />
            ),
        },
        {
            title: "Tên người dùng",
            dataIndex: "username",
            key: "username",
            sorter: true,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            responsive: ["md"],
            ellipsis: true,
        },
        {
            title: "Quyền",
            dataIndex: "isAdmin",
            key: "isAdmin",
            width: 120,
            responsive: ["sm"],
            render: (isAdmin, record) => {
                const isModerator =
                    !isAdmin && Array.isArray(record?.modules) && record.modules.length > 0;

                let className = "bg-blue-100 text-blue-600";
                let label = "Người dùng";

                if (isAdmin) {
                    className = "bg-red-100 text-red-600";
                    label = "Quản trị";
                } else if (isModerator) {
                    className = "bg-amber-100 text-amber-700";
                    label = "Mod";
                }

                return (
                    <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${className}`}
                    >
                        {label}
                    </span>
                );
            },
        },
        {
            title: "Hành động",
            key: "action",
            width: 120,
            fixed: "right",
            render: (_, record) => <ActionColumn record={record} />,
        },
    ];

    const toolbars = [
        <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
            className="w-full sm:w-auto"
        >
            <span className="hidden sm:inline">Thêm người dùng</span>
            <span className="sm:hidden">Thêm</span>
        </Button>,
    ];

    return (
        <UserModalContext.Provider value={{ openEditModal }}>
            <div className="mb-4 md:mb-6">
                <h1 className="mb-2 text-xl font-bold text-gray-800 sm:text-2xl md:mb-4 md:text-3xl">
                    Quản lý người dùng
                </h1>
            </div>
            <div className="overflow-x-auto rounded-lg bg-white p-2 shadow sm:p-3 md:p-4">
                <DataTableWrapper
                                url={`${API_URL}/api/users`}
                                columns={columns}
                                toolbars={toolbars}
                                rowKey="_id"
                                scroll={{ x: 700 }}
                                tableProps={{
                                    size: "small",
                                }}
                                showColumnIndex={false}
                            >
                                <FormRowDataTable
                                    visible={modalVisible}
                                    onClose={closeModal}
                                    formType={editingUser ? "edit" : "create"}
                                    resource={
                                        editingUser
                                            ? `${API_URL}/api/users/${editingUser._id}`
                                            : `${API_URL}/api/users`
                                    }
                                    method={editingUser ? "PUT" : "POST"}
                                    title={
                                        editingUser
                                            ? "Chỉnh sửa người dùng"
                                            : "Thêm người dùng mới"
                                    }
                                    initialValues={normalizeUserInitialValues(editingUser)}
                                    width="90%"
                                    style={{ maxWidth: 700 }}
                                    customSubmit={async (
                                        formData,
                                        { method, resource },
                                    ) => {
                                        const submitData = new FormData();

                                        Object.keys(formData).forEach((key) => {
                                            if (key === "modules") {
                                                return;
                                            }

                                            if (
                                                key !== "avatar" &&
                                                formData[key] !== undefined &&
                                                formData[key] !== null
                                            ) {
                                                submitData.append(
                                                    key,
                                                    formData[key],
                                                );
                                            }
                                        });

                                        if (!formData.isAdmin) {
                                            const selectedModules = Array.isArray(formData.modules)
                                                ? formData.modules
                                                : [];

                                            selectedModules.forEach((moduleId) => {
                                                submitData.append("modules", moduleId);
                                            });
                                        }

                                        if (avatarFile) {
                                            submitData.append(
                                                "avatar",
                                                avatarFile,
                                            );
                                        }

                                        const headers = {
                                            Authorization: `Bearer ${token}`,
                                            "Content-Type":
                                                "multipart/form-data",
                                        };

                                        if (method === "PUT") {
                                            await axios.put(
                                                resource,
                                                submitData,
                                                { headers },
                                            );
                                        } else {
                                            await axios.post(
                                                resource,
                                                submitData,
                                                { headers },
                                            );
                                        }
                                    }}
                                >
                                    <UserForm
                                        isEditing={!!editingUser}
                                        avatarPreview={avatarPreview}
                                        onChangeAvatar={handleChangeAvatar}
                                    />
                </FormRowDataTable>
            </DataTableWrapper>
            </div>
        </UserModalContext.Provider>
    );
};

export default ManageUser;
