import axios from 'axios';
import { auth, provider } from "./googleAuth";
import { signInWithPopup } from "firebase/auth";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});

export async function register({ username, email, password }) {
    try{                   
        const response = await api.post('/api/auth/register', {
            username,
            email,
            password
        });
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post('/api/auth/login', {
            email,
            password
        });

        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}


export async function logout() {
    try {
        const response = await api.get('/api/auth/logout');

        return response.data;
        
    } catch (error) {
        console.error(error);
        throw error;
    }
}


export async function getMe() {
    try {
        const response = await api.get('/api/auth/get-me');

        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}


export async function googleLogin() {
    const result = await signInWithPopup(auth, provider);

    const idToken = await result.user.getIdToken();

    const response = await api.post("/api/auth/google", {
        idToken,
    });

    return response.data;
}