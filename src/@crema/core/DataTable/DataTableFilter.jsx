import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Col, Form, Row, Space, Input, Select, DatePicker } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { useDataTableContext } from "./DataTableContext";

const { RangePicker } = DatePicker;

const FILTER_TYPE = {
    TEXT: "text",
    SELECT: "select",
    DATE: "date",
    RANGE_DATE: "range_date",
    NUMBER: "number",
};

const FilterItem = ({ type, name, label, options = [], ...attrs }) => {
    switch (type) {
        case FILTER_TYPE.SELECT:
            return (
                <Form.Item name={name} label={label}>
                    <Select
                        allowClear
                        placeholder={`Chọn ${label}`}
                        options={options}
                        {...attrs}
                    />
                </Form.Item>
            );
        case FILTER_TYPE.DATE:
        case FILTER_TYPE.RANGE_DATE:
            return (
                <Form.Item name={name} label={label}>
                    <RangePicker style={{ width: "100%" }} {...attrs} />
                </Form.Item>
            );
        case FILTER_TYPE.NUMBER:
            return (
                <Form.Item name={name} label={label}>
                    <Input
                        type="number"
                        placeholder={`Nhập ${label}`}
                        {...attrs}
                    />
                </Form.Item>
            );
        case FILTER_TYPE.TEXT:
        default:
            return (
                <Form.Item name={name} label={label}>
                    <Input placeholder={`Nhập ${label}`} {...attrs} />
                </Form.Item>
            );
    }
};

const DataTableFilter = ({ filters = [], initialValues = {} }) => {
    const [form] = Form.useForm();
    const { setFilter, setPage, event } = useDataTableContext();
    const [collapsed, setCollapsed] = useState(true);

    const visibleFilters = collapsed ? filters.slice(0, 3) : filters;
    const showToggle = filters.length > 3;

    const onFinish = (values) => {
        const filterQuery = {};
        Object.keys(values).forEach((key) => {
            const value = values[key];
            if (value !== undefined && value !== null && value !== "") {
                filterQuery[key] = {
                    name: key,
                    operation: "LIKE",
                    value: value,
                };
            }
        });
        setPage(1);
        setFilter(filterQuery);
    };

    const onReset = () => {
        form.resetFields();
        setFilter({});
        if (event?.onReset) {
            event.onReset();
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={onFinish}
        >
            <Row gutter={[16, 0]}>
                {visibleFilters.map((filter, index) => (
                    <Col key={index} xs={24} sm={12} md={8} lg={6}>
                        <FilterItem {...filter} />
                    </Col>
                ))}
                <Col
                    xs={24}
                    sm={12}
                    md={8}
                    lg={6}
                    style={{ marginLeft: "auto" }}
                >
                    <Form.Item label=" ">
                        <Space>
                            <Button onClick={onReset}>Xóa bộ lọc</Button>
                            <Button type="primary" htmlType="submit">
                                Áp dụng
                            </Button>
                            {showToggle && (
                                <Button
                                    type="link"
                                    onClick={() => setCollapsed(!collapsed)}
                                >
                                    {collapsed ? (
                                        <>
                                            Mở rộng <DownOutlined />
                                        </>
                                    ) : (
                                        <>
                                            Thu gọn <UpOutlined />
                                        </>
                                    )}
                                </Button>
                            )}
                        </Space>
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
};

DataTableFilter.propTypes = {
    filters: PropTypes.array,
    initialValues: PropTypes.object,
};

export { FILTER_TYPE };
export default DataTableFilter;
