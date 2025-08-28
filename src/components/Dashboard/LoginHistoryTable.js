import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api'; 
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './LoginHistoryTable.css'; 
import Modal from '../Modal/Modal'; 

const LoginHistoryTable = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // State untuk mengelola semua modal
    const [modalState, setModalState] = useState({
        showPurgeOptions: false,
        showFinalConfirm: false,
        showNotification: false,
        message: '',
        isError: false,
    });
    const [purgeRange, setPurgeRange] = useState('');
    const [itemsToDeleteCount, setItemsToDeleteCount] = useState(0);

    const fetchHistory = useCallback(async (page = 1, params = {}) => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/login-history?page=${page}`, { params });
            setHistory(response.data.data);
            setPagination({ currentPage: response.data.current_page, lastPage: response.data.last_page });
        } catch (err) {
            setModalState({ showNotification: true, message: 'Gagal memuat data. Coba lagi nanti.', isError: true });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);
    
    const openPurgeOptionsModal = () => setModalState({ showPurgeOptions: true });
    
    const closeAllModals = () => {
        setModalState({ showPurgeOptions: false, showFinalConfirm: false, showNotification: false });
        setPurgeRange('');
        setItemsToDeleteCount(0);
    };

    const handleInitialPurgeAttempt = async () => {
        if (!purgeRange) {
            setModalState({ ...modalState, showNotification: true, message: 'Silakan pilih rentang waktu terlebih dahulu.', isError: true });
            return;
        }
        try {
            const response = await api.get('/admin/login-history/count-purge', { params: { range: purgeRange } });
            const count = response.data.count;
            setItemsToDeleteCount(count);

            if (count > 0) {
                setModalState({ showPurgeOptions: false, showFinalConfirm: true });
            } else {
                setModalState({ showPurgeOptions: false, showNotification: true, message: 'Tidak ada riwayat login untuk rentang yang dipilih.', isError: false });
            }
        } catch (err) {
            setModalState({ showPurgeOptions: false, showNotification: true, message: 'Gagal menghitung data.', isError: true });
        }
    };

    const handleFinalPurge = async () => {
        try {
            const response = await api.delete('/admin/login-history', { data: { range: purgeRange } });
            setModalState({ showFinalConfirm: false, showNotification: true, message: response.data.message, isError: false });
            fetchHistory();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Gagal menghapus riwayat.';
            setModalState({ showFinalConfirm: false, showNotification: true, message: errorMsg, isError: true });
        }
    };
    
    const formatDateForAPI = (date) => { if (!date) return null; const d = new Date(date); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
    const handleFilterSubmit = () => { const params = { start_date: formatDateForAPI(startDate), end_date: formatDateForAPI(endDate) }; fetchHistory(1, params); };
    const handleResetFilter = () => { setStartDate(null); setEndDate(null); fetchHistory(); };
    const handlePageChange = (newPage) => { if (newPage >= 1 && newPage <= pagination.lastPage) { const params = { start_date: formatDateForAPI(startDate), end_date: formatDateForAPI(endDate) }; fetchHistory(newPage, params); } };

    return (
        <div className="activity-log-table-container">
            <div className="filter-controls mb-4">
                <div className="date-filter-group">
                    <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} selectsStart startDate={startDate} endDate={endDate} dateFormat="dd/MM/yyyy" placeholderText="Tanggal Mulai" className="date-input" isClearable />
                    <span>-</span>
                    <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} selectsEnd startDate={startDate} endDate={endDate} minDate={startDate} dateFormat="dd/MM/yyyy" placeholderText="Tanggal Selesai" className="date-input" isClearable />
                    <button className="btn btn-primary" onClick={handleFilterSubmit}>Filter</button>
                    <button className="btn btn-secondary" onClick={handleResetFilter}>Reset</button>
                    <button className="btn btn-danger" onClick={openPurgeOptionsModal}>Bersihkan Riwayat</button>
                </div>
            </div>

            {loading ? <p>Memuat...</p> : (
                <>
                    <table className="log-table">
                        <thead>
                            <tr>
                                <th>Nama Pengguna</th>
                                <th>Aksi</th>
                                <th>Alamat IP</th>
                                <th>Perangkat / Browser</th>
                                <th>Waktu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length > 0 ? (
                                history.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.user?.name}</td>
                                        <td><span className={`action-badge ${item.action}`}>{item.action}</span></td>
                                        <td>{item.ip_address}</td>
                                        <td>{item.parsed_agent?.browser} on {item.parsed_agent?.platform}</td>
                                        <td>{format(new Date(item.created_at), 'd MMMM yyyy, HH:mm:ss', { locale: id })}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5">Tidak ada riwayat login.</td></tr>
                            )}
                        </tbody>
                    </table>
                    <div className="pagination-controls">
                        <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={!pagination.currentPage || pagination.currentPage === 1}>&laquo; Sebelumnya</button>
                        <span>Halaman {pagination.currentPage || 1} dari {pagination.lastPage || 1}</span>
                        <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={!pagination.currentPage || pagination.currentPage === pagination.lastPage}>Selanjutnya &raquo;</button>
                    </div>
                </>
            )}

            {/* Modal 1: Pilih Rentang */}
            <Modal isOpen={modalState.showPurgeOptions} onClose={closeAllModals} title="Bersihkan Riwayat Login">
                <p>Pilih rentang data yang ingin Anda hapus secara permanen.</p>
                <select onChange={(e) => setPurgeRange(e.target.value)} className="form-select" defaultValue="">
                    <option value="">-- Pilih Rentang Waktu --</option>
                    <option value="1-month">Lebih lama dari 1 bulan</option>
                    <option value="6-months">Lebih lama dari 6 bulan</option>
                    <option value="1-year">Lebih lama dari 1 tahun</option>
                    <option value="all">Hapus Semua Riwayat</option>
                </select>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={closeAllModals}>Batal</button>
                    <button className="btn btn-danger" onClick={handleInitialPurgeAttempt} disabled={!purgeRange}>Lanjutkan</button>
                </div>
            </Modal>

            {/* Modal 2: Konfirmasi Final */}
            <Modal isOpen={modalState.showFinalConfirm} onClose={closeAllModals} title="Konfirmasi Penghapusan Permanen">
                <p>
                    Apakah Anda yakin ingin menghapus <strong>{itemsToDeleteCount} data</strong> riwayat login secara permanen?
                </p>
                <p style={{ fontWeight: 'bold', color: '#dc3545' }}>Aksi ini tidak dapat dibatalkan!</p>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={closeAllModals}>Batal</button>
                    <button className="btn btn-danger" onClick={handleFinalPurge}>Ya, Hapus {itemsToDeleteCount} Data</button>
                </div>
            </Modal>

            {/* Modal 3: Notifikasi Sukses/Error */}
            <Modal isOpen={modalState.showNotification} onClose={closeAllModals} title={modalState.isError ? "Terjadi Kesalahan" : "Berhasil"}>
                <p>{modalState.message}</p>
                <div className="modal-footer">
                    <button className="btn btn-primary" onClick={closeAllModals}>Tutup</button>
                </div>
            </Modal>
        </div>
    );
};

export default LoginHistoryTable;