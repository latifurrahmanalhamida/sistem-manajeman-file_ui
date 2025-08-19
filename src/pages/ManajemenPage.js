// src/pages/ManajemenPage.js

import React from 'react';
import { Link } from 'react-router-dom';
import ActivityLogTable from '../components/Dashboard/ActivityLogTable'; // Akan kita buat setelah ini
import './ManajemenPage.css'; // Akan kita buat setelah ini

const ManajemenPage = () => {
    return (
        <div className="manajemen-page">
            <h1>Manajemen Global</h1>

            <div className="manajemen-nav-buttons">
                <Link to="/super-admin/manajemen/divisi" className="btn btn-primary">
                    Kelola Divisi
                </Link>
                <Link to="/super-admin/manajemen/pengguna" className="btn btn-secondary">
                    Kelola Pengguna
                </Link>
            </div>

            <div className="log-container">
                <h3>Log Aktivitas Terbaru</h3>
                <ActivityLogTable />
            </div>
        </div>
    );
};

export default ManajemenPage;