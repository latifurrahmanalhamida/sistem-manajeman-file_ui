// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import DaftarUserPage from './pages/DaftarUserPage'; // <-- 1. Impor halaman baru
import ProtectedRoute from './components/ProtectedRoute';
import TambahUserPage from './pages/TambahUserPage';
import Sidebar from './components/Sidebar/Sidebar';
import './App.css';

// Komponen Layout untuk Halaman yang Memiliki Sidebar
const AppLayout = ({ children }) => {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

// Komponen Utama Aplikasi
const AppContent = () => {
    const location = useLocation();
    const noSidebarRoutes = ['/login']; 

    const showSidebar = !noSidebarRoutes.includes(location.pathname);

    return (
        <>
            {showSidebar ? (
                <AppLayout>
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                        
                        {/* 2. Tambahkan rute baru di sini */}
                        <Route path="/admin/daftar-user" element={<ProtectedRoute><DaftarUserPage /></ProtectedRoute>} />
                        <Route path="/admin/tambah-user" element={<ProtectedRoute><TambahUserPage /></ProtectedRoute>} /> 
                    </Routes>
                </AppLayout>
            ) : (
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                </Routes>
            )}
        </>
    );
};

function App() {
    return (
        <Router>
            {/* Anda perlu AuthProvider di sini jika belum ada */}
            {/* <AuthProvider> */}
                <AppContent />
            {/* </AuthProvider> */}
        </Router>
    );
}

export default App;