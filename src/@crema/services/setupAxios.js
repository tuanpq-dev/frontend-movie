import axios from "axios";

export const instanceCoreApi = axios.create({
    baseURL: "/api",
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add request interceptor for authentication
instanceCoreApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Add response interceptor for error handling
instanceCoreApi.interceptors.response.use(
    (response) => response.data,
    (error) => {
        return Promise.reject(error.response?.data || error);
    },
);

export default instanceCoreApi;
