import { useState, useCallback } from "react";

const useCallApi = ({ success, callApi, error }) => {
    const [loading, setLoading] = useState(false);

    const send = useCallback(
        async (data) => {
            setLoading(true);
            try {
                const response = await callApi(data);
                if (success) {
                    success(response, data);
                }
                return response;
            } catch (err) {
                if (error) {
                    error(err);
                }
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [callApi, success, error],
    );

    return { loading, send };
};

export default useCallApi;
