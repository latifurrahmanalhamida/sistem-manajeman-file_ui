// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Impor Komponen & Halaman
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/Layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DaftarUserPage from './pages/DaftarUserPage';
import TambahUserPage from './pages/TambahUserPage';
import ProfilePage from './pages/ProfilePage';
import RecentFilesPage from './pages/RecentFilesPage';
import FavoritesPage from './pages/FavoritesPage';
import TrashPage from './pages/TrashPage';


// Komponen internal untuk membungkus semua rute yang dilindungi
const ProtectedRoutes = () => (
  <ProtectedRoute>
    <AppLayout>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin/daftar-user" element={<DaftarUserPage />} />
        <Route path="/admin/tambah-user" element={<TambahUserPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
        <Route path="/terbaru" element={<RecentFilesPage />} />
        <Route path="/favorit" element={<FavoritesPage />} />
        <Route path="/sampah" element={<TrashPage />} />

        
        {/* Rute lain yang menggunakan layout bisa ditambahkan di sini */}

        {/* Jika tidak ada rute yang cocok di dalam layout, arahkan ke dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rute publik untuk login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Semua rute lain akan ditangani oleh ProtectedRoutes */}
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;