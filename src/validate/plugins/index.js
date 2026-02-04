export const validator = {};

export const buildTargetValue = ({
    formValue,
    defaultValueParams = [],
    formItemInput,
    valueInput,
    paramPlugin,
    ruleParamInput = [],
}) => {
    const ruleParamsValue = ruleParamInput.map((param) => {
        if (param?.field) {
            return formValue[param?.field];
        }
        return param?.value;
    });

    let target = {};
    paramPlugin.forEach((param, index) => {
        target[param] = ruleParamsValue[index] || defaultValueParams[index];
    });

    return {
        ...target,
        _field_: formItemInput?.label,
        _value_: valueInput,
    };
};
