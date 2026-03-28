import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import { Card, Space } from "antd";
import DataTableContext from "./DataTableContext";
import DataTableContent from "./DataTableContent";
import DataTableFilter from "./DataTableFilter";
import DataTableHeader from "./DataTableHeader";
import styles from "./index.module.scss";

const DataTable = ({
    isShowHeaderTable = true,
    isShowSearch = true,
    toolbars = [],
    filters,
    children,
    rowKey = "id",
    scroll,
}) => {
    const hasFilters = filters && filters.length > 0;

    return (
        <div className={styles.dataTableWrapper}>
            {hasFilters && (
                <Card bordered={false} style={{ marginBottom: 16 }}>
                    <DataTableFilter filters={filters} />
                </Card>
            )}
            <Card bordered={false}>
                {isShowHeaderTable && (
                    <Space
                        direction="vertical"
                        size={12}
                        style={{ width: "100%" }}
                    >
                        <DataTableHeader
                            isShowSearch={isShowSearch}
                            toolbars={toolbars}
                        />
                    </Space>
                )}
                <DataTableContent scroll={scroll} rowKey={rowKey} />
            </Card>
            {children}
        </div>
    );
};

DataTable.propTypes = {
    isShowHeaderTable: PropTypes.bool,
    isShowSearch: PropTypes.bool,
    filters: PropTypes.array,
    toolbars: PropTypes.array,
    children: PropTypes.node,
    rowKey: PropTypes.string,
    scroll: PropTypes.object,
};

const DataTableWrapper = forwardRef(
    (
        {
            url,
            columns,
            initTable = {},
            method = "GET",
            showColumnIndex = true,
            event = {},
            disableParams = false,
            ...props
        },
        ref,
    ) => {
        return (
            <DataTableContext
                ref={ref}
                url={url}
                columns={columns}
                showColumnIndex={showColumnIndex}
                initTable={initTable}
                method={method}
                event={event}
                disableParams={disableParams}
            >
                <DataTable {...props} />
            </DataTableContext>
        );
    },
);

DataTableWrapper.displayName = "DataTableWrapper";

DataTableWrapper.propTypes = {
    url: PropTypes.string,
    columns: PropTypes.arrayOf(PropTypes.object).isRequired,
    event: PropTypes.object,
    initTable: PropTypes.object,
    isShowSearch: PropTypes.bool,
    showColumnIndex: PropTypes.bool,
    method: PropTypes.string,
    children: PropTypes.node,
    disableParams: PropTypes.bool,
};

DataTableWrapper.defaultProps = {
    isShowSearch: true,
    isShowHeaderTable: true,
    event: {},
};

export default DataTableWrapper;
export { useDataTableContext } from "./DataTableContext";
export { FILTER_TYPE } from "./DataTableFilter";
