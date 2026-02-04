import { FormattedMessage, injectIntl, useIntl } from "react-intl";
import { truncate } from "lodash";
import { Tooltip } from "antd";

const InjectMassage = ({ id, maxLength, placement, ...attrs }) => {
    const { messages } = useIntl();
    if (maxLength) {
        const labelShow = messages?.[id] || id;
        const labelTruncate = truncate(labelShow, { length: maxLength });
        if (labelShow === labelTruncate) {
            return <FormattedMessage {...attrs} id={id} />;
        } else {
            return (
                <Tooltip title={labelShow} placement={placement}>
                    <span {...attrs}>{labelTruncate}</span>
                </Tooltip>
            );
        }
    }
    return <FormattedMessage {...attrs} id={id} />;
};
export default injectIntl(InjectMassage, {
    forwardRef: false,
});
