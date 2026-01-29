import React from "react";
import { Modal } from "antd";

const AntModal = ({ children, ...props }) => {
    return <Modal {...props}>{children}</Modal>;
};

export default AntModal;
