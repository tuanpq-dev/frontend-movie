import React, {
    createContext,
    forwardRef,
    useContext,
    useState,
    useImperativeHandle,
    useEffect,
    useCallback,
} from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Cookies from "js-cookie";

const DataTableCtx = createContext({});

export const useDataTableContext = () => useContext(DataTableCtx);

const DataTableContext = forwardRef(
    (
        {
            children,
            url,
            columns: columnsProp,
            initTable = {},
            method = "GET",
            showColumnIndex = true,
            event = {},
            disableParams = false,
        },
        ref,
    ) => {
        const [isLoading, setIsLoading] = useState(false);
        const [data, setData] = useState([]);
        const [total, setTotal] = useState(0);
        const [page, setPage] = useState(initTable?.page || 1);
        const [pageSize, setPageSize] = useState(initTable?.pageSize || 10);
        const [sort, setSort] = useState(initTable?.sort || []);
        const [filter, setFilter] = useState(initTable?.filter || {});
        const [search, setSearch] = useState(initTable?.search || "");
        const [tableSize, setTableSize] = useState("middle");
        const [columns, setColumns] = useState(columnsProp || []);

        const fetchData = useCallback(async () => {
            if (!url) return;

            setIsLoading(true);
            try {
                // Get token from cookies (same as ManageMovie.jsx)
                const token = Cookies.get("accessToken");
                const headers = token
                    ? { Authorization: `Bearer ${token}` }
                    : {};

                const searchValue = search?.trim();

                const params = disableParams
                    ? searchValue
                        ? { keyword: searchValue, search: searchValue }
                        : undefined
                    : {
                          page: page - 1,
                          size: pageSize,
                          ...(searchValue
                              ? {
                                    keyword: searchValue,
                                    search: searchValue,
                                }
                              : {}),
                          ...(sort.length > 0
                              ? {
                                    sort: sort
                                        .map(
                                            (s) =>
                                                `${s.field},${
                                                    s.desc ? "desc" : "asc"
                                                }`,
                                        )
                                        .join(","),
                                }
                              : {}),
                      };

                const requestConfig = disableParams
                    ? { params, headers }
                    : { params, headers };

                let response;
                if (method === "GET") {
                    response = await axios.get(url, requestConfig);
                } else {
                    response = await axios.post(
                        url,
                        disableParams
                            ? searchValue
                                ? { keyword: searchValue, search: searchValue }
                                : {}
                            : params,
                        { headers },
                    );
                }

                const result = response?.data;
                // Handle different response structures
                const items =
                    result?.content ||
                    result?.data ||
                    result?.items ||
                    result ||
                    [];
                const totalCount =
                    result?.totalElements ||
                    result?.total ||
                    result?.totalItems ||
                    items.length;

                // Add index to data
                const dataWithIndex = (Array.isArray(items) ? items : []).map(
                    (item, index) => ({
                        ...item,
                        myIndex: (page - 1) * pageSize + index + 1,
                    }),
                );

                setData(dataWithIndex);
                setTotal(totalCount);
            } catch (error) {
                console.error("DataTable fetch error:", error);
                setData([]);
                setTotal(0);
            } finally {
                setIsLoading(false);
            }
        }, [url, method, page, pageSize, sort, filter, search, disableParams]);

        useEffect(() => {
            fetchData();
        }, [fetchData]);

        const reloadPage = useCallback(() => {
            fetchData();
        }, [fetchData]);

        const setColumnHidden = useCallback((key, hidden) => {
            setColumns((prev) =>
                prev.map((col) =>
                    col.key === key || col.dataIndex === key
                        ? { ...col, hidden }
                        : col,
                ),
            );
        }, []);

        // Update columns when props change
        useEffect(() => {
            let cols = columnsProp?.map((col) => ({
                ...col,
                key: col.key || col.dataIndex,
            }));

            if (showColumnIndex) {
                cols = [
                    {
                        title: "STT",
                        dataIndex: "myIndex",
                        key: "myIndex",
                        width: 60,
                        fixed: "left",
                        align: "center",
                    },
                    ...cols,
                ];
            }

            setColumns(cols);
        }, [columnsProp, showColumnIndex]);

        const contextValue = {
            isLoading,
            data,
            total,
            page,
            pageSize,
            sort,
            filter,
            search,
            tableSize,
            columns,
            event,

            setPage,
            setPageSize,
            setSort,
            setFilter,
            setSearch,
            setTableSize,
            setColumns,
            setColumnHidden,
            reloadPage,
        };

        useImperativeHandle(ref, () => ({
            setPage,
            setPageSize,
            setSort,
            setFilter,
            setSearch,
            setTableSize,
            reloadPage,
        }));

        return (
            <DataTableCtx.Provider value={contextValue}>
                {children}
            </DataTableCtx.Provider>
        );
    },
);

DataTableContext.displayName = "DataTableContext";

DataTableContext.propTypes = {
    url: PropTypes.string,
    method: PropTypes.string,
    initTable: PropTypes.object,
    children: PropTypes.node,
    showColumnIndex: PropTypes.bool,
    columns: PropTypes.array,
    event: PropTypes.object,
    disableParams: PropTypes.bool,
};

export default DataTableContext;
