// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Helper function to get full URL for images
export const getImageUrl = (path) => `${API_URL}${path}`;

const DEFAULT_AVATAR =
    "https://img.freepik.com/free-psd/3d-rendering-avatar_23-2150833560.jpg?w=740&t=st=1728638508~exp=1728639108~hmac=59fcbd89a8d344fb2797ab35306b6b539a477e5dd919d73e04bd449290c3a5f4";

// Avatar có thể là URL Cloudinary (https://...) hoặc tên file cũ
export const getAvatarUrl = (avatar) => {
    if (!avatar) return DEFAULT_AVATAR;
    if (avatar.startsWith("http")) return avatar;
    return `${API_URL}/images/avatar/${avatar}`;
};

// Helper function to get API endpoint
export const getApiUrl = (endpoint) => `${API_URL}${endpoint}`;
