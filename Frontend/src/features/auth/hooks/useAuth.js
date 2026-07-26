import { toast } from "sonner";
import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context.jsx";
import { login, register, logout, getMe } from "../services/auth.api.js";

export const useAuth = () => {

    const context = useContext(AuthContext);
    const { user, setUser, loading, setLoading } = context;


    const handleLogin = async ({ email, password }) => {
        setLoading(true);
        try {
            const data = await login({ email, password });
            setUser(data.user);
            toast.success("Welcome back!");
            return data;
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message || "Invalid email or password."
            );
            throw error;

        } finally {
            setLoading(false);
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true);
        try {
            const data = await register({ username, email, password });
            setUser(data.user);
            toast.success("Account created successfully!");
        return data;
        } catch (error) {
            console.error(error);
            toast.error(
            error.response?.data?.message || "Registration failed."
        );
        throw error;
        } finally {
            setLoading(false);
        }
    }

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout();
            setUser(null);
            toast.success("Logged out successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to logout.");
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getMe();
                setUser(data.user);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

    }, []);

    return { user, loading, handleLogin, handleRegister, handleLogout };

}