import { Form } from "antd";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";
import AntInput from "src/@crema/component/AntInput";
import { injectRules } from "src/validate";
import { isEmpty } from "src/shared/utils/Typeof";

const FormInput = (props) => {
    const {
        required,
        name,
        label,
        labelHidden,
        placeholder,
        rules,
        layout = {},
        ...attrs
    } = props;

    const { messages, formatMessage } = useIntl();
    const labelShow = messages[label] || label || "";
    const labelHiddenShow = messages[labelHidden] || labelHidden;
    const placeholderShow =
        messages[placeholder] ||
        placeholder ||
        (messages["input.placeholder.input"] || "") + labelShow.toLowerCase();
    return (
        <Form.Item
            name={name}
            label={labelShow}
            labelCol={isEmpty(labelShow) ? { span: 0 } : undefined}
            wrapperCol={isEmpty(labelShow) ? { span: 24 } : undefined}
            rules={injectRules({
                required,
                labelShow,
                labelHidden: labelHiddenShow,
                rules,
                formatMessage,
            })}
            {...layout}
        >
            <AntInput
                placeholder={placeholderShow}
                style={{ width: "100%" }}
                {...attrs}
            />
        </Form.Item>
    );
};

FormInput.propTypes = {
    required: PropTypes.bool,
    name: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    label: PropTypes.any,
    placeholder: PropTypes.string,
    layout: PropTypes.object,
    rules: PropTypes.object,
};

FormInput.defaultProps = {};

export default FormInput;
