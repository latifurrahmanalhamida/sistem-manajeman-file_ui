// src/pages/DashboardPage.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import './DashboardPage.css'; // <-- Impor file CSS baru

// --- Komponen Dashboard untuk Super Admin ---
const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
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

    if (loading) return <div>Loading dashboard data...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Super Admin Dashboard</h1>
                <p>Selamat Datang, <strong>{user?.name}</strong></p>
            </div>
            
            {stats && (
                <>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>Total Dokumen</h3>
                            <p>{stats.totalFiles}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Total Pengguna</h3>
                            <p>{stats.totalUsers}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Total Divisi</h3>
                            <p>{stats.totalDivisions}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Penyimpanan</h3>
                            <p>{(stats.storageUsed / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
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
                                        <td>{file.uploader ? file.uploader.name : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

// --- Komponen Dashboard untuk Admin/User Devisi ---
const DivisionUserDashboard = () => {
    const { user } = useAuth();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await apiClient.get('/files');
                setFiles(response.data);
            } catch (error) {
                console.error('Could not fetch files:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFiles();
    }, []);

    if (loading) return <div>Loading files...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>File di Divisi {user?.division?.name}</h1>
            </div>
            
            <div className="table-container">
                {files.length > 0 ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nama File</th>
                                <th>Ukuran (KB)</th>
                                <th>Pengunggah</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map(file => (
                                <tr key={file.id}>
                                    <td>{file.nama_file_asli}</td>
                                    <td>{(file.ukuran_file / 1024).toFixed(2)}</td>
                                    <td>{file.uploader ? file.uploader.name : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Belum ada file di divisi Anda.</p>
                )}
            </div>
        </div>
    );
};

// --- Komponen Utama DashboardPage ---
const DashboardPage = () => {
    const { user } = useAuth();

    if (user?.role === 'super_admin') {
        return <SuperAdminDashboard />;
    } else {
        return <DivisionUserDashboard />;
    }
};

export default DashboardPage;