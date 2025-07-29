// src/components/ProtectedRoute.js

import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading, getUser } = useAuth();
    
    useEffect(() => {
        // PERUBAHAN UTAMA DI SINI:
        // Cek pengguna HANYA JIKA aplikasi dalam status loading awal
        // dan belum ada data user.
        if (loading) {
            getUser();
        }
    }, [loading, getUser]); // Hapus 'user' dari dependency array

    // Saat masih loading awal, tampilkan pesan
    if (loading) {
        return <div>Loading application...</div>;
    }

    // Jika sudah tidak loading dan user tetap tidak ada, arahkan ke login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Jika user ada, tampilkan halaman yang diminta
    return children;
};

export default ProtectedRoute;