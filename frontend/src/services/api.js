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

// Response interceptor to handle 401 errors and refresh the token
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) throw new Error('No refresh token');
                
                const response = await axios.post(`${API.defaults.baseURL}/auth/refresh`, {
                    refresh_token: refreshToken
                });
                
                const { access_token } = response.data;
                localStorage.setItem('token', access_token);
                
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return API(originalRequest);
            } catch (err) {
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }
        
        return Promise.reject(error);
    }
);

export default API;