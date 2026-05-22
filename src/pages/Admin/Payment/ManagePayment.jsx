import DataTableWrapper from "src/@crema/core/DataTable/index";
import {
    Button,
    Space,
    Popconfirm,
    message,
    Tag,
    DatePicker,
    Select,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEye,
    faCheck,
    faTimes,
    faFileExport,
} from "@fortawesome/free-solid-svg-icons";
import { useState, createContext, useContext } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useDataTableContext } from "src/@crema/core/DataTable/DataTableContext";
import { API_URL } from "@libs/config";
import { invalidateCache } from "@libs/requestCache";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

// Create context for modal actions
const PaymentModalContext = createContext({});

// Status Tag Component
const StatusTag = ({ status }) => {
    const statusConfig = {
        success: { color: "green", text: "Thành công" },
        pending: { color: "orange", text: "Đang xử lý" },
        failed: { color: "red", text: "Thất bại" },
        cancelled: { color: "gray", text: "Đã hủy" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Tag color={config.color}>{config.text}</Tag>;
};

// Payment Method Tag
const PaymentMethodTag = ({ method }) => {
    const methodConfig = {
        vnpay: { color: "blue", text: "VNPay" },
        momo: { color: "pink", text: "MoMo" },
        bank_transfer: { color: "cyan", text: "Chuyển khoản" },
        cash: { color: "gold", text: "Tiền mặt" },
    };

    const config = methodConfig[method] || { color: "default", text: method };
    return <Tag color={config.color}>{config.text}</Tag>;
};

// Action Column Component
const ActionColumn = ({ record }) => {
    const { openDetailModal } = useContext(PaymentModalContext);
    const { reloadPage } = useDataTableContext() || {};
    const token = Cookies.get("accessToken");

    const handleUpdateStatus = async (id, newStatus, statusText) => {
        try {
            await axios.patch(
                `${API_URL}/api/payment/${id}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            message.success(`Đã cập nhật trạng thái thành "${statusText}"`);
            invalidateCache("payment");
            reloadPage();
        } catch (error) {
            message.error("Lỗi khi cập nhật trạng thái thanh toán");
            console.error("Error updating payment status:", error);
        }
    };

    return (
        <Space size="small" wrap>
            <Button
                size="small"
                icon={<FontAwesomeIcon icon={faEye} />}
                onClick={() => openDetailModal(record)}
                title="Xem chi tiết"
            />
            {record.status === "pending" && (
                <>
                    <Popconfirm
                        title="Xác nhận thanh toán"
                        description="Xác nhận giao dịch này đã thành công?"
                        onConfirm={() =>
                            handleUpdateStatus(
                                record._id,
                                "success",
                                "Thành công",
                            )
                        }
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <Button
                            size="small"
                            type="primary"
                            icon={<FontAwesomeIcon icon={faCheck} />}
                            title="Xác nhận thành công"
                        />
                    </Popconfirm>
                    <Popconfirm
                        title="Từ chối thanh toán"
                        description="Xác nhận từ chối giao dịch này?"
                        onConfirm={() =>
                            handleUpdateStatus(record._id, "failed", "Thất bại")
                        }
                        okText="Từ chối"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            size="small"
                            danger
                            icon={<FontAwesomeIcon icon={faTimes} />}
                            title="Từ chối"
                        />
                    </Popconfirm>
                </>
            )}
        </Space>
    );
};

// Payment Detail Modal Component
const PaymentDetailModal = ({ visible, payment, onClose }) => {
    console.log({ payment });
    if (!visible || !payment) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            ></div>
            <div className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-bold text-gray-800">
                    Chi tiết thanh toán
                </h2>
                <div className="space-y-3">
                    {/* <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Mã giao dịch:</span>
                        <span className="font-medium">
                            {payment.transactionId || payment._id}
                        </span>
                    </div> */}
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Người dùng:</span>
                        <span className="font-medium">
                            {payment.userId?.username}
                        </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">
                            {payment.userId?.email || "N/A"}
                        </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Gói dịch vụ:</span>
                        <span className="font-medium">
                            {payment.packageName || "Pro"}
                        </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Số tiền:</span>
                        <span className="font-medium text-green-600">
                            {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                            }).format(payment.amount)}
                        </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Phương thức:</span>
                        <PaymentMethodTag method="vnpay" />
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Trạng thái:</span>
                        <StatusTag status={payment.status} />
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Thời gian tạo:</span>
                        <span className="font-medium">
                            {dayjs(payment.createdAt).format(
                                "DD/MM/YYYY HH:mm:ss",
                            )}
                        </span>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button onClick={onClose}>Đóng</Button>
                </div>
            </div>
        </div>
    );
};

// Filter Toolbar Component
const FilterToolbar = ({ dateRange, setDateRange, statusFilter, setStatusFilter, onExport }) => {
    const { setFilter } = useDataTableContext() || {};

    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
        
        if (setFilter) {
            setFilter((prev) => {
                const newFilter = { ...prev };
                if (dates && dates.length === 2) {
                    newFilter.startDate = dates[0].format("YYYY-MM-DD");
                    newFilter.endDate = dates[1].format("YYYY-MM-DD");
                } else {
                    delete newFilter.startDate;
                    delete newFilter.endDate;
                }
                return newFilter;
            });
        }
    };

    const handleStatusChange = (value) => {
        setStatusFilter(value);
        
        if (setFilter) {
            setFilter((prev) => {
                const newFilter = { ...prev };
                if (value) {
                    newFilter.status = value;
                } else {
                    delete newFilter.status;
                }
                return newFilter;
            });
        }
    };

    return (
        <Space wrap className="w-full sm:w-auto">
            <RangePicker
                placeholder={["Từ ngày", "Đến ngày"]}
                onChange={handleDateRangeChange}
                value={dateRange}
                format="DD/MM/YYYY"
                className="w-full sm:w-auto"
            />
            <Select
                placeholder="Trạng thái"
                allowClear
                onChange={handleStatusChange}
                value={statusFilter}
                className="w-full sm:w-32"
                options={[
                    { value: "success", label: "Thành công" },
                    { value: "pending", label: "Đang xử lý" },
                    { value: "failed", label: "Thất bại" },
                    { value: "cancelled", label: "Đã hủy" },
                ]}
            />
            <Button
                icon={<FontAwesomeIcon icon={faFileExport} />}
                onClick={onExport}
                className="w-full sm:w-auto"
            >
                <span className="hidden sm:inline">Xuất Excel</span>
            </Button>
        </Space>
    );
};

const ManagePayment = () => {
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [dateRange, setDateRange] = useState(null);
    const [statusFilter, setStatusFilter] = useState(null);
    const token = Cookies.get("accessToken");

    const openDetailModal = (payment) => {
        setSelectedPayment(payment);
        setDetailModalVisible(true);
    };

    const closeDetailModal = () => {
        setDetailModalVisible(false);
        setSelectedPayment(null);
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
            title: "Mã giao dịch",
            dataIndex: "transactionId",
            key: "transactionId",
            width: 150,
            ellipsis: true,
            render: (text, record) => text || record._id?.slice(-8),
        },
        {
            title: "Người dùng",
            dataIndex: "userId",
            key: "username",
            width: 150,
            render: (record) => {
                return record?.username || "Chưa có tên";
            },
        },
        {
            title: "Email",
            dataIndex: ["userId", "email"],
            key: "email",
            responsive: ["lg"],
            ellipsis: true,
        },
        {
            title: "Số tiền",
            dataIndex: "amount",
            key: "amount",
            width: 130,
            sorter: true,
            render: (amount) =>
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(amount),
        },
        {
            title: "Phương thức",
            dataIndex: "paymentMethod",
            key: "paymentMethod",
            width: 120,
            responsive: ["md"],
            render: () => <PaymentMethodTag method="vnpay" />,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status) => <StatusTag status={status} />,
        },
        {
            title: "Thời gian",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 160,
            sorter: true,
            responsive: ["md"],
            render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
        },
        {
            title: "Hành động",
            key: "action",
            width: 140,
            fixed: "right",
            render: (_, record) => <ActionColumn record={record} />,
        },
    ];

    const handleExport = async () => {
        try {
            const params = {};
            if (dateRange) {
                params.startDate = dateRange[0].format("YYYY-MM-DD");
                params.endDate = dateRange[1].format("YYYY-MM-DD");
            }
            if (statusFilter) {
                params.status = statusFilter;
            }

            const response = await axios.get(`${API_URL}/api/payment/export`, {
                params,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `payments_${dayjs().format("YYYYMMDD")}.xlsx`,
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            message.success("Xuất file thành công!");
        } catch (error) {
            message.error("Lỗi khi xuất file");
            console.error("Export error:", error);
        }
    };

    const toolbars = [
        <FilterToolbar
            key="filters"
            dateRange={dateRange}
            setDateRange={setDateRange}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onExport={handleExport}
        />,
    ];

    return (
        <PaymentModalContext.Provider value={{ openDetailModal }}>
            <div className="mb-4 md:mb-6">
                <h1 className="mb-2 text-xl font-bold text-gray-800 sm:text-2xl md:mb-4 md:text-3xl">
                    Quản lý thanh toán
                </h1>
            </div>
            <div className="overflow-x-auto rounded-lg bg-white p-2 shadow sm:p-3 md:p-4">
                <DataTableWrapper
                    url={`${API_URL}/api/payment`}
                    method="POST"
                    columns={columns}
                    toolbars={toolbars}
                    rowKey="_id"
                    scroll={{ x: 900 }}
                    tableProps={{
                        size: "small",
                    }}
                    showColumnIndex={false}
                />
            </div>

            <PaymentDetailModal
                visible={detailModalVisible}
                payment={selectedPayment}
                onClose={closeDetailModal}
            />
        </PaymentModalContext.Provider>
    );
};

export default ManagePayment;
