import { useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "@components/SideBar";

const AdminLayout = () => {
    const [sidebarLoaded, setSidebarLoaded] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <SideBar
                onLoadComplete={() => setSidebarLoaded(true)}
                onCollapsedChange={setSidebarCollapsed}
            />
            {sidebarLoaded && (
                <div
                    className={`min-h-screen overflow-x-hidden p-3 pt-16 transition-all duration-300 sm:p-4 md:p-6 lg:pt-6 ${
                        sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
                    }`}
                >
                    <Outlet />
                </div>
            )}
        </div>
    );
};

export default AdminLayout;
