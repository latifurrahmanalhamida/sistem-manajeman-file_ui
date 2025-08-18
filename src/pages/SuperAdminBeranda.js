// src/pages/SuperAdminBeranda.js

import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import StatCard from '../components/Dashboard/StatCard';
import ChartCard from '../components/Dashboard/ChartCard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './SuperAdminBeranda.css';

// Komponen kecil untuk progress bar di dalam StatCard
const ProgressBar = ({ percentage }) => (
    <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
    </div>
);

const SuperAdminBeranda = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await apiClient.get('/admin/dashboard-stats');
                setStats(response.data);
            } catch (err) {
                setError('Gagal memuat data dashboard. Pastikan backend berjalan.');
                console.error('Could not fetch dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div>Loading dashboard data...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!stats) return <div>Tidak ada data untuk ditampilkan.</div>;

    return (
        <div className="super-admin-beranda">
            <h1>Beranda</h1>

            {/* Bagian Kartu Statistik Utama */}
            <div className="stats-grid">
                <StatCard title="CPU" value={`${stats.cpu.percentage}%`}>
                    <ProgressBar percentage={stats.cpu.percentage} />
                </StatCard>
                <StatCard title="RAM" value={`${stats.ram.percentage}%`}>
                    <ProgressBar percentage={stats.ram.percentage} />
                </StatCard>
                <StatCard title="DISK" value={`${stats.disk.percentage}%`}>
                    <ProgressBar percentage={stats.disk.percentage} />
                </StatCard>
                <StatCard title="Penyimpanan File" value={stats.storageUsed} />
            </div>

            {/* Bagian Grafik */}
            <div className="charts-grid">
                <ChartCard title="Upload 7 Hari Terakhir">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.dailyUploads} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" name="Jumlah Upload" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Distribusi File per Divisi">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.filesPerDivision} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" name="Jumlah File" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
            
            {/* Bagian Ringkasan & Aktivitas Terbaru */}
            <div className="summary-grid">
                 <ChartCard title="Ringkasan">
                    <ul className="summary-list">
                        <li><span>Total Pengguna</span> <strong>{stats.totalUsers}</strong></li>
                        <li><span>Total Divisi</span> <strong>{stats.totalDivisions}</strong></li>
                        <li><span>Total Dokumen</span> <strong>{stats.totalFiles}</strong></li>
                        <li><span>Penyimpanan Terpakai</span> <strong>{stats.storageUsed}</strong></li>
                    </ul>
                 </ChartCard>

                 <ChartCard title="Aktivitas Upload Terbaru">
                    <table className="recent-uploads-table">
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
                                    <td>{file.division?.name ?? 'N/A'}</td>
                                    <td>{file.uploader?.name ?? 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </ChartCard>
            </div>
        </div>
    );
};

export default SuperAdminBeranda;