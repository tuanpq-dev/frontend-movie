import { Form, Input, Row, Col } from "antd";
import PropTypes from "prop-types";
import FormInput from "src/@crema/core/Form/FormInput";
import FormSelect from "src/@crema/core/Form/FormSelect";

// Simple Image Upload with preview
const ImageUpload = ({ label, id, preview, onChange }) => (
    <div className="mb-4">
        <label className="mb-1 block font-bold">{label}</label>
        <input
            type="file"
            id={id}
            accept="image/*"
            hidden
            onChange={onChange}
        />
        <label htmlFor={id} className="cursor-pointer">
            <img
                src={preview}
                alt={`${label} preview`}
                className="h-32 w-32 rounded-full border border-gray-300 object-cover transition-colors hover:border-blue-500"
            />
        </label>
    </div>
);

ImageUpload.propTypes = {
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    preview: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

const UserForm = ({
    readOnly = false,
    isEditing = false,
    avatarPreview,
    onChangeAvatar,
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
                    {!readOnly && avatarPreview && onChangeAvatar && (
                        <ImageUpload
                            label="Chọn Avatar"
                            id="avatar-img-modal"
                            preview={avatarPreview}
                            onChange={onChangeAvatar}
                        />
                    )}
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
    avatarPreview: PropTypes.string,
    onChangeAvatar: PropTypes.func,
};

export default UserForm;
