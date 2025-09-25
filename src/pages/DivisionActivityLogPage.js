import React, { useState, useEffect, useCallback } from 'react';
import { getDivisionActivityLogs } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DivisionActivityLogPage.css';
import Pagination from '../components/Dashboard/Pagination'; // Assuming Pagination component path
import { FaPlus, FaEdit, FaTrash, FaFileAlt } from 'react-icons/fa';

const getActionIcon = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes('created') || desc.includes('membuat') || desc.includes('mengunggah')) {
        return <div className="timeline-icon icon-create"><FaPlus /></div>;
    }
    if (desc.includes('updated') || desc.includes('mengubah')) {
        return <div className="timeline-icon icon-update"><FaEdit /></div>;
    }
    if (desc.includes('deleted') || desc.includes('menghapus')) {
        return <div className="timeline-icon icon-delete"><FaTrash /></div>;
    }
    return <div className="timeline-icon icon-default"><FaFileAlt /></div>;
};

const renderLogDetails = (details) => {
    if (!details) {
        return '';
    }
    if (typeof details === 'object' && details !== null && details.info) {
        return details.info;
    }
    if (typeof details === 'object' && details !== null) {
        return JSON.stringify(details);
    }
    return details;
};

const DivisionActivityLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const [pagination, setPagination] = useState(null);

    // Filter states
    const [textFilter, setTextFilter] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const fetchLogs = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getDivisionActivityLogs(params);
            const responseData = response.data;
            setLogs(responseData.data || []);
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
    }, []);

    useEffect(() => {
        if (user) {
            fetchLogs();
        }
    }, [user, fetchLogs]);

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
        fetchLogs(params);
    };

    const handleResetFilter = () => {
        setStartDate(null);
        setEndDate(null);
        setTextFilter('');
        fetchLogs();
    };

    const handlePageChange = (url) => {
        if (!url) return;
        const urlParams = new URLSearchParams(new URL(url).search);
        const page = urlParams.get('page');
        const currentParams = {
            start_date: formatDateForAPI(startDate),
            end_date: formatDateForAPI(endDate),
            page: page
        };
        fetchLogs(currentParams);
    };

    const filteredLogs = logs.filter(log =>
        (log.causer?.name?.toLowerCase() || 'pengguna tidak dikenal').includes(textFilter.toLowerCase()) ||
        (log.description?.toLowerCase() || '').includes(textFilter.toLowerCase()) ||
        (log.properties?.details?.toString().toLowerCase() || '').includes(textFilter.toLowerCase())
    );

    if (loading) {
        return <div className="activity-log-page"><p>Memuat log aktivitas...</p></div>;
    }

    if (error) {
        return <div className="activity-log-page"><p className="error-message">{error}</p></div>;
    }

    return (
        <div className="activity-log-page">
            <div className="log-card">
                <div className="log-card-header">
                    <h2>{`Log Aktivitas Divisi ${user?.division?.name || ''}`}</h2>
                    <div className="filter-controls">
                        <div className="search-group">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"></path></svg>
                            <input
                                type="text"
                                className="filter-input"
                                placeholder="Cari aktivitas..."
                                value={textFilter}
                                onChange={(e) => setTextFilter(e.target.value)}
                            />
                        </div>
                        <div className="actions-group">
                            <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} selectsStart startDate={startDate} endDate={endDate} dateFormat="dd/MM/yyyy" placeholderText="Tanggal Mulai" className="date-input" isClearable />
                            <span>-</span>
                            <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} selectsEnd startDate={startDate} endDate={endDate} minDate={startDate} dateFormat="dd/MM/yyyy" placeholderText="Tanggal Selesai" className="date-input" isClearable />
                            <button className="btn btn-primary" onClick={handleFilterSubmit}>Filter</button>
                            <button className="btn btn-secondary" onClick={handleResetFilter}>Reset</button>
                        </div>
                    </div>
                </div>
                <div className="log-card-body">
                    {filteredLogs.length > 0 ? (
                        <>
                            <div className="timeline">
                                {filteredLogs.map(log => (
                                    <div key={log.id} className="timeline-item">
                                        {getActionIcon(log.description)}
                                        <div className="timeline-content">
                                            <div className="timeline-header">
                                                <span className="timeline-user">{log.causer?.name || 'Sistem'}</span>
                                                <span className="timeline-action">{log.description}</span>
                                            </div>
                                            <div className="timeline-body">
                                                {renderLogDetails(log.properties?.details)}
                                            </div>
                                            <div className="timeline-footer">
                                                {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="pagination-container">
                               <Pagination meta={pagination?.meta} links={pagination?.links} onPageChange={handlePageChange} />
                            </div>
                        </>
                    ) : (
                        <p className="no-logs-message">Tidak ada aktivitas yang tercatat sesuai filter.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DivisionActivityLogPage;
