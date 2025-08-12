// src/components/Layout/AdminPanelLayout.js
import React from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Impor useNavigate
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import './AdminPanelLayout.css';
import { FaArrowLeft } from 'react-icons/fa';

const AdminPanelLayout = ({ children, title }) => {
    const navigate = useNavigate(); // 2. Inisialisasi hook

    return (
        <div className="admin-panel-layout">
            <AdminSidebar />
            <main className="admin-panel-content">
                <div className="panel-header">
                    {/* 3. Arahkan ke halaman utama saat diklik */}
                    <button onClick={() => navigate('/dashboard')} className="back-button">
                        <FaArrowLeft />
                    </button>
                    <h1>{title}</h1>
                </div>
                {children}
            </main>
        </div>
    );
};

export default AdminPanelLayout;