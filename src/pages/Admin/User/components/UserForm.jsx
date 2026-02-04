import { Form, Input, Row, Col, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import FormInput from "src/@crema/core/Form/FormInput";
import FormSelect from "src/@crema/core/Form/FormSelect";
import { API_URL } from "@libs/config";

// Image Upload Component
const ImageUpload = ({
    value,
    onChange,
    currentImage,
    folder = "users",
    disabled = false,
}) => {
    const [imageUrl, setImageUrl] = useState(value || currentImage || null);
    const [loading, setLoading] = useState(false);
    const token = Cookies.get("accessToken");

    const handleUpload = async (options) => {
        if (disabled) return;

        const { file, onSuccess, onError } = options;
        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        try {
            const response = await axios.post(
                `${API_URL}/api/upload/${folder}`,
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
                disabled={disabled}
            >
                {displayUrl ? (
                    <img
                        src={`${API_URL}/images/${folder}/${displayUrl}`}
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
        </div>
    );
};

ImageUpload.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    currentImage: PropTypes.string,
    folder: PropTypes.string,
    disabled: PropTypes.bool,
};

const UserForm = ({
    readOnly = false,
    isEditing = false,
    editingUser = null,
}) => {
    return (
        <>
            <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                    <FormInput
                        label="Tên người dùng"
                        name="username"
                        placeholder="Nhập tên người dùng"
                        required={!readOnly}
                        disabled={readOnly}
                    />
                </Col>
                <Col xs={24} md={12}>
                    <FormInput
                        label="Email"
                        name="email"
                        placeholder="Nhập email"
                        required={!readOnly}
                        disabled={readOnly}
                        rules={[
                            {
                                type: "email",
                                message: "Email không hợp lệ!",
                            },
                        ]}
                    />
                </Col>
            </Row>

            {!isEditing && !readOnly && (
                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập mật khẩu!",
                        },
                        {
                            min: 6,
                            message: "Mật khẩu tối thiểu 6 ký tự!",
                        },
                    ]}
                >
                    <Input.Password placeholder="Nhập mật khẩu" />
                </Form.Item>
            )}

            <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                    <Form.Item label="Avatar" name="profilePic">
                        <ImageUpload
                            currentImage={editingUser?.profilePic}
                            folder="users"
                            disabled={readOnly}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <FormSelect
                        label="Quyền"
                        name="isAdmin"
                        placeholder="Chọn quyền"
                        disabled={readOnly}
                        options={[
                            { value: false, label: "Người dùng" },
                            { value: true, label: "Quản trị viên" },
                        ]}
                    />
                </Col>
            </Row>
        </>
    );
};

UserForm.propTypes = {
    readOnly: PropTypes.bool,
    isEditing: PropTypes.bool,
    editingUser: PropTypes.object,
};

export default UserForm;
