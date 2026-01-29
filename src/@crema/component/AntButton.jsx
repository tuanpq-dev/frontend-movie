import React from "react";
import { Button } from "antd";

const AntButton = ({ children, ...props }) => {
    return <Button {...props}>{children}</Button>;
};

export default AntButton;
