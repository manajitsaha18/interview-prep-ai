import { createContext, useEffect, useState } from "react";
import { getMe } from "./services/auth.api.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchUser = async () => {
            try {

                const data = await getMe();
                setUser(data.user);

            } catch (error) {

                // 401 simply means the user is not logged in
                if (error.response?.status !== 401) {
                    console.error("Failed to check authentication:", error);
                }

                setUser(null);

            } finally {
                setLoading(false);
            }
        };

        fetchUser();

    }, []);

    return (
        <AuthContext.Provider
            value={{ user, setUser, loading, setLoading }}
        >
            {children}
        </AuthContext.Provider>
    );
};