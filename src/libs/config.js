// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Helper function to get full URL for images
export const getImageUrl = (path) => `${API_URL}${path}`;

// Helper function to get API endpoint
export const getApiUrl = (endpoint) => `${API_URL}${endpoint}`;
