import dayjs from "dayjs";

export const toSQLDate = (date) => {
    if (!date) return null;

    if (dayjs.isDayjs(date)) {
        return date.format("YYYY-MM-DD");
    }

    if (date instanceof Date) {
        return dayjs(date).format("YYYY-MM-DD");
    }

    if (typeof date === "string") {
        return dayjs(date).format("YYYY-MM-DD");
    }

    return null;
};

export const toSQLDateTime = (date) => {
    if (!date) return null;

    if (dayjs.isDayjs(date)) {
        return date.format("YYYY-MM-DD HH:mm:ss");
    }

    if (date instanceof Date) {
        return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
    }

    if (typeof date === "string") {
        return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
    }

    return null;
};
