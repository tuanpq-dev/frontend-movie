import React from "react";
import PropTypes from "prop-types";
import { Table } from "antd";
import { useDataTableContext } from "./DataTableContext";

const DataTableContent = ({ scroll = { x: "max-content" }, rowKey = "id" }) => {
    const {
        tableSize,
        isLoading,
        data,
        pageSize,
        page,
        total,
        columns,
        setPage,
        setPageSize,
        setSort,
    } = useDataTableContext();

    const columnsShow = columns.filter((column) => !column?.hidden);

    const handleChangeTable = (pagination, filters, sorter) => {
        if (pagination?.current !== page) {
            setPage(pagination?.current);
        }
        if (pagination?.pageSize !== pageSize) {
            setPage(1);
            setPageSize(pagination?.pageSize);
        }
        if (sorter?.order) {
            setSort([
                {
                    field: sorter?.field || sorter?.columnKey,
                    desc: sorter?.order === "descend",
                },
            ]);
        } else if (sorter?.order === undefined) {
            setSort([]);
        }
    };

    return (
        <Table
            size={tableSize}
            dataSource={data}
            loading={isLoading}
            columns={columnsShow}
            onChange={handleChangeTable}
            pagination={{
                position: ["bottomRight"],
                pageSize: pageSize,
                total: total,
                current: page,
                showSizeChanger: true,
                showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} mục`,
            }}
            scroll={scroll}
            rowKey={rowKey}
        />
    );
};

DataTableContent.propTypes = {
    scroll: PropTypes.object,
    rowKey: PropTypes.string,
};

export default DataTableContent;
