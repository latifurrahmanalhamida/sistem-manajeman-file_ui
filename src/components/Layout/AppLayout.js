import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import NewSidebar from '../NewSidebar/NewSidebar';
import UserProfileDropdown from '../UserProfileDropdown/UserProfileDropdown';
import SessionTimeoutModal from '../Modal/SessionTimeoutModal'; // Impor modal
import useInactivityTimer from '../../hooks/useInactivityTimer'; // Impor hook
import './AppLayout.css';

const AppLayout = ({ children }) => {
    const { user, logout, searchQuery, setSearchQuery } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Tentukan durasi timeout berdasarkan peran pengguna
    const getTimeoutDuration = () => {
        // Default timeout 3 menit untuk user divisi (role_id 3)
        let timeout = 15 * 60 * 1000; // 30 menit dalam milidetik
        return timeout;
    };

    // Callback saat timeout terjadi
    const handleTimeout = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    // Panggil hook dengan durasi yang sesuai
    useInactivityTimer(handleTimeout, getTimeoutDuration());

    // Fungsi untuk melanjutkan sesi
    const handleContinueSession = () => {
        setIsModalOpen(false);
        // Timer akan di-reset secara otomatis oleh hook karena aktivitas ini
    };

    // Fungsi untuk logout
    const handleLogout = () => {
        logout();
        setIsModalOpen(false);
    };

    return (
        <div className="app-layout">
            <NewSidebar />
            <div className="content-wrapper">
                <nav className="navbar">
                    <input
                        type="search"
                        placeholder="Search..."
                        className="search-bar"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <UserProfileDropdown />
                </nav>
                <main className="main-content">
                    {children}
                </main>
            </div>

            {/* Tampilkan modal jika isModalOpen bernilai true */}
            <SessionTimeoutModal
                isOpen={isModalOpen}
                onLogout={handleLogout}
                onContinue={handleContinueSession}
            />
        </div>
    );
};

export default AppLayout;
