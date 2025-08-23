// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

// --- Impor Komponen & Halaman Utama ---
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
import KelolaFolderPage from './pages/KelolaFolderPage';

// --- IMPORT BARU UNTUK SUPER ADMIN ---
import SuperAdminLayout from './components/Layout/SuperAdminLayout';
import SuperAdminBeranda from './pages/SuperAdminBeranda';
import ManajemenPage from './pages/ManajemenPage'; 
import KelolaDivisiPage from './pages/KelolaDivisiPage';
import KelolaPenggunaPage from './pages/KelolaPenggunaPage'; 
import KelolaPenggunaSampahPage from './pages/KelolaPenggunaSampahPage'; 
// import PengaturanPage from './pages/PengaturanPage'; 

// --- Komponen untuk rute Panel Admin Devisi (Tidak berubah) ---
const AdminPanelRoutes = () => (
    <AdminPanelLayout title="Panel Admin">
        <Routes>
            <Route path="/users" element={<DaftarUserPage />} />
            <Route path="/tambah-user" element={<TambahUserPage />} />
            <Route path="/users/edit/:userId" element={<EditUserPage />} />
            <Route path="/users/trash" element={<TrashUserPage />} /> 
            <Route path="/folders" element={<KelolaFolderPage />} />
            <Route path="*" element={<Navigate to="/panel-admin/users" replace />} />
        </Routes>
    </AdminPanelLayout>
);

// --- Komponen untuk rute utama aplikasi (Tidak berubah) ---
const MainRoutes = () => (
    <AppLayout>
        <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/terbaru" element={<RecentFilesPage />} />
            <Route path="/favorit" element={<FavoritesPage />} />
            <Route path="/sampah" element={<TrashPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    </AppLayout>
);

// --- Komponen Utama App (Struktur routing diperbarui) ---
function App() {
    return (
        <AppProvider> 
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Rute publik */}
                        <Route path="/login" element={<LoginPage />} />
                        
                        {/* Rute terproteksi untuk Panel Admin Devisi (Tidak berubah) */}
                        <Route path="/panel-admin/*" element={
                            <ProtectedRoute allowedRoles={['admin_devisi']}>
                                <AdminPanelRoutes />
                            </ProtectedRoute>
                        } />
                        
                        {/* RUTE SUPER ADMIN YANG DIPERBAIKI */}
                        <Route 
                            path="/super-admin"
                            element={
                                <ProtectedRoute allowedRoles={['super_admin']}>
                                    <SuperAdminLayout />
                                </ProtectedRoute>
                            }
                        >
                            {/* Rute nested didefinisikan sebagai children di sini */}
                            <Route index element={<Navigate to="beranda" replace />} />
                            <Route path="beranda" element={<SuperAdminBeranda />} />
                            <Route path="manajemen" element={<ManajemenPage />} />
                            <Route path="manajemen/divisi" element={<KelolaDivisiPage />} />
                            <Route path="manajemen/pengguna" element={<KelolaPenggunaPage />} />
                            <Route path="manajemen/pengguna/sampah" element={<KelolaPenggunaSampahPage />} />
                            {/* <Route path="pengaturan" element={<PengaturanPage />} /> */}
                            <Route path="*" element={<Navigate to="beranda" replace />} />
                        </Route>
                        
                        {/* Rute terproteksi untuk semua halaman utama lainnya */}
                        <Route path="/*" element={<ProtectedRoute><MainRoutes /></ProtectedRoute>} />
                    </Routes>
                </Router>
            </AuthProvider>
        </AppProvider>
    );
}

export default App;