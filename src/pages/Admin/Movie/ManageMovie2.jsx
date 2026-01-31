import DataTableWrapper from "src/@crema/core/DataTable/index";
import FormRowDataTable from "src/@crema/component/FormRowDataTable/index";
import {
    Button,
    Space,
    Popconfirm,
    message,
    Form,
    Input,
    InputNumber,
    Select,
    Upload,
    Row,
    Col,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useState, createContext, useContext } from "react";
import SideBar from "@components/SideBar";
import axios from "axios";
import Cookies from "js-cookie";
import { useDataTableContext } from "src/@crema/core/DataTable/DataTableContext";

// Create context for modal actions
const MovieModalContext = createContext({});

// Image Upload Component
const ImageUpload = ({ value, onChange, currentImage, folder = "movies" }) => {
    const [imageUrl, setImageUrl] = useState(value || currentImage || null);
    const [loading, setLoading] = useState(false);
    const token = Cookies.get("accessToken");

    const handleUpload = async (options) => {
        const { file, onSuccess, onError } = options;
        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        try {
            const response = await axios.post(
                `http://localhost:8080/api/upload/${folder}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                },
            );
            const uploadedFileName = response.data.fileName || response.data;
            setImageUrl(uploadedFileName);
            onChange?.(uploadedFileName);
            onSuccess(response.data);
            message.success("Upload thành công!");
        } catch (error) {
            console.error("Upload error:", error);
            onError(error);
            message.error("Upload thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const displayUrl = imageUrl || value || currentImage;

    return (
        <div>
            <Upload
                name="file"
                listType="picture-card"
                showUploadList={false}
                customRequest={handleUpload}
                accept="image/*"
            >
                {displayUrl ? (
                    <img
                        src={`http://localhost:8080/images/${folder}/${displayUrl}`}
                        alt="preview"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                ) : (
                    <div>
                        {loading ? (
                            <div>Đang tải...</div>
                        ) : (
                            <>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                            </>
                        )}
                    </div>
                )}
            </Upload>
            {displayUrl && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                    {displayUrl}
                </div>
            )}
        </div>
    );
};

