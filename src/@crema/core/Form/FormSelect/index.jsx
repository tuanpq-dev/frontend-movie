import { Form, Select } from "antd";
import PropTypes from "prop-types";

const FormSelect = (props) => {
    const {
        required,
        name,
        label,
        placeholder,
        rules = [],
        options = [],
        mode,
        layout = {},
        ...attrs
    } = props;

    const finalRules = required
        ? [
              {
                  required: true,
                  message: `Vui lòng chọn ${label?.toLowerCase() || ""}!`,
              },
              ...rules,
          ]
        : rules;

    return (
        <Form.Item name={name} label={label} rules={finalRules} {...layout}>
            <Select
                placeholder={
                    placeholder || `Chọn ${label?.toLowerCase() || ""}`
                }
                mode={mode}
                style={{ width: "100%" }}
                options={options}
                {...attrs}
            />
        </Form.Item>
    );
};

FormSelect.propTypes = {
    required: PropTypes.bool,
    name: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    label: PropTypes.string,
    placeholder: PropTypes.string,
    options: PropTypes.array,
    mode: PropTypes.string,
    layout: PropTypes.object,
    rules: PropTypes.array,
};

export default FormSelect;
