// src/components/Dashboard/ActivityLogTable.js
import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api'; // Pastikan path ini benar
import './ActivityLogTable.css';

const ActivityLogTable = () => {
    // State untuk menyimpan data dari API, status loading, dan error
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                // Panggil API endpoint yang sudah kita buat di backend
                const response = await apiClient.get('/admin/activity-logs');
                setLogs(response.data.data); // Data log ada di dalam properti 'data' karena paginasi
            } catch (err) {
                setError('Gagal memuat log aktivitas.');
                console.error('Failed to fetch activity logs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []); // Array kosong berarti useEffect hanya berjalan sekali saat komponen dimuat

    if (loading) {
        return <p>Memuat log aktivitas...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div className="table-wrapper">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Waktu</th>
                        <th>Pelaku</th>
                        <th>Aksi</th>
                        <th>Target</th>
                        <th>Detail</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Lakukan mapping pada data 'logs' dari state, bukan dummy data lagi */}
                    {logs.map(log => (
                        <tr key={log.id}>
                            <td>{new Date(log.created_at).toLocaleString('id-ID')}</td>
                            <td>{log.user?.name ?? 'Sistem'}</td>
                            <td>{log.action}</td>
                            {/* Kita perlu menambahkan 'target_display' di backend nanti, untuk sementara kita tampilkan ID */}
                            <td>{log.target_type ? `${log.target_type.split('\\').pop()} #${log.target_id}` : '-'}</td>
                            {/* Detail yang kita simpan dalam format JSON */}
                            <td>{log.details?.info ?? '-'}</td>
                            <td>
                                <span className={`status-badge status-${log.status.toLowerCase()}`}>
                                    {log.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ActivityLogTable;