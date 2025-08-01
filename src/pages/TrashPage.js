// src/pages/TrashPage.js

import React, { useState, useEffect } from 'react';
import { getTrashedFiles, restoreFile, forceDeleteFile } from '../services/api';
import './DashboardView.css';
import './TrashPage.css'; // Impor file CSS khusus untuk halaman ini

// Impor komponen modal dan notifikasi
import ConfirmationModal from '../components/ConfirmationModal/ConfirmationModal';
import Notification from '../components/Notification/Notification';

const TrashPage = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    // State untuk mengontrol modal dan notifikasi
    const [modalState, setModalState] = useState({ isOpen: false, file: null, action: null });
    const [notification, setNotification] = useState({ isOpen: false, message: '', type: '' });

    const fetchTrashedFiles = async () => {
        setLoading(true);
        try {
            const response = await getTrashedFiles();
            setFiles(response.data);
        } catch (error) {
            console.error('Could not fetch trashed files:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrashedFiles();
    }, []);

    // Membuka modal konfirmasi
    const handleActionClick = (file, action) => {
        setModalState({ isOpen: true, file, action });
    };

    // Menutup semua modal/notifikasi
    const closeModals = () => {
        setModalState({ isOpen: false, file: null, action: null });
        setNotification({ isOpen: false, message: '', type: '' });
    };

    // Mengeksekusi aksi setelah konfirmasi
    const handleConfirm = async () => {
        const { file, action } = modalState;
        if (!file || !action) return;

        try {
            if (action === 'restore') {
                await restoreFile(file.id);
                setNotification({ isOpen: true, message: 'File berhasil dipulihkan.', type: 'success' });
            } else if (action === 'forceDelete') {
                await forceDeleteFile(file.id);
                setNotification({ isOpen: true, message: 'File berhasil dihapus permanen.', type: 'success' });
            }
        } catch (error) {
            setNotification({ isOpen: true, message: `Gagal melakukan aksi.`, type: 'error' });
        } finally {
            setModalState({ isOpen: false, file: null, action: null });
            fetchTrashedFiles(); // Muat ulang daftar file
        }
    };

    if (loading) return <div>Loading trashed files...</div>;

    const modalMessages = {
        restore: `Anda yakin ingin memulihkan file "${modalState.file?.nama_file_asli}"?`,
        forceDelete: `PERINGATAN: File "${modalState.file?.nama_file_asli}" akan dihapus permanen. Lanjutkan?`
    };

    return (
        <div className="division-dashboard">
            <div className="dashboard-toolbar">
                <h1>Sampah</h1>
            </div>
            <div className="file-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Pemilik</th>
                            <th>Tanggal Dihapus</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map(file => (
                            <tr key={file.id}>
                                <td>{file.nama_file_asli}</td>
                                <td>{file.uploader.name}</td>
                                <td>{new Date(file.deleted_at).toLocaleDateString('id-ID')}</td>
                                <td>
                                    <button 
                                        onClick={() => handleActionClick(file, 'restore')} 
                                        className="action-button restore-button"
                                    >
                                        Pulihkan
                                    </button>
                                    <button 
                                        onClick={() => handleActionClick(file, 'forceDelete')}
                                        className="action-button delete-button"
                                    >
                                        Hapus Permanen
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={closeModals}
                onConfirm={handleConfirm}
                message={modalMessages[modalState.action] || ''}
            />

            {notification.isOpen && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={closeModals}
                />
            )}
        </div>
    );
};

export default TrashPage;