// src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
// Impor fungsi spesifik yang sudah kita buat
import { loginUser, logoutUser, getUser } from '../services/api';
// Impor apiClient untuk mengatur header default
import apiClient from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true);
    // 1. Tambahkan state untuk search query
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Fungsi ini berjalan saat aplikasi pertama kali dimuat
        const bootstrapAuth = async () => {
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) {
                setToken(storedToken);
                // Set header default untuk semua permintaan apiClient
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                try {
                    // Coba ambil data user dengan token yang ada
                    const response = await getUser();
                    setUser(response.data);
                } catch (error) {
                    // Jika token tidak valid, hapus
                    localStorage.removeItem('authToken');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        bootstrapAuth();
    }, []);

    const login = async (identifier, password) => {
        try {
            const response = await loginUser({ identifier, password });
            const { access_token, user: userData } = response.data;

            // Simpan token dan user di localStorage
            localStorage.setItem('authToken', access_token);
            localStorage.setItem('user', JSON.stringify(userData));

            // Perbarui state di aplikasi
            setToken(access_token);
            setUser(userData);

        } catch (error) {
            // Jika login gagal, lempar kembali error agar bisa ditangkap oleh LoginPage
            throw error;
        }
    };

    const logout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout API call failed, proceeding with local logout.", error);
        } finally {
            // Hapus semua data dari state dan localStorage
            setUser(null);
            setToken(null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            delete apiClient.defaults.headers.common['Authorization'];
        }
    };

    // 2. Tambahkan searchQuery dan setSearchQuery ke dalam value
    const value = { user, token, loading, login, logout, searchQuery, setSearchQuery };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom hook untuk menggunakan context
export const useAuth = () => {
    return useContext(AuthContext);
};