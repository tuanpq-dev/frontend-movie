import React, { forwardRef } from "react";

const PrintImage = forwardRef(({ img_src }, ref) => {
    return (
        <div ref={ref} style={{ padding: "20px" }}>
            <img src={img_src} alt="Print" style={{ maxWidth: "100%" }} />
        </div>
    );
});

PrintImage.displayName = "PrintImage";

export default PrintImage;
