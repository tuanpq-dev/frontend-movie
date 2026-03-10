import Footer from "@components/Footer";
import Header from "@components/Header";
import HeaderLogined from "@components/HeaderLogined";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import axios from "axios";
import Toast from "@components/Toast/Toast";
import { API_URL } from "@libs/config";

const Root = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [id, setId] = useState("");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = Cookies.get("accessToken"); // Lấy accessToken từ cookie
                if (token) {
                    setIsLoggedIn(true);
                    const decodedToken = jwt_decode(token); // Giải mã accessToken
                    const userId = decodedToken.id;
                    setId(userId);

                    const response = await axios.get(
                        `${API_URL}/api/users/${userId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        },
                    );
                    const userData = response.data;
                    // Cập nhật state với dữ liệu người dùng

                    setUserName(userData.username);
                    setEmail(userData.email);
                    setAvatar(userData.avatar);
                } else {
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu người dùng:", error);
            }
        };
        fetchUser();
    }, [isLoggedIn]); // Chạy khi component mount
    return (
        <div>
            <Toast />
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
