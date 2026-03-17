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
import { API_URL } from "@libs/config";
import GenreForm from "./components/GenreForm";

// Create context for modal actions
const GenreModalContext = createContext({});

// Action Column Component
const ActionColumn = ({ record }) => {
    const { openEditModal } = useContext(GenreModalContext);
    const { reloadPage } = useDataTableContext() || {};
    const token = Cookies.get("accessToken");

    const handleDelete = async (id, name) => {
        try {
            await axios.delete(`${API_URL}/api/genres/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            message.success(`Đã xóa thể loại "${name}"`);
            reloadPage();
        } catch (error) {
            message.error("Lỗi khi xóa thể loại");
            console.error("Error deleting genre:", error);
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
                title="Xóa thể loại"
                description={`Bạn có chắc muốn xóa "${record.nameGenre}"?`}
                onConfirm={() => handleDelete(record._id, record.nameGenre)}
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

const ManageGenre = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [editingGenre, setEditingGenre] = useState(null);

    const openCreateModal = () => {
        setEditingGenre(null);
        setModalVisible(true);
    };

    const openEditModal = (genre) => {
        setEditingGenre(genre);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingGenre(null);
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
            title: "Tên thể loại",
            dataIndex: "nameGenre",
            key: "nameGenre",
            sorter: true,
        },
        {
            title: "Mô tả",
            dataIndex: "desc",
            key: "desc",
            ellipsis: true,
            responsive: ["lg"],
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
            <span className="hidden sm:inline">Thêm thể loại</span>
            <span className="sm:hidden">Thêm</span>
        </Button>,
    ];

    return (
        <GenreModalContext.Provider value={{ openEditModal }}>
            <div className="mb-4 md:mb-6">
                <h1 className="mb-2 text-xl font-bold text-gray-800 sm:text-2xl md:mb-4 md:text-3xl">
                    Quản lý thể loại
                </h1>
            </div>
            <div className="overflow-x-auto rounded-lg bg-white p-2 shadow sm:p-3 md:p-4">
                <DataTableWrapper
                    url={`${API_URL}/api/genres`}
                    columns={columns}
                    toolbars={toolbars}
                    rowKey="_id"
                    scroll={{ x: 600 }}
                    tableProps={{
                        size: "small",
                    }}
                    showColumnIndex={false}
                >
                    <FormRowDataTable
                        visible={modalVisible}
                        onClose={closeModal}
                        formType={editingGenre ? "edit" : "create"}
                        resource={
                            editingGenre
                                ? `${API_URL}/api/genres/${editingGenre._id}`
                                : `${API_URL}/api/genres`
                        }
                        method={editingGenre ? "PUT" : "POST"}
                        title={
                            editingGenre
                                ? "Chỉnh sửa thể loại"
                                : "Thêm thể loại mới"
                        }
                        initialValues={editingGenre || {}}
                        width="90%"
                        style={{ maxWidth: 600 }}
                    >
                        <GenreForm />
                    </FormRowDataTable>
                </DataTableWrapper>
            </div>
        </GenreModalContext.Provider>
    );
};

export default ManageGenre;
