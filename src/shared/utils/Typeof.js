export const isEmpty = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") return Object.keys(value).length === 0;
    return false;
};

export const isFunction = (value) => typeof value === "function";

export const isArray = (value) => Array.isArray(value);

export const isObject = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);

export const isString = (value) => typeof value === "string";

export const isNumber = (value) => typeof value === "number" && !isNaN(value);

export const isBoolean = (value) => typeof value === "boolean";

export const isPromise = (value) => {
    return value && typeof value.then === "function";
};
