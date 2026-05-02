import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import { useUserContext } from "./context/UserContext";

// Module ID mapping for routes
const ROUTE_MODULE_MAP = {
    "/admin/movie": "movies",
    "/admin/genre": "genres",
    "/admin/user": "users",
    "/admin/payment": "payments",
    "/admin/revenue": "revenue",
    "/admin/comment": "comments",
};

const AdminRoute = ({ element }) => {
    const location = useLocation();
    const { modules, isAdmin } = useUserContext();

    // Lấy accessToken từ cookie
    const accessToken = Cookies.get("accessToken");

    // Nếu không có token, chuyển hướng về trang đăng nhập
    if (!accessToken) {
        return <Navigate to="/sign-in" replace />;
    }

    try {
        // Giải mã token và kiểm tra trường isAdmin
        const decodedToken = jwt_decode(accessToken);
        const isAdminToken =
            decodedToken?.isAdmin === true || decodedToken?.isAdmin === "true";

        // Check module-level access for specific routes
        // Admin (isAdmin=true in token OR context) bypasses module checks
        const isAdminUser = isAdminToken || isAdmin;
        
        if (!isAdminUser) {
            // Get base path (e.g., /admin/movie from /admin/movie/edit/123)
            const basePath = location.pathname.split("/").slice(0, 3).join("/");
            const requiredModuleId = ROUTE_MODULE_MAP[basePath];

            if (requiredModuleId) {
                const hasAccess = modules.some(
                    (m) => m.id === requiredModuleId,
                );

                if (!hasAccess) {
                    return <Navigate to="/403" replace />;
                }
            } else {
                // Không tìm thấy module cấu hình cho route admin này
                return <Navigate to="/403" replace />;
            }
        }

        // Nếu là admin hoặc có quyền truy cập, cho phép truy cập
        return element;
    } catch (error) {
        console.error("Đăng nhập không hợp lệ:", error);
        // Nếu token không hợp lệ, chuyển hướng về trang đăng nhập
        return <Navigate to="/sign-in" replace />;
    }
};

export default AdminRoute;
