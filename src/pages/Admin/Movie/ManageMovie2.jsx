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
    Row,
    Col,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useState, createContext, useContext, useEffect } from "react";
import SideBar from "@components/SideBar";
import axios from "axios";
import Cookies from "js-cookie";
import { useDataTableContext } from "src/@crema/core/DataTable/DataTableContext";
import { API_URL } from "@libs/config";

// Create context for modal actions
const MovieModalContext = createContext({});

// Action column component to access context
const ActionColumn = ({ record }) => {
    const token = Cookies.get("accessToken");
    const { reloadPage } = useDataTableContext();
    const { openEditModal } = useContext(MovieModalContext);

    const handleDelete = async (id, name) => {
        try {
            await axios.delete(`${API_URL}/api/movies/${id}`, {
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
    const [posterPreview, setPosterPreview] = useState("/img-placeholder.jpg");
    const [thumbPreview, setThumbPreview] = useState("/img-placeholder.jpg");
    const [posterFile, setPosterFile] = useState(null);
    const [thumbFile, setThumbFile] = useState(null);
    const [genresList, setGenresList] = useState([]);
    const token = Cookies.get("accessToken");

    // Fetch genres list
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/genres`);
                setGenresList(response.data);
            } catch (error) {
                console.error("Error fetching genres:", error);
            }
        };
        fetchGenres();
    }, []);

    const openEditModal = (movie) => {
        setEditingMovie(movie);
        setPosterPreview(
            movie.posterUrl
                ? movie.posterUrl.startsWith("http")
                    ? movie.posterUrl
                    : `${API_URL}/images/movies/${movie.posterUrl}`
                : "/img-placeholder.jpg",
        );
        setThumbPreview(
            movie.thumbUrl
                ? movie.thumbUrl.startsWith("http")
                    ? movie.thumbUrl
                    : `${API_URL}/images/movies/${movie.thumbUrl}`
                : "/img-placeholder.jpg",
        );
        setPosterFile(null);
        setThumbFile(null);
        setModalVisible(true);
    };

    const openCreateModal = () => {
        setEditingMovie(null);
        setPosterPreview("/img-placeholder.jpg");
        setThumbPreview("/img-placeholder.jpg");
        setPosterFile(null);
        setThumbFile(null);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingMovie(null);
        setPosterPreview("/img-placeholder.jpg");
        setThumbPreview("/img-placeholder.jpg");
        setPosterFile(null);
        setThumbFile(null);
    };

    const handleChangePoster = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setPosterPreview(previewUrl);
            setPosterFile(file);
        }
    };

    const handleChangeThumb = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setThumbPreview(previewUrl);
            setThumbFile(file);
        }
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
                            ? url.startsWith("http")
                                ? url
                                : `${API_URL}/images/movies/${url}`
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
                                url={`${API_URL}/api/movies`}
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
                                            ? `${API_URL}/api/movies/${editingMovie._id}`
                                            : `${API_URL}/api/movies`
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
                                    customSubmit={async (
                                        formData,
                                        { method, resource },
                                    ) => {
                                        const submitData = new FormData();

                                        // Append form fields
                                        Object.keys(formData).forEach((key) => {
                                            if (
                                                key !== "posterUrl" &&
                                                key !== "thumbUrl" &&
                                                formData[key] !== undefined &&
                                                formData[key] !== null
                                            ) {
                                                if (
                                                    key === "episodes" &&
                                                    typeof formData[key] ===
                                                        "object"
                                                ) {
                                                    submitData.append(
                                                        key,
                                                        JSON.stringify(
                                                            formData[key],
                                                        ),
                                                    );
                                                } else if (
                                                    key === "genres" &&
                                                    Array.isArray(formData[key])
                                                ) {
                                                    submitData.append(
                                                        key,
                                                        formData[key]
                                                            .map(
                                                                (g) =>
                                                                    g._id || g,
                                                            )
                                                            .join(","),
                                                    );
                                                } else {
                                                    submitData.append(
                                                        key,
                                                        formData[key],
                                                    );
                                                }
                                            }
                                        });

                                        // Append files if selected
                                        if (posterFile) {
                                            submitData.append(
                                                "posterUrl",
                                                posterFile,
                                            );
                                        }
                                        if (thumbFile) {
                                            submitData.append(
                                                "thumbUrl",
                                                thumbFile,
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
                                            <div className="mb-4">
                                                <label className="mb-1 block font-bold">
                                                    Chọn ảnh Poster
                                                </label>
                                                <input
                                                    type="file"
                                                    id="poster-img-modal"
                                                    accept="image/*"
                                                    hidden
                                                    onChange={
                                                        handleChangePoster
                                                    }
                                                />
                                                <label
                                                    htmlFor="poster-img-modal"
                                                    className="cursor-pointer"
                                                >
                                                    <img
                                                        src={posterPreview}
                                                        alt="Poster preview"
                                                        className="h-32 w-32 rounded-xl border border-gray-300 object-cover transition-colors hover:border-blue-500"
                                                    />
                                                </label>
                                            </div>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <div className="mb-4">
                                                <label className="mb-1 block font-bold">
                                                    Chọn ảnh Thumbnail
                                                </label>
                                                <input
                                                    type="file"
                                                    id="thumb-img-modal"
                                                    accept="image/*"
                                                    hidden
                                                    onChange={handleChangeThumb}
                                                />
                                                <label
                                                    htmlFor="thumb-img-modal"
                                                    className="cursor-pointer"
                                                >
                                                    <img
                                                        src={thumbPreview}
                                                        alt="Thumbnail preview"
                                                        className="h-32 w-32 rounded-xl border border-gray-300 object-cover transition-colors hover:border-blue-500"
                                                    />
                                                </label>
                                            </div>
                                        </Col>
                                    </Row>

                                    <Form.Item
                                        label="Trailer Key"
                                        name="trailerKey"
                                    >
                                        <Input placeholder="Nhập trailer key (VD: xG2zhTMEQCo)" />
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
                                        <Col xs={24} sm={12} md={16}>
                                            <Form.Item
                                                label="Thể loại"
                                                name="genres"
                                                getValueFromEvent={(value) =>
                                                    value
                                                }
                                                getValueProps={(value) => ({
                                                    value:
                                                        value?.map(
                                                            (g) => g._id || g,
                                                        ) || [],
                                                })}
                                            >
                                                <Select
                                                    mode="multiple"
                                                    placeholder="Chọn thể loại phim"
                                                    optionFilterProp="children"
                                                    style={{ width: "100%" }}
                                                >
                                                    {genresList.map((genre) => (
                                                        <Select.Option
                                                            key={genre._id}
                                                            value={genre._id}
                                                        >
                                                            {genre.nameGenre}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    {/* Episodes Section - depends on movie type */}
                                    <Form.Item
                                        noStyle
                                        shouldUpdate={(
                                            prevValues,
                                            currentValues,
                                        ) =>
                                            prevValues.type !==
                                            currentValues.type
                                        }
                                    >
                                        {({ getFieldValue }) => {
                                            const movieType =
                                                getFieldValue("type");

                                            if (movieType === "single") {
                                                // Phim lẻ: chỉ 1 video
                                                return (
                                                    <div className="mt-4 rounded-lg border border-gray-200 p-4">
                                                        <h3 className="mb-4 text-lg font-bold">
                                                            Video phim
                                                        </h3>
                                                        <Form.Item
                                                            label="URL Video"
                                                            name={[
                                                                "episodes",
                                                                0,
                                                                "video",
                                                            ]}
                                                        >
                                                            <Input placeholder="Nhập URL video phim" />
                                                        </Form.Item>
                                                        <Form.Item
                                                            hidden
                                                            name={[
                                                                "episodes",
                                                                0,
                                                                "name",
                                                            ]}
                                                            initialValue="Full"
                                                        >
                                                            <Input />
                                                        </Form.Item>
                                                    </div>
                                                );
                                            }

                                            // Phim bộ: nhiều tập
                                            return (
                                                <div className="mt-4 rounded-lg border border-gray-200 p-4">
                                                    <h3 className="mb-4 text-lg font-bold">
                                                        Danh sách tập phim
                                                    </h3>
                                                    <Form.List name="episodes">
                                                        {(
                                                            fields,
                                                            { add, remove },
                                                        ) => (
                                                            <>
                                                                {fields.map(
                                                                    ({
                                                                        key,
                                                                        name,
                                                                        ...restField
                                                                    }) => (
                                                                        <div
                                                                            key={
                                                                                key
                                                                            }
                                                                            className="mb-4 rounded-lg border border-gray-100 bg-gray-50 p-4"
                                                                        >
                                                                            <Row
                                                                                gutter={[
                                                                                    16,
                                                                                    0,
                                                                                ]}
                                                                                align="middle"
                                                                            >
                                                                                <Col
                                                                                    xs={
                                                                                        24
                                                                                    }
                                                                                    md={
                                                                                        11
                                                                                    }
                                                                                >
                                                                                    <Form.Item
                                                                                        {...restField}
                                                                                        name={[
                                                                                            name,
                                                                                            "name",
                                                                                        ]}
                                                                                        label={`Tên tập ${name + 1}`}
                                                                                    >
                                                                                        <Input placeholder="Nhập tên tập phim" />
                                                                                    </Form.Item>
                                                                                </Col>
                                                                                <Col
                                                                                    xs={
                                                                                        24
                                                                                    }
                                                                                    md={
                                                                                        11
                                                                                    }
                                                                                >
                                                                                    <Form.Item
                                                                                        {...restField}
                                                                                        name={[
                                                                                            name,
                                                                                            "video",
                                                                                        ]}
                                                                                        label={`Video tập ${name + 1}`}
                                                                                    >
                                                                                        <Input placeholder="Nhập URL video" />
                                                                                    </Form.Item>
                                                                                </Col>
                                                                                <Col
                                                                                    xs={
                                                                                        24
                                                                                    }
                                                                                    md={
                                                                                        2
                                                                                    }
                                                                                    className="flex items-center justify-center"
                                                                                >
                                                                                    {fields.length >
                                                                                        1 && (
                                                                                        <MinusCircleOutlined
                                                                                            onClick={() =>
                                                                                                remove(
                                                                                                    name,
                                                                                                )
                                                                                            }
                                                                                            className="cursor-pointer text-xl text-red-500 hover:text-red-700"
                                                                                        />
                                                                                    )}
                                                                                </Col>
                                                                            </Row>
                                                                        </div>
                                                                    ),
                                                                )}
                                                                <Form.Item>
                                                                    <Button
                                                                        type="dashed"
                                                                        onClick={() =>
                                                                            add()
                                                                        }
                                                                        block
                                                                        icon={
                                                                            <PlusOutlined />
                                                                        }
                                                                    >
                                                                        Thêm tập
                                                                        phim
                                                                    </Button>
                                                                </Form.Item>
                                                            </>
                                                        )}
                                                    </Form.List>
                                                </div>
                                            );
                                        }}
                                    </Form.Item>
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
