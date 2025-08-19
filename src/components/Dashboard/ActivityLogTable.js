// src/components/Dashboard/ActivityLogTable.js
import React, { useState, useEffect, useCallback } from 'react'; // <-- 1. Impor useCallback
import apiClient from '../../services/api';
import './ActivityLogTable.css';
import { FaPlus, FaEdit, FaTrash, FaUndo, FaUser } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Pagination from './Pagination';
import { useAppContext } from '../../context/AppContext';

const getActionIcon = (action) => {
    if (action.includes('Membuat') || action.includes('Mengunggah')) return <FaPlus className="icon-create" />;
    if (action.includes('Mengubah')) return <FaEdit className="icon-update" />;
    if (action.includes('Menghapus')) return <FaTrash className="icon-delete" />;
    if (action.includes('Memulihkan')) return <FaUndo className="icon-restore" />;
    return <FaUser />;
};

const ActivityLogTable = () => {
    const { lastActivity } = useAppContext();
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [textFilter, setTextFilter] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // --- 2. Bungkus fetchLogs dengan useCallback ---
    const fetchLogs = useCallback(async (url = '/admin/activity-logs', params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get(url, { params });
            const responseData = response.data;
            setLogs(responseData.data);
            setPagination({
                meta: { from: responseData.from, to: responseData.to, total: responseData.total },
                links: { prev: responseData.prev_page_url, next: responseData.next_page_url }
            });
        } catch (err) {
            setError('Gagal memuat log aktivitas.');
            console.error('Failed to fetch activity logs:', err);
        } finally {
            setLoading(false);
        }
    }, []); // Array kosong berarti fungsi ini tidak akan dibuat ulang

    // --- 3. Perbarui useEffect ---
    useEffect(() => {
        // Panggil fetchLogs dengan parameter default saat komponen dimuat atau saat lastActivity berubah
        fetchLogs();
    }, [lastActivity, fetchLogs]); // Sekarang ia "mendengarkan" lastActivity dan fungsi fetchLogs yang stabil

    const formatDateForAPI = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const handleFilterSubmit = () => {
        const params = {
            start_date: formatDateForAPI(startDate),
            end_date: formatDateForAPI(endDate),
        };
        fetchLogs('/admin/activity-logs', params);
    };

    const handleResetFilter = () => {
        setStartDate(null);
        setEndDate(null);
        setTextFilter('');
        fetchLogs();
    };

    const handlePageChange = (url) => {
        const path = new URL(url).pathname + new URL(url).search;
        const finalPath = path.replace(/^\/api/, '');
        fetchLogs(finalPath);
    };

    const filteredLogs = logs.filter(log => 
        (log.user?.name?.toLowerCase() || '').includes(textFilter.toLowerCase()) ||
        (log.action?.toLowerCase() || '').includes(textFilter.toLowerCase()) ||
        (log.details?.info?.toLowerCase() || '').includes(textFilter.toLowerCase())
    );

    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="table-wrapper">
             <div className="filter-controls">
                <div className="text-filter-group">
                    <input 
                        type="text"
                        className="filter-input"
                        placeholder="Cari log berdasarkan pelaku, aksi, atau detail..."
                        value={textFilter}
                        onChange={(e) => setTextFilter(e.target.value)}
                    />
                </div>
                <div className="date-filter-group">
                    <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} selectsStart startDate={startDate} endDate={endDate} dateFormat="dd/MM/yyyy" placeholderText="Tanggal Mulai" className="date-input" isClearable />
                    <span>-</span>
                    <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} selectsEnd startDate={startDate} endDate={endDate} minDate={startDate} dateFormat="dd/MM/yyyy" placeholderText="Tanggal Selesai" className="date-input" isClearable />
                    <button className="btn btn-primary" onClick={handleFilterSubmit}>Filter</button>
                    <button className="btn btn-secondary" onClick={handleResetFilter}>Reset</button>
                </div>
            </div>
            
            {loading ? (
                <p>Memuat log aktivitas...</p> 
            ) : (
                <>
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
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map(log => (
                                    <tr key={log.id}>
                                        <td className="log-time">{new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' })}</td>
                                        <td>{log.user?.name ?? 'Sistem'}</td>
                                        <td className="log-action">
                                            {getActionIcon(log.action)}
                                            <span>{log.action}</span>
                                        </td>
                                        <td className="log-target">{log.target_type ? `${log.target_type.split('\\').pop()} #${log.target_id}` : '-'}</td>
                                        <td>{log.details?.info ?? '-'}</td>
                                        <td>
                                            <span className={`status-badge status-${log.status.toLowerCase()}`}>{log.status}</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center' }}>Tidak ada data log yang ditemukan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination meta={pagination?.meta} links={pagination?.links} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    );
};

export default ActivityLogTable;