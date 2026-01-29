import { notification as antdNotification } from "antd";

const notification = {
    success: (config) => {
        antdNotification.success({
            message: config.message || "Success",
            description: config.description,
            ...config,
        });
    },
    error: (config) => {
        antdNotification.error({
            message: config.message || "Error",
            description: config.description,
            ...config,
        });
    },
    warning: (config) => {
        antdNotification.warning({
            message: config.message || "Warning",
            description: config.description,
            ...config,
        });
    },
    info: (config) => {
        antdNotification.info({
            message: config.message || "Info",
            description: config.description,
            ...config,
        });
    },
};

export default notification;
