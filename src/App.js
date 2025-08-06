// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Impor Komponen & Halaman
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/Layout/AppLayout';
import AdminPanelLayout from './components/Layout/AdminPanelLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DaftarUserPage from './pages/DaftarUserPage';
import TambahUserPage from './pages/TambahUserPage';
import ProfilePage from './pages/ProfilePage';
import RecentFilesPage from './pages/RecentFilesPage';
import FavoritesPage from './pages/FavoritesPage';
import TrashPage from './pages/TrashPage';
import EditUserPage from './pages/EditUserPage';
import TrashUserPage from './pages/TrashUserPage';

// Komponen untuk rute Panel Admin
const AdminPanelRoutes = () => (
    <AdminPanelLayout title="Panel Admin">
        <Routes>
            <Route path="/users" element={<DaftarUserPage />} />
            <Route path="/tambah-user" element={<TambahUserPage />} />
            {/* Rute EditUserPage dipindahkan ke sini */}
            <Route path="/users/edit/:userId" element={<EditUserPage />} />
             <Route path="/users/trash" element={<TrashUserPage />} /> 
            {/* Rute default di dalam panel admin */}
            <Route path="*" element={<Navigate to="/panel-admin/users" replace />} />
        </Routes>
    </AdminPanelLayout>
);

// Komponen untuk rute utama aplikasi
const MainRoutes = () => (
    <AppLayout>
        <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/terbaru" element={<RecentFilesPage />} />
            <Route path="/favorit" element={<FavoritesPage />} />
            <Route path="/sampah" element={<TrashPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* Rute EditUserPage sudah dihapus dari sini */}
            {/* Arahkan rute tak dikenal di layout utama ke dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    </AppLayout>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Rute publik */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Rute terproteksi untuk Panel Admin */}
                    <Route path="/panel-admin/*" element={<ProtectedRoute><AdminPanelRoutes /></ProtectedRoute>} />
                    
                    {/* Rute terproteksi untuk semua halaman utama lainnya */}
                    <Route path="/*" element={<ProtectedRoute><MainRoutes /></ProtectedRoute>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;