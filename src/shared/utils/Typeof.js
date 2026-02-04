export function isEmpty(value) {
    if (isString(value)) {
        if (value?.includes("&nbsp;")) {
            return (
                value
                    .replace(/<\/?p>/g, "")
                    .replace(/&nbsp;/g, "")
                    .trim() === ""
            );
        }
        return (
            value === "" ||
            value === undefined ||
            value === null ||
            value.trim() === ""
        );
    } else if (isObject(value)) {
        return (
            value === null ||
            Object.keys(value).length === 0 ||
            isNullUndefEmptyStrObj(value)
        );
    } else if (isArray(value)) {
        return value === null || value.length === 0;
    }
    return value === undefined || value === null;
}

export const isFunction = (value) => typeof value === "function";

export function isArray(value) {
    return value && typeof value === "object" && value.constructor === Array;
}

export function isObject(value) {
    return value && typeof value === "object" && value.constructor === Object;
}

export const isString = (value) => typeof value === "string";

export const isNumber = (value) => typeof value === "number" && !isNaN(value);

export const isBoolean = (value) => typeof value === "boolean";

export const isPromise = (value) => {
    return value && typeof value.then === "function";
};

export const isNullUndefEmptyStrObj = (obj = {}) => {
    if (!obj) return true;
    return Object.values(obj).every((value) => {
        return value === "" || value === null || value === undefined;
    });
};
