import DataTableWrapper from "src/@crema/core/DataTable/index";
import FormRowDataTable from "src/@crema/component/FormRowDataTable/index";
import { Button, Space, Popconfirm, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useState, createContext, useContext } from "react";
import SideBar from "@components/SideBar";
import axios from "axios";
import Cookies from "js-cookie";
import { useDataTableContext } from "src/@crema/core/DataTable/DataTableContext";
import { API_URL } from "@libs/config";
import UserForm from "./components/UserForm";

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
    const [sidebarLoaded, setSidebarLoaded] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const openCreateModal = () => {
        setEditingUser(null);
        setModalVisible(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingUser(null);
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
            dataIndex: "profilePic",
            key: "profilePic",
            width: 80,
            render: (url) => (
                <img
                    src={
                        url
                            ? `${API_URL}/images/users/${url}`
                            : "/img-placeholder.jpg"
                    }
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
            render: (isAdmin) => (
                <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                        isAdmin
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                    }`}
                >
                    {isAdmin ? "Quản trị" : "Người dùng"}
                </span>
            ),
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
            <div className="min-h-screen bg-gray-50">
                <SideBar
                    onLoadComplete={() => setSidebarLoaded(true)}
                    onCollapsedChange={setSidebarCollapsed}
                />
                {sidebarLoaded && (
                    <div
                        className={`min-h-screen overflow-x-hidden p-3 pt-16 transition-all duration-300 sm:p-4 md:p-6 lg:pt-6 ${
                            sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
                        }`}
                    >
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
                                    initialValues={editingUser || {}}
                                    width="90%"
                                    style={{ maxWidth: 700 }}
                                >
                                    <UserForm
                                        isEditing={!!editingUser}
                                        editingUser={editingUser}
                                    />
                                </FormRowDataTable>
                            </DataTableWrapper>
                        </div>
                    </div>
                )}
            </div>
        </UserModalContext.Provider>
    );
};

export default ManageUser;
