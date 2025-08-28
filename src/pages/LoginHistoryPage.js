// src/pages/LoginHistoryPage.js

import React from 'react';
import './ManajemenPage.css'; 
// --- TAMBAHKAN IMPORT INI ---
import LoginHistoryTable from '../components/Dashboard/LoginHistoryTable';

const LoginHistoryPage = () => {
    return (
        <div className="manajemen-page">
            <h1>Riwayat Login Pengguna</h1>
            
            <div className="log-container">
                {/* --- PANGGIL KOMPONEN TABEL DI SINI --- */}
                <LoginHistoryTable />
            </div>
        </div>
    );
};

export default LoginHistoryPage;