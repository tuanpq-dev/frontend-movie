import React, { forwardRef } from "react";
import { Form } from "antd";

const FormContent = forwardRef(({ children, ...props }, ref) => {
    return (
        <Form ref={ref} {...props}>
            {children}
        </Form>
    );
});

FormContent.displayName = "FormContent";

export default FormContent;
