import Footer from "@components/Footer";
import Header from "@components/Header";
import HeaderLogined from "@components/HeaderLogined";
import { Outlet } from "react-router-dom";
import { useUserContext } from "@context/UserContext";

const Root = () => {
    const { isLoggedIn, userName, email, avatar } = useUserContext();

    return (
        <div className="min-h-screen bg-[#292e39]">
            {isLoggedIn ? (
                <HeaderLogined
                    username={userName}
                    email={email}
                    avatar={avatar}
                />
            ) : (
                <Header />
            )}
            <Outlet />
            <Footer />
        </div>
    );
};
export default Root;
