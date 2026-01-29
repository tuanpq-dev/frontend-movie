import React, { createContext, useContext } from "react";

const DataNestedTableContext = createContext({});

export const useDataNestedTableContext = () => {
    const context = useContext(DataNestedTableContext);
    return (
        context || {
            reloadPage: null,
            reloadChildrenData: null,
            parentDataActive: null,
        }
    );
};

export const DataNestedTableProvider = ({ children, value }) => {
    return (
        <DataNestedTableContext.Provider value={value}>
            {children}
        </DataNestedTableContext.Provider>
    );
};

export default DataNestedTableContext;
