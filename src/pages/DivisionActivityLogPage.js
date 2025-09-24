import React, { useState, useEffect } from 'react';
import { getDivisionActivityLogs } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './DivisionActivityLogPage.css';

const DivisionActivityLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            const fetchLogs = async () => {
                try {
                    setLoading(true);
                    const response = await getDivisionActivityLogs();
                    setLogs(response.data.data || []); // Handle paginated response
                    setError(null);
                } catch (err) {
                    setError('Gagal memuat log aktivitas.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };

            fetchLogs();
        }
    }, [user]);

    if (loading) {
        return <div>Memuat log aktivitas...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="activity-log-container">
            <h2>Log Aktivitas Divisi</h2>
            {logs.length > 0 ? (
                <table className="activity-log-table">
                    <thead>
                        <tr>
                            <th>Pengguna</th>
                            <th>Aktivitas</th>
                            <th>Detail</th>
                            <th>Tanggal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td>{log.causer?.name || 'Pengguna tidak dikenal'}</td>
                                <td>{log.description}</td>
                                <td>{log.properties && log.properties.details ? (typeof log.properties.details === 'object' ? JSON.stringify(log.properties.details) : log.properties.details) : '-'}</td>
                                <td>{new Date(log.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Tidak ada aktivitas yang tercatat.</p>
            )}
        </div>
    );
};

export default DivisionActivityLogPage;
