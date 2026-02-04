import { Form, InputNumber } from "antd";
import PropTypes from "prop-types";

const FormInputNumber = (props) => {
    const {
        required,
        name,
        label,
        placeholder,
        rules = [],
        min,
        max,
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
            <InputNumber
                placeholder={
                    placeholder || `Nhập ${label?.toLowerCase() || ""}`
                }
                min={min}
                max={max}
                style={{ width: "100%" }}
                {...attrs}
            />
        </Form.Item>
    );
};

FormInputNumber.propTypes = {
    required: PropTypes.bool,
    name: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    label: PropTypes.string,
    placeholder: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
    layout: PropTypes.object,
    rules: PropTypes.array,
};

export default FormInputNumber;
