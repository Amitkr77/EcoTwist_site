import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const getAuthToken = () => {
    return localStorage.getItem("user-token");
};

const isTokenValid = (token) => {
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp > currentTime) {
            return true;
        }
        return false;
    } catch (e) {
        console.warn("Invalid token format");
        return false;
    }
};

export const authApi = async (method, url, data = null) => {
    const token = getAuthToken();
    if (!token) {
        console.warn("No auth token found.");
        return null;
    }

    if (!isTokenValid(token)) {
        console.warn("Auth token expired or invalid.");
        return null;  // or throw error, or handle re-login
    }

    try {
        const response = await axios({
            method,
            url,
            data,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response;
    } catch (error) {
        if (error.response?.status === 401) {
            throw new Error("Unauthorized: Please log in again.");
        }
        console.error("authApi error:", error);
        throw error;
    }
};
