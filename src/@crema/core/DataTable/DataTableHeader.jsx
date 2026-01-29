import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Space, Input, Button, Dropdown } from "antd";
import {
    ReloadOutlined,
    ColumnHeightOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import { useDataTableContext } from "./DataTableContext";

const DataTableHeader = ({ isShowSearch = true, toolbars = [] }) => {
    const {
        isLoading,
        tableSize,
        search: searchDT,
        setSearch: setSearchDT,
        setTableSize,
        reloadPage,
    } = useDataTableContext();

    const [search, setSearch] = useState(searchDT || "");

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== searchDT) {
                setSearchDT(search);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search, searchDT, setSearchDT]);

    const sizeItems = [
        { key: "small", label: "Nhỏ" },
        { key: "middle", label: "Trung bình" },
        { key: "large", label: "Lớn" },
    ];

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
            }}
        >
            <div>
                {isShowSearch && (
                    <Input
                        placeholder="Tìm kiếm..."
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: 250 }}
                        allowClear
                    />
                )}
            </div>
            <Space>
                {toolbars}
                <Button
                    icon={<ReloadOutlined />}
                    loading={isLoading}
                    onClick={reloadPage}
                    title="Tải lại"
                />
                <Dropdown
                    menu={{
                        selectedKeys: [tableSize],
                        items: sizeItems,
                        onClick: (e) => setTableSize(e.key),
                    }}
                    trigger={["click"]}
                >
                    <Button
                        icon={<ColumnHeightOutlined />}
                        title="Kích thước"
                    />
                </Dropdown>
            </Space>
        </div>
    );
};

DataTableHeader.propTypes = {
    isShowSearch: PropTypes.bool,
    toolbars: PropTypes.array,
};

export default DataTableHeader;