// Action column component to access context
const ActionColumn = ({ record }) => {
    const token = Cookies.get("accessToken");
    const { reloadPage } = useDataTableContext();
    const { openEditModal } = useContext(MovieModalContext);

    const handleDelete = async (id, name) => {
        try {
            await axios.delete(`http://localhost:8080/api/movies/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            message.success(`Đã xóa phim "${name}"`);
            reloadPage();
        } catch (error) {
            message.error("Lỗi khi xóa phim");
            console.error("Error deleting movie:", error);
        }
    };

    return (
        <Space size="small" wrap>
            <Button
                size="small"
                icon={<FontAwesomeIcon icon={faEdit} />}
                onClick={() => openEditModal(record)}
                title="Sửa"
            ></Button>
            <Popconfirm
                title="Xóa phim"
                description={`Bạn có chắc muốn xóa "${record.originName}"?`}
                onConfirm={() => handleDelete(record._id, record.originName)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                <Button
                    size="small"
                    icon={<FontAwesomeIcon icon={faTrash} />}
                    title="Xóa"
                    danger
                ></Button>
            </Popconfirm>
        </Space>
    );
};

const ManageMovie2 = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [editingMovie, setEditingMovie] = useState(null);
    const [sidebarLoaded, setSidebarLoaded] = useState(false);

    const openEditModal = (movie) => {
        setEditingMovie(movie);
        setModalVisible(true);
    };

    const openCreateModal = () => {
        setEditingMovie(null);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingMovie(null);
    };

    const columns = [
        {
            title: "Poster",
            dataIndex: "posterUrl",
            key: "posterUrl",
            width: 100,
            render: (url) => (
                <img
                    src={
                        url
                            ? `http://localhost:8080/images/movies/${url}`
                            : "/img-placeholder.jpg"
                    }
                    alt="Poster"
                    className="h-20 w-16 rounded object-cover"
                />
            ),
        },
        {
            title: "Tên phim",
            dataIndex: "originName",
            key: "originName",
            sorter: true,
            ellipsis: true,
            responsive: ["md"],
        },
        {
            title: "Thời gian",
            dataIndex: "time",
            key: "time",
            width: 100,
            responsive: ["lg"],
        },
        {
            title: "Năm",
            dataIndex: "year",
            key: "year",
            width: 80,
            align: "center",
            responsive: ["sm"],
        },
        {
            title: "Thể loại",
            dataIndex: "genres",
            key: "genres",
            width: 200,
            ellipsis: true,
            render: (genres) => genres?.map((g) => g.nameGenre).join(", "),
            responsive: ["lg"],
        },
        {
            title: "Đạo diễn",
            dataIndex: "director",
            key: "director",
            width: 150,
            ellipsis: true,
            responsive: ["xl"],
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
            <span className="hidden sm:inline">Thêm phim mới</span>
            <span className="sm:hidden">Thêm</span>
        </Button>,
    ];

    return (
        <MovieModalContext.Provider value={{ openEditModal }}>
            <div className="min-h-screen bg-gray-50">
                <SideBar onLoadComplete={() => setSidebarLoaded(true)} />
                {sidebarLoaded && (
                    <div className="min-h-screen overflow-x-hidden p-3 pt-16 sm:p-4 md:p-6 lg:ml-64 lg:pt-6">
                        <div className="mb-4 md:mb-6">
                            <h1 className="mb-2 text-xl font-bold text-gray-800 sm:text-2xl md:mb-4 md:text-3xl">
                                Quản lý phim
                            </h1>
                        </div>
                        <div className="overflow-x-auto rounded-lg bg-white p-2 shadow sm:p-3 md:p-4">
                            <DataTableWrapper
                                url="http://localhost:8080/api/movies"
                                columns={columns}
                                toolbars={toolbars}
                                rowKey="_id"
                                scroll={{ x: 800 }}
                                tableProps={{
                                    size: "small",
                                }}
                            >
                                <FormRowDataTable
                                    visible={modalVisible}
                                    onClose={closeModal}
                                    formType={editingMovie ? "edit" : "create"}
                                    resource={
                                        editingMovie
                                            ? `http://localhost:8080/api/movies/${editingMovie._id}`
                                            : "http://localhost:8080/api/movies"
                                    }
                                    method={editingMovie ? "PUT" : "POST"}
                                    title={
                                        editingMovie
                                            ? "Chỉnh sửa phim"
                                            : "Thêm phim mới"
                                    }
                                    initialValues={editingMovie || {}}
                                    width="90%"
                                    style={{ maxWidth: 900 }}
                                >
                                    <Row gutter={[16, 0]}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Tên phim gốc"
                                                name="originName"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            "Vui lòng nhập tên phim!",
                                                    },
                                                ]}
                                            >
                                                <Input placeholder="Nhập tên phim gốc" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Tên phim (Việt)"
                                                name="name"
                                            >
                                                <Input placeholder="Nhập tên phim tiếng Việt" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={[16, 0]}>
                                        <Col xs={24} md={12}>
                                            <Form.Item label="Slug" name="slug">
                                                <Input placeholder="Nhập slug" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} md={6}>
                                            <Form.Item
                                                label="Năm sản xuất"
                                                name="year"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            "Vui lòng nhập năm!",
                                                    },
                                                ]}
                                            >
                                                <InputNumber
                                                    placeholder="Năm"
                                                    min={1900}
                                                    max={2030}
                                                    style={{ width: "100%" }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} md={6}>
                                            <Form.Item
                                                label="Thời lượng"
                                                name="time"
                                            >
                                                <Input placeholder="VD: 120 phút" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={[16, 0]}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Đạo diễn"
                                                name="director"
                                            >
                                                <Input placeholder="Nhập tên đạo diễn" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Diễn viên"
                                                name="actor"
                                            >
                                                <Input placeholder="Nhập danh sách diễn viên" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item label="Nội dung" name="content">
                                        <Input.TextArea
                                            placeholder="Nhập nội dung phim"
                                            rows={4}
                                        />
                                    </Form.Item>

                                    <Row gutter={[16, 0]}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Poster"
                                                name="posterUrl"
                                            >
                                                <ImageUpload
                                                    currentImage={
                                                        editingMovie?.posterUrl
                                                    }
                                                    folder="movies"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Thumbnail"
                                                name="thumbUrl"
                                            >
                                                <ImageUpload
                                                    currentImage={
                                                        editingMovie?.thumbUrl
                                                    }
                                                    folder="movies"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item
                                        label="Trailer URL"
                                        name="trailerUrl"
                                    >
                                        <Input placeholder="Nhập URL trailer" />
                                    </Form.Item>

                                    <Row gutter={[16, 0]}>
                                        <Col xs={24} sm={12} md={8}>
                                            <Form.Item
                                                label="Loại phim"
                                                name="type"
                                            >
                                                <Select placeholder="Chọn loại phim">
                                                    <Select.Option value="single">
                                                        Phim lẻ
                                                    </Select.Option>
                                                    <Select.Option value="series">
                                                        Phim bộ
                                                    </Select.Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12} md={8}>
                                            <Form.Item
                                                label="Trạng thái"
                                                name="status"
                                            >
                                                <Select placeholder="Chọn trạng thái">
                                                    <Select.Option value="ongoing">
                                                        Đang chiếu
                                                    </Select.Option>
                                                    <Select.Option value="completed">
                                                        Hoàn thành
                                                    </Select.Option>
                                                    <Select.Option value="trailer">
                                                        Sắp chiếu
                                                    </Select.Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12} md={8}>
                                            <Form.Item
                                                label="Chất lượng"
                                                name="quality"
                                            >
                                                <Select placeholder="Chọn chất lượng">
                                                    <Select.Option value="HD">
                                                        HD
                                                    </Select.Option>
                                                    <Select.Option value="FHD">
                                                        Full HD
                                                    </Select.Option>
                                                    <Select.Option value="4K">
                                                        4K
                                                    </Select.Option>
                                                    <Select.Option value="CAM">
                                                        CAM
                                                    </Select.Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </FormRowDataTable>
                            </DataTableWrapper>
                        </div>
                    </div>
                )}
            </div>
        </MovieModalContext.Provider>
    );
};

export default ManageMovie2;
