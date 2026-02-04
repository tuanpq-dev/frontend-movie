import IntlMessages from "src/@crema/utility/IntlMessages";
import { validator, buildTargetValue } from "src/validate/plugins";
import { isArray, isEmpty, isObject } from "src/shared/utils/Typeof";

export const handleValidator = ({
    formValue,
    formItem,
    valueItem,
    rules,
    formatMessage,
}) => {
    if (
        valueItem === undefined ||
        valueItem === null ||
        valueItem === "" ||
        (isArray(valueItem) && valueItem?.length === 0) ||
        (isObject(valueItem) && Object.keys(valueItem).length === 0) ||
        isEmpty(rules)
    ) {
        return Promise.resolve();
    }

    const validates = Object.keys(rules)
        .map((ruleName) => validator[ruleName])
        .filter((validate) => !!validate);

    const ruleWrong = validates.find(({ name, validate }) => {
        return !validate({
            fieldValue: valueItem,
            formItem,
            formValue,
            ruleParams: rules[name],
        });
    });

    if (ruleWrong) {
        const target = buildTargetValue({
            formValue,
            formItemInput: formItem,
            valueInput: valueItem,
            paramPlugin: ruleWrong?.params || [],
            ruleParamInput: rules[ruleWrong?.name],
            defaultValueParams: ruleWrong.defaultValueParams,
        });

        return Promise.reject(
            new Error(formatMessage({ id: ruleWrong.messageId }, target)),
        );
    }
    return Promise.resolve();
};

export const injectRules = ({
    required,
    labelShow,
    labelHidden,
    rules,
    formatMessage,
}) => {
    return [
        {
            required,
            message: (
                <IntlMessages
                    id="form_validate.require"
                    values={{ _field_: labelHidden || labelShow }}
                />
            ),
        },
        ({ getFieldsValue }) => ({
            validator(formItem, value) {
                const formValue = getFieldsValue();
                const rulesApply = rules || {};

                if (typeof rulesApply.validator === "function") {
                    return rulesApply.validator(formItem, value, formValue);
                }

                if (required && !rulesApply.notEmpty) {
                    rulesApply.notEmpty = [];
                }
                return handleValidator({
                    formValue,
                    formItem: {
                        ...formItem,
                        label: labelHidden || labelShow,
                    },
                    valueItem: value,
                    rules: rulesApply,
                    formatMessage,
                });
            },
        }),
    ];
};
