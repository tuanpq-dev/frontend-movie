export const getMessageResponse = (response) => {
    if (!response) return "An error occurred";

    if (response.message) return response.message;
    if (response.error) return response.error;
    if (response.data?.message) return response.data.message;

    return "Operation completed";
};

export const getErrorsResponse = (raw, messages) => {
    if (!raw) return [];

    if (raw.errors) {
        return Object.keys(raw.errors).map((key) => ({
            name: key,
            errors: raw.errors[key],
        }));
    }

    return [];
};
