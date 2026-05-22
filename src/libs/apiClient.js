import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "./config";

const getAuthHeaders = () => {
    const token = Cookies.get("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const buildUrl = (endpoint) => {
    if (endpoint.startsWith("http")) return endpoint;
    return `${API_URL}${endpoint}`;
};

const withHeaders = (config = {}) => ({
    ...config,
    headers: {
        ...getAuthHeaders(),
        ...(config.headers || {}),
    },
});

export const apiClient = {
    get: async (endpoint, config) => {
        const response = await axios.get(buildUrl(endpoint), withHeaders(config));
        return response.data;
    },
    post: async (endpoint, data, config) => {
        const response = await axios.post(
            buildUrl(endpoint),
            data,
            withHeaders(config),
        );
        return response.data;
    },
    put: async (endpoint, data, config) => {
        const response = await axios.put(
            buildUrl(endpoint),
            data,
            withHeaders(config),
        );
        return response.data;
    },
    patch: async (endpoint, data, config) => {
        const response = await axios.patch(
            buildUrl(endpoint),
            data,
            withHeaders(config),
        );
        return response.data;
    },
    delete: async (endpoint, config) => {
        const response = await axios.delete(
            buildUrl(endpoint),
            withHeaders(config),
        );
        return response.data;
    },
};

export const getAuthHeader = getAuthHeaders;
