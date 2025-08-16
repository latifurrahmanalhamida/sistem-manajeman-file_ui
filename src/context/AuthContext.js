// src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, getUser } from '../services/api';
import apiClient from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const bootstrapAuth = async () => {
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) {
                setToken(storedToken);
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                try {
                    const response = await getUser();
                    setUser(response.data);
                } catch (error) {
                    localStorage.removeItem('authToken');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };
        bootstrapAuth();
    }, []);

    // ===== PERUBAHAN ADA DI SINI =====
    const login = async (loginInput, password) => { 
        try {
            // Mengirim data ke backend dengan kunci 'login' agar sesuai dengan AuthController
            const response = await loginUser({ 
                login: loginInput, 
                password: password 
            });
            
            const { access_token, user: userData } = response.data;

            localStorage.setItem('authToken', access_token);
            localStorage.setItem('user', JSON.stringify(userData));

            setToken(access_token);
            setUser(userData);
            
            // Set header default untuk permintaan selanjutnya setelah login berhasil
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

        } catch (error) {
            throw error;
        }
    };
    // ===== AKHIR PERUBAHAN =====

    const logout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout API call failed, proceeding with local logout.", error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            delete apiClient.defaults.headers.common['Authorization'];
        }
    };

    const value = { user, token, loading, login, logout, searchQuery, setSearchQuery };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};