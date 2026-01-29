export const convertObjectMapper = ({ errors, fieldMapper }) => {
    if (!errors || !Array.isArray(errors)) return [];

    return errors.map((error) => {
        const mappedName = fieldMapper?.[error.name] || error.name;
        return {
            name: mappedName,
            errors: Array.isArray(error.errors) ? error.errors : [error.errors],
        };
    });
};
