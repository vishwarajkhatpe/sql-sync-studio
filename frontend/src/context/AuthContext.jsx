import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is already logged in when the app first loads
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    // Action: Log In
    const login = async (email, password) => {
        // OAuth2 standard uses form data format (URL-encoded) for the login endpoint
        const formData = new URLSearchParams();
        formData.append('username', email); // FastAPI OAuth2 form looks for 'username'
        formData.append('password', password);

        const response = await API.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        // Fetch actual profile from backend
        const profileRes = await API.get('/auth/me', { headers: { Authorization: `Bearer ${access_token}` } });
        localStorage.setItem('user', JSON.stringify(profileRes.data));
        setUser(profileRes.data);
        return response.data;
    };

    // Action: Register
    const register = async (email, password) => {
        const response = await API.post('/auth/register', { email, password });
        return response.data;
    };

    // Action: Log Out
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
    };

    // Action: Change Password
    const changePassword = async (oldPassword, newPassword) => {
        const response = await API.post('/auth/change-password', {
            old_password: oldPassword,
            new_password: newPassword
        });
        return response.data;
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, changePassword, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom hook so components can easily grab the auth state
export const useAuth = () => useContext(AuthContext);