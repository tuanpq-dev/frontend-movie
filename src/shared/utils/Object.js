export const handleRedundantData = (data) => {
    if (!data || typeof data !== "object") return data;

    const cleaned = { ...data };

    // Remove undefined and null values
    Object.keys(cleaned).forEach((key) => {
        if (cleaned[key] === undefined || cleaned[key] === null) {
            delete cleaned[key];
        }
    });

    return cleaned;
};

export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};
