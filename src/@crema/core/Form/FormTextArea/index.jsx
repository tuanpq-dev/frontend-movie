import { Form, Input } from "antd";
import PropTypes from "prop-types";

const { TextArea } = Input;

const FormTextArea = (props) => {
    const {
        required,
        name,
        label,
        placeholder,
        rules = [],
        rows = 4,
        layout = {},
        ...attrs
    } = props;

    const finalRules = required
        ? [
              {
                  required: true,
                  message: `Vui lòng nhập ${label?.toLowerCase() || ""}!`,
              },
              ...rules,
          ]
        : rules;

    return (
        <Form.Item name={name} label={label} rules={finalRules} {...layout}>
            <TextArea
                placeholder={
                    placeholder || `Nhập ${label?.toLowerCase() || ""}`
                }
                rows={rows}
                style={{ width: "100%" }}
                {...attrs}
            />
        </Form.Item>
    );
};

FormTextArea.propTypes = {
    required: PropTypes.bool,
    name: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    label: PropTypes.string,
    placeholder: PropTypes.string,
    rows: PropTypes.number,
    layout: PropTypes.object,
    rules: PropTypes.array,
};

export default FormTextArea;
