import axios from 'axios';

// Create a centralized Axios instance with predefined settings
const API = axios.create({
    // Vite uses import.meta.env to read environment variables
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// An interceptor is like an automated middleware. This code runs BEFORE every single
// outbound request, automatically grabbing our JWT token from the browser's storage
// and sticking it into the authorization header so the backend knows who we are.
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;