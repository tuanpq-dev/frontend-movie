import { useMemo, useState, useEffect } from "react";
import SideBar from "@components/SideBar";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import Cookies from "js-cookie";
import { Button, Table, Input, Space, Popconfirm, message } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@libs/config";

const ManageMovie = () => {
    const token = Cookies.get("accessToken");
    const [movies, setMovies] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const [sidebarLoaded, setSidebarLoaded] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/movies`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMovies(response.data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách phim");
            console.error("Error fetching movies:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        try {
            await axios.delete(`${API_URL}/api/movies/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            message.success(`Đã xóa phim "${name}"`);
            fetchMovies();
        } catch (error) {
            message.error("Lỗi khi xóa phim");
            console.error("Error deleting movie:", error);
        }
    };

    const handleSidebarLoadComplete = () => {
        setSidebarLoaded(true);
    };

    const handleSidebarCollapsedChange = (collapsed) => {
        setSidebarCollapsed(collapsed);
    };

    const filteredMovies = useMemo(() => {
        return movies.filter((movie) =>
            (movie?.originName ?? "")
                .toLowerCase()
                .includes(searchText.toLowerCase()),
        );
    }, [searchText, movies]);

    const columns = [
        {
            title: "STT",
            key: "index",
            width: 60,
            align: "center",
            render: (_, __, index) => index + 1,
        },
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
            ellipsis: true,
        },
        {
            title: "Thời gian",
            dataIndex: "time",
            key: "time",
            width: 100,
        },
        {
            title: "Năm",
            dataIndex: "year",
            key: "year",
            width: 80,
            align: "center",
        },
        {
            title: "Thể loại",
            dataIndex: "genres",
            key: "genres",
            width: 200,
            ellipsis: true,
            render: (genres) => genres?.map((g) => g.nameGenre).join(", "),
        },
        {
            title: "Đạo diễn",
            dataIndex: "director",
            key: "director",
            width: 150,
            ellipsis: true,
        },
        {
            title: "Hành động",
            key: "action",
            width: 150,
            fixed: "right",
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<FontAwesomeIcon icon={faEdit} />}
                        onClick={() =>
                            navigate(`/admin/movie/edit/${record._id}`)
                        }
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa phim"
                        description={`Bạn có chắc muốn xóa "${record.originName}"?`}
                        onConfirm={() =>
                            handleDelete(record._id, record.originName)
                        }
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            danger
                            size="small"
                            icon={<FontAwesomeIcon icon={faTrash} />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <SideBar
                onLoadComplete={handleSidebarLoadComplete}
                onCollapsedChange={handleSidebarCollapsedChange}
            />
            {sidebarLoaded && (
                <div
                    className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? "lg:ml-0" : ""}`}
                >
                    <div className="mb-6">
                        <h1 className="mb-4 text-3xl font-bold text-gray-800">
                            Quản lý phim
                        </h1>
                        <Space
                            style={{
                                width: "100%",
                                justifyContent: "space-between",
                            }}
                        >
                            <Input
                                placeholder="Tìm kiếm theo tên phim..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ width: 300 }}
                                size="large"
                                allowClear
                            />
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => navigate("/admin/movie/create")}
                                size="large"
                            >
                                Thêm phim mới
                            </Button>
                        </Space>
                    </div>

                    <div className="rounded-lg bg-white p-4 shadow">
                        <Table
                            columns={columns}
                            dataSource={filteredMovies}
                            rowKey="_id"
                            loading={loading}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Tổng ${total} phim`,
                            }}
                            scroll={{ x: 1200 }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
export default ManageMovie;
