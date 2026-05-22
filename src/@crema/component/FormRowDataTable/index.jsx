import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, Form, Button, message } from "antd";
import { useDataTableContext } from "src/@crema/core/DataTable/DataTableContext";
import axios from "axios";
import Cookies from "js-cookie";
import { invalidateCache } from "@libs/requestCache";

const FORM_CONFIG = {
    create: {
        title: "Thêm mới",
        buttonText: "Lưu",
        successMessage: "Thêm mới thành công!",
    },
    edit: {
        title: "Chỉnh sửa",
        buttonText: "Cập nhật",
        successMessage: "Cập nhật thành công!",
    },
    view: {
        title: "Xem chi tiết",
        buttonText: null,
    },
};

const invalidateResourceCache = (resource = "") => {
    if (resource.includes("/api/movies")) invalidateCache("movies");
    if (resource.includes("/api/genres")) invalidateCache("genres");
    if (resource.includes("/api/users")) invalidateCache("users");
    if (resource.includes("/api/comments")) invalidateCache("comments");
    if (resource.includes("/api/payment")) invalidateCache("payment");
    if (resource.includes("/api/favoriteMovies")) invalidateCache("favorite");
};

const FormRowDataTable = ({
    title,
    buttonText,
    formType = "create",
    visible,
    onClose,
    children,
    resource,
    initialValues = {},
    method = "POST",
    onSuccess,
    onReload,
    readOnly = false,
    preSaveData,
    width = 600,
    useFormData = false,
    customSubmit,
    ...restProps
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const contextValue = useDataTableContext();
    const reloadPage = onReload || contextValue?.reloadPage;

    const config = FORM_CONFIG[formType] || FORM_CONFIG.create;

    // Reset form when component mounts (when modal opens)
    useEffect(() => {
        form.setFieldsValue(initialValues);
        return () => {
            form.resetFields();
        };
    }, [form, initialValues]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            let dataToSave = { ...initialValues, ...values };

            if (preSaveData) {
                dataToSave = preSaveData(dataToSave);
                if (!dataToSave) return;
            }

            setLoading(true);

            const token = Cookies.get("accessToken");

            // Use custom submit if provided
            if (customSubmit) {
                await customSubmit(dataToSave, { method, resource, token });
            } else {
                const headers = token
                    ? { Authorization: `Bearer ${token}` }
                    : {};

                // Handle FormData for file uploads
                if (useFormData && dataToSave instanceof FormData) {
                    headers["Content-Type"] = "multipart/form-data";
                }

                if (method === "PUT") {
                    await axios.put(resource, dataToSave, { headers });
                } else {
                    await axios.post(resource, dataToSave, { headers });
                }
            }

            message.success(config.successMessage);
            invalidateResourceCache(resource);

            if (reloadPage) {
                reloadPage();
            }

            if (onSuccess) {
                onSuccess(dataToSave);
            }

            onClose();
        } catch (error) {
            console.error("Form submit error:", error);
            if (error?.errorFields) {
                // Validation error
                return;
            }
            message.error(
                error?.response?.data?.message ||
                    error?.message ||
                    "Có lỗi xảy ra!",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    // Don't render anything if not visible - ensures complete unmount
    if (!visible) {
        return null;
    }

    return (
        <Modal
            title={title || config.title}
            open={visible}
            onCancel={handleClose}
            width={width}
            centered
            destroyOnClose
            footer={
                <>
                    <Button onClick={handleClose}>
                        {readOnly ? "Đóng" : "Hủy"}
                    </Button>
                    {!readOnly && (buttonText || config.buttonText) && (
                        <Button
                            type="primary"
                            loading={loading}
                            onClick={handleSubmit}
                        >
                            {buttonText || config.buttonText}
                        </Button>
                    )}
                </>
            }
            {...restProps}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
                disabled={readOnly}
            >
                {children}
            </Form>
        </Modal>
    );
};

FormRowDataTable.propTypes = {
    title: PropTypes.string,
    buttonText: PropTypes.string,
    formType: PropTypes.oneOf(["create", "edit", "view"]),
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    resource: PropTypes.string,
    initialValues: PropTypes.object,
    method: PropTypes.string,
    onSuccess: PropTypes.func,
    onReload: PropTypes.func,
    readOnly: PropTypes.bool,
    preSaveData: PropTypes.func,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    useFormData: PropTypes.bool,
    customSubmit: PropTypes.func,
};

export default FormRowDataTable;
