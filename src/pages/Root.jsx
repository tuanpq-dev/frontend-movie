import Footer from "@components/Footer";
import Header from "@components/Header";
import ScrollToTop from "@components/ScrollToTop";
import { Outlet } from "react-router-dom";

const Root = () => (
    <div className="min-h-screen bg-surface">
        <ScrollToTop />
        <Header />
        <Outlet />
        <Footer />
    </div>
);
export default Root;
