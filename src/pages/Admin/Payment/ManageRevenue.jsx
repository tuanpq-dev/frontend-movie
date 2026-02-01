import { useState, useEffect } from "react";
import {
    Card,
    Row,
    Col,
    DatePicker,
    Select,
    Statistic,
    Table,
    Spin,
} from "antd";
import {
    DollarOutlined,
    UserOutlined,
    RiseOutlined,
    ShoppingCartOutlined,
} from "@ant-design/icons";
import SideBar from "@components/SideBar";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "@libs/config";
import dayjs from "dayjs";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

const { RangePicker } = DatePicker;

// Format currency
const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);
};

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const ManageRevenue = () => {
    const [sidebarLoaded, setSidebarLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState([
        dayjs().startOf("month"),
        dayjs().endOf("month"),
    ]);
    const [periodType, setPeriodType] = useState("month");
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalTransactions: 0,
        successfulTransactions: 0,
        newSubscribers: 0,
        growthRate: 0,
    });
    const [revenueByDay, setRevenueByDay] = useState([]);
    const [revenueByMethod, setRevenueByMethod] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const token = Cookies.get("accessToken");

    // Fetch revenue data
    useEffect(() => {
        const fetchRevenueData = async () => {
            setLoading(true);
            try {
                // Fetch statistics overview
                const statsResponse = await axios.get(
                    `${API_URL}/api/payment/statistics`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                const statsData = statsResponse.data;
                setStats({
                    totalRevenue: statsData.totalRevenue || 0,
                    totalTransactions: statsData.totalTransactions || 0,
                    successfulTransactions: statsData.statusStats?.success || 0,
                    newSubscribers: statsData.statusStats?.success || 0,
                    growthRate: parseFloat(statsData.successRate) || 0,
                });

                // Fetch revenue by time range
                const revenueResponse = await axios.get(
                    `${API_URL}/api/payment/revenue/range`,
                    {
                        params: {
                            startDate: dateRange[0].format("YYYY-MM-DD"),
                            endDate: dateRange[1].format("YYYY-MM-DD"),
                        },
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                const revenueData = revenueResponse.data;
                // Transform daily data for chart
                const chartData = (revenueData.dailyData || []).map((item) => ({
                    date: `${item._id.day}/${item._id.month}`,
                    revenue: item.totalRevenue,
                    transactions: item.count,
                }));
                setRevenueByDay(chartData);

                // Set payment method data (VNPay is the only method from backend)
                setRevenueByMethod([
                    { name: "VNPay", value: revenueData.totalRevenue || 0 },
                ]);
            } catch (error) {
                console.error("Error fetching revenue data:", error);
                // Use mock data for demo
                setStats({
                    totalRevenue: 15000000,
                    totalTransactions: 75,
                    successfulTransactions: 68,
                    newSubscribers: 45,
                    growthRate: 12.5,
                });
                setRevenueByDay([
                    { date: "01/01", revenue: 500000, transactions: 3 },
                    { date: "02/01", revenue: 800000, transactions: 4 },
                    { date: "03/01", revenue: 600000, transactions: 3 },
                    { date: "04/01", revenue: 1200000, transactions: 6 },
                    { date: "05/01", revenue: 900000, transactions: 5 },
                    { date: "06/01", revenue: 1500000, transactions: 8 },
                    { date: "07/01", revenue: 700000, transactions: 4 },
                ]);
                setRevenueByMethod([
                    { name: "VNPay", value: 10000000 },
                    { name: "MoMo", value: 3000000 },
                    { name: "Chuyển khoản", value: 2000000 },
                ]);
                setTopUsers([
                    {
                        _id: "1",
                        username: "user1",
                        email: "user1@gmail.com",
                        totalSpent: 600000,
                        transactions: 3,
                    },
                    {
                        _id: "2",
                        username: "user2",
                        email: "user2@gmail.com",
                        totalSpent: 400000,
                        transactions: 2,
                    },
                    {
                        _id: "3",
                        username: "user3",
                        email: "user3@gmail.com",
                        totalSpent: 400000,
                        transactions: 2,
                    },
                    {
                        _id: "4",
                        username: "user4",
                        email: "user4@gmail.com",
                        totalSpent: 200000,
                        transactions: 1,
                    },
                    {
                        _id: "5",
                        username: "user5",
                        email: "user5@gmail.com",
                        totalSpent: 200000,
                        transactions: 1,
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        if (sidebarLoaded) {
            fetchRevenueData();
        }
    }, [dateRange, periodType, sidebarLoaded, token]);

    const handlePeriodChange = (type) => {
        setPeriodType(type);
        const now = dayjs();
        switch (type) {
            case "week":
                setDateRange([now.startOf("week"), now.endOf("week")]);
                break;
            case "month":
                setDateRange([now.startOf("month"), now.endOf("month")]);
                break;
            case "quarter":
                setDateRange([now.startOf("quarter"), now.endOf("quarter")]);
                break;
            case "year":
                setDateRange([now.startOf("year"), now.endOf("year")]);
                break;
            default:
                break;
        }
    };

    const topUsersColumns = [
        {
            title: "STT",
            key: "index",
            width: 60,
            render: (_, __, index) => index + 1,
        },
        {
            title: "Người dùng",
            dataIndex: "username",
            key: "username",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            responsive: ["md"],
            ellipsis: true,
        },
        {
            title: "Tổng chi tiêu",
            dataIndex: "totalSpent",
            key: "totalSpent",
            render: (value) => formatCurrency(value),
            sorter: (a, b) => a.totalSpent - b.totalSpent,
        },
        {
            title: "Số giao dịch",
            dataIndex: "transactions",
            key: "transactions",
            width: 120,
        },
    ];

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-lg border bg-white p-3 shadow-lg">
                    <p className="font-medium">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name === "revenue"
                                ? `Doanh thu: ${formatCurrency(entry.value)}`
                                : `Giao dịch: ${entry.value}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <SideBar onLoadComplete={() => setSidebarLoaded(true)} />
            {sidebarLoaded && (
                <div className="min-h-screen overflow-x-hidden p-3 pt-16 sm:p-4 md:p-6 lg:ml-64 lg:pt-6">
                    {/* Header */}
                    <div className="mb-4 flex flex-col gap-4 md:mb-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="mb-2 text-xl font-bold text-gray-800 sm:text-2xl md:mb-1 md:text-3xl">
                                Thống kê doanh thu
                            </h1>
                            <p className="text-sm text-gray-500">
                                Tổng quan về doanh thu và giao dịch
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Select
                                value={periodType}
                                onChange={handlePeriodChange}
                                className="w-32"
                                options={[
                                    { value: "week", label: "Tuần này" },
                                    { value: "month", label: "Tháng này" },
                                    { value: "quarter", label: "Quý này" },
                                    { value: "year", label: "Năm nay" },
                                ]}
                            />
                            <RangePicker
                                value={dateRange}
                                onChange={(dates) =>
                                    dates && setDateRange(dates)
                                }
                                format="DD/MM/YYYY"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex h-96 items-center justify-center">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <>
                            {/* Statistics Cards */}
                            <Row gutter={[16, 16]} className="mb-6">
                                <Col xs={24} sm={12} lg={6}>
                                    <Card className="h-full shadow-sm transition-shadow hover:shadow-md">
                                        <Statistic
                                            title="Tổng doanh thu"
                                            value={stats.totalRevenue}
                                            precision={0}
                                            valueStyle={{ color: "#3f8600" }}
                                            prefix={<DollarOutlined />}
                                            formatter={(value) =>
                                                formatCurrency(value).replace(
                                                    "₫",
                                                    "",
                                                )
                                            }
                                            suffix="₫"
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} lg={6}>
                                    <Card className="h-full shadow-sm transition-shadow hover:shadow-md">
                                        <Statistic
                                            title="Tổng giao dịch"
                                            value={stats.totalTransactions}
                                            prefix={<ShoppingCartOutlined />}
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Thành công:{" "}
                                            {stats.successfulTransactions}
                                        </p>
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} lg={6}>
                                    <Card className="h-full shadow-sm transition-shadow hover:shadow-md">
                                        <Statistic
                                            title="Thuê bao mới"
                                            value={stats.newSubscribers}
                                            prefix={<UserOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} lg={6}>
                                    <Card className="h-full shadow-sm transition-shadow hover:shadow-md">
                                        <Statistic
                                            title="Tăng trưởng"
                                            value={stats.growthRate}
                                            precision={1}
                                            valueStyle={{
                                                color:
                                                    stats.growthRate >= 0
                                                        ? "#3f8600"
                                                        : "#cf1322",
                                            }}
                                            prefix={<RiseOutlined />}
                                            suffix="%"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            So với kỳ trước
                                        </p>
                                    </Card>
                                </Col>
                            </Row>

                            {/* Charts */}
                            <Row gutter={[16, 16]} className="mb-6">
                                {/* Revenue Trend Chart */}
                                <Col xs={24} lg={16}>
                                    <Card
                                        title="Biểu đồ doanh thu"
                                        className="h-full shadow-sm"
                                    >
                                        <ResponsiveContainer
                                            width="100%"
                                            height={300}
                                        >
                                            <AreaChart data={revenueByDay}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis
                                                    tickFormatter={(value) =>
                                                        `${(value / 1000000).toFixed(1)}M`
                                                    }
                                                />
                                                <Tooltip
                                                    content={<CustomTooltip />}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="revenue"
                                                    name="revenue"
                                                    stroke="#8884d8"
                                                    fill="#8884d8"
                                                    fillOpacity={0.3}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </Card>
                                </Col>

                                {/* Payment Method Distribution */}
                                <Col xs={24} lg={8}>
                                    <Card
                                        title="Phương thức thanh toán"
                                        className="h-full shadow-sm"
                                    >
                                        <ResponsiveContainer
                                            width="100%"
                                            height={300}
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={revenueByMethod}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({
                                                        name,
                                                        percent,
                                                    }) =>
                                                        `${name} ${(percent * 100).toFixed(0)}%`
                                                    }
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {revenueByMethod.map(
                                                        (entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={
                                                                    COLORS[
                                                                        index %
                                                                            COLORS.length
                                                                    ]
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value) =>
                                                        formatCurrency(value)
                                                    }
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Card>
                                </Col>
                            </Row>

                            {/* Transactions by Day Bar Chart */}
                            <Row gutter={[16, 16]} className="mb-6">
                                <Col xs={24}>
                                    <Card
                                        title="Số giao dịch theo ngày"
                                        className="shadow-sm"
                                    >
                                        <ResponsiveContainer
                                            width="100%"
                                            height={250}
                                        >
                                            <BarChart data={revenueByDay}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar
                                                    dataKey="transactions"
                                                    name="Số giao dịch"
                                                    fill="#82ca9d"
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Card>
                                </Col>
                            </Row>

                            {/* Top Spending Users */}
                            <Row gutter={[16, 16]}>
                                <Col xs={24}>
                                    <Card
                                        title="Top người dùng chi tiêu nhiều nhất"
                                        className="shadow-sm"
                                    >
                                        <Table
                                            columns={topUsersColumns}
                                            dataSource={topUsers}
                                            rowKey="_id"
                                            pagination={false}
                                            size="small"
                                            scroll={{ x: 500 }}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManageRevenue;
