import DataTableWrapper from "src/@crema/core/DataTable/index";
import FormRowDataTable from "src/@crema/component/FormRowDataTable/index";
import { Button, Space, Popconfirm, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faEye } from "@fortawesome/free-solid-svg-icons";
import { useState, createContext, useContext, useEffect } from "react";

import axios from "axios";
import Cookies from "js-cookie";
import { useDataTableContext } from "src/@crema/core/DataTable/DataTableContext";
import { API_URL } from "@libs/config";
import MovieForm from "./components/MovieForm";

// Create context for modal actions
const MovieModalContext = createContext({});

const EMPTY_INITIAL_VALUES = {};

// Action column component to access context
const ActionColumn = ({ record }) => {
    const token = Cookies.get("accessToken");
    const { reloadPage } = useDataTableContext();
    const { openEditModal, openViewModal } = useContext(MovieModalContext);

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
                icon={<FontAwesomeIcon icon={faEye} />}
                onClick={() => openViewModal(record)}
                title="Xem chi tiết"
            ></Button>
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
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [editingMovie, setEditingMovie] = useState(null);
    const [viewingMovie, setViewingMovie] = useState(null);
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

    const openViewModal = (movie) => {
        setViewingMovie(movie);
        setViewModalVisible(true);
    };

    const closeViewModal = () => {
        setViewModalVisible(false);
        setViewingMovie(null);
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
        <MovieModalContext.Provider value={{ openEditModal, openViewModal }}>
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
                                    initialValues={
                                        editingMovie || EMPTY_INITIAL_VALUES
                                    }
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
                                    <MovieForm
                                        genresList={genresList}
                                        posterPreview={posterPreview}
                                        thumbPreview={thumbPreview}
                                        onChangePoster={handleChangePoster}
                                        onChangeThumb={handleChangeThumb}
                                    />
                                </FormRowDataTable>

                                {/* View Detail Modal */}
                                <FormRowDataTable
                                    visible={viewModalVisible}
                                    onClose={closeViewModal}
                                    formType="view"
                                    title="Chi tiết phim"
                                    initialValues={
                                        viewingMovie || EMPTY_INITIAL_VALUES
                                    }
                                    width="90%"
                                    style={{ maxWidth: 900 }}
                                    readOnly={true}
                                >
                                    <MovieForm
                                        readOnly={true}
                                        genresList={genresList}
                                        viewingMovie={viewingMovie}
                                    />
                </FormRowDataTable>
            </DataTableWrapper>
            </div>
        </MovieModalContext.Provider>
    );
};

export default ManageMovie2;
