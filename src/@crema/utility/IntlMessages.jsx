import React from "react";

const IntlMessages = ({ id, values }) => {
    // Simple fallback - just return the id for now
    // In a real app, this would use react-intl or similar
    if (values) {
        let message = id;
        Object.keys(values).forEach((key) => {
            message = message.replace(`{${key}}`, values[key]);
        });
        return <span>{message}</span>;
    }
    return <span>{id}</span>;
};

export default IntlMessages;
