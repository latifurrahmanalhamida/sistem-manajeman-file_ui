// src/pages/ProfilePage.js
import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const { user } = useAuth();

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Profil Saya</h1>
            </div>
            <div className="table-container" style={{maxWidth: '600px'}}>
                <p><strong>Nama:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Peran:</strong> {user?.role}</p>
                <p><strong>Divisi:</strong> {user?.division?.name || 'N/A'}</p>
            </div>
        </div>
    );
};

export default ProfilePage;