import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import axios from "axios";
import { API_URL } from "@libs/config";

const UserContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useUserContext = () => {
    return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [id, setId] = useState("");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const token = Cookies.get("accessToken");
            if (token) {
                setIsLoggedIn(true);
                const decodedToken = jwt_decode(token);
                const userId = decodedToken.id;
                setId(userId);
                setIsAdmin(decodedToken.isAdmin || false);

                const response = await axios.get(
                    `${API_URL}/api/users/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );
                const userData = response.data;

                setUserName(userData.username);
                setEmail(userData.email);
                setAvatar(userData.avatar);
            } else {
                // Reset state when no token
                setIsLoggedIn(false);
                setId("");
                setUserName("");
                setEmail("");
                setAvatar("");
                setIsAdmin(false);
            }
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu người dùng:", error);
            // Reset state on error
            setIsLoggedIn(false);
            setId("");
            setUserName("");
            setEmail("");
            setAvatar("");
            setIsAdmin(false);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUser = async () => {
        setIsLoading(true);
        await fetchUser();
    };

    const logout = () => {
        Cookies.remove("accessToken");
        setIsLoggedIn(false);
        setId("");
        setUserName("");
        setEmail("");
        setAvatar("");
        setIsAdmin(false);
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const value = {
        isLoggedIn,
        id,
        userName,
        email,
        avatar,
        isAdmin,
        isLoading,
        refreshUser,
        logout,
    };

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
};

UserProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
