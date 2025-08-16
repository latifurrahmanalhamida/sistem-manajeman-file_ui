// src/pages/SuperAdminBeranda.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';

// Anda bisa menggunakan CSS yang sama dengan dashboard lama atau membuat yang baru
import './DashboardView.css'; 

const SuperAdminBeranda = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Endpoint ini akan mengambil data statistik untuk dashboard super admin
                const response = await apiClient.get('/admin/dashboard-stats');
                setStats(response.data);
            } catch (error) {
                console.error('Could not fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return <div>Loading dashboard data...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                {/* Judul disesuaikan dengan nama menu */}
                <h1>Beranda</h1> 
                <p>Selamat Datang, <strong>{user?.name}</strong></p>
            </div>
            
            {/* Tampilkan statistik hanya jika berhasil diambil */}
            {stats ? (
                <>
                    <div className="stats-grid">
                        <div className="stat-card"><h3>Total Dokumen</h3><p>{stats.totalFiles}</p></div>
                        <div className="stat-card"><h3>Total Pengguna</h3><p>{stats.totalUsers}</p></div>
                        <div className="stat-card"><h3>Total Divisi</h3><p>{stats.totalDivisions}</p></div>
                        <div className="stat-card"><h3>Penyimpanan</h3><p>{(stats.storageUsed / 1024 / 1024).toFixed(2)} MB</p></div>
                    </div>
                    
                    <div className="table-container">
                        <h3>Aktivitas Upload Terbaru</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nama File</th>
                                    <th>Divisi</th>
                                    <th>Pengunggah</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentUploads.map(file => (
                                    <tr key={file.id}>
                                        <td>{file.nama_file_asli}</td>
                                        <td>{file.division ? file.division.name : 'N/A'}</td>
                                        <td>{file.uploader ? file.uploader.name : 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <p>Gagal memuat data statistik. Silakan coba lagi nanti.</p>
            )}
        </div>
    );
};

export default SuperAdminBeranda;