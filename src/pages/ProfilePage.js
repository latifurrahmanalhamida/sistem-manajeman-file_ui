// src/pages/ProfilePage.js

import React from 'react';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css'; 

const ProfilePage = () => {
    const { user } = useAuth();

    // Menampilkan pesan loading jika data user belum siap
    if (!user) {
        return <div className="profile-page-container">Memuat data profil...</div>;
    }

    return (
        <div className="profile-page-container">
            <h1>Profil Saya</h1>

            <div className="profile-card">
                <div className="profile-info-item">
                    <span className="info-label">Nama:</span>
                    <span className="info-value">{user.name}</span>
                </div>
                <div className="profile-info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{user.email}</span>
                </div>
                <div className="profile-info-item">
                    <span className="info-label">Peran:</span>
                    <span className="info-value">{user.role?.name || 'N/A'}</span>
                </div>
                <div className="profile-info-item">
                    <span className="info-label">Divisi:</span>
                    <span className="info-value">{user.division?.name || 'Tidak Ada'}</span>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;