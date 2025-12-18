import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem("clinic_cms_user");
        if (saved) {
            setUser(JSON.parse(saved));
        }
        setLoading(false);
    }, []);

    const loginWithPasscode = async (staffId, passcode) => {
        try {
            const res = await authApi.staffLogin(staffId, passcode);
            if (res.data.success) {
                const userData = res.data.user;
                setUser(userData);
                localStorage.setItem("clinic_cms_user", JSON.stringify(userData));
                return { success: true };
            }
        } catch (error) {
            return { success: false, error: error.response?.data?.error || "Login failed" };
        }
    };

    const loginDirect = (userData) => {
        setUser(userData);
        localStorage.setItem("clinic_cms_user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("clinic_cms_user");
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithPasscode, logout, loginDirect }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
