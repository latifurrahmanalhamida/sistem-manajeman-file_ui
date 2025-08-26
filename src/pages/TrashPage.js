// src/pages/TrashPage.js

import React, { useState, useEffect } from 'react';
import { getTrashedFiles, restoreFile, forceDeleteFile } from '../services/api';
import './DashboardView.css';
import './TrashPage.css';

// Impor komponen
import Modal from '../components/Modal/Modal';
import ConfirmationModal from '../components/ConfirmationModal/ConfirmationModal';
import Notification from '../components/Notification/Notification';
import { FaTrash, FaUndo, FaSave, FaTimes } from 'react-icons/fa';

const TrashPage = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    // State untuk modal konfirmasi
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, file: null });
    const [overwriteModal, setOverwriteModal] = useState({ isOpen: false, file: null, message: '' });
    const [renameModal, setRenameModal] = useState({ isOpen: false, file: null });
    const [newName, setNewName] = useState('');

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

    const closeNotification = () => setNotification({ isOpen: false, message: '', type: '' });

    // --- Logika Hapus Permanen ---
    const handleDeleteClick = (file) => {
        setDeleteModal({ isOpen: true, file });
    };

    const confirmForceDelete = async () => {
        if (!deleteModal.file) return;
        try {
            await forceDeleteFile(deleteModal.file.id);
            setNotification({ isOpen: true, message: 'File berhasil dihapus permanen.', type: 'success' });
            fetchTrashedFiles();
        } catch (error) {
            setNotification({ isOpen: true, message: 'Gagal menghapus file.', type: 'error' });
        } finally {
            setDeleteModal({ isOpen: false, file: null });
        }
    };

    // --- Logika Restore & Konflik ---
    const handleRestoreClick = async (file) => {
        executeRestore(file.id);
    };

    const handleRename = () => {
        setOverwriteModal({ isOpen: false, file: null, message: '' });
        setRenameModal({ isOpen: true, file: overwriteModal.file });
    };

    const executeRestore = async (fileId, options = {}) => {
        try {
            await restoreFile(fileId, options);
            setNotification({ isOpen: true, message: 'File berhasil dipulihkan.', type: 'success' });
            fetchTrashedFiles();
            setOverwriteModal({ isOpen: false, file: null, message: '' });
            setRenameModal({ isOpen: false, file: null });
        } catch (error) {
            if (error.response && error.response.status === 409) {
                const file = files.find(f => f.id === fileId);
                setNewName(file.nama_file_asli);
                setOverwriteModal({ isOpen: true, file: file, message: error.response.data.message });
            } else {
                setNotification({ isOpen: true, message: 'Gagal memulihkan file.', type: 'error' });
                setOverwriteModal({ isOpen: false, file: null, message: '' });
            }
        }
    };

    const confirmOverwrite = () => {
        executeRestore(overwriteModal.file.id, { overwrite: true });
    };

    const confirmRename = () => {
        if (!newName.trim()) {
            setNotification({ isOpen: true, message: 'Nama file tidak boleh kosong.', type: 'error' });
            return;
        }
        if (newName.trim() === renameModal.file.nama_file_asli) {
            setNotification({ isOpen: true, message: 'Nama file masih sama, silahkan diubah kembali.', type: 'error' });
            return;
        }
        executeRestore(renameModal.file.id, { newName: newName });
    };

    if (loading) return <div>Loading trashed files...</div>;

    return (
        <div className="division-dashboard">
            <div className="dashboard-toolbar"><h1>Sampah</h1></div>
            <div className="table-wrapper">
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
                                    <button onClick={() => handleRestoreClick(file)} className="action-button restore-button">Pulihkan</button>
                                    <button onClick={() => handleDeleteClick(file)} className="action-button delete-button">Hapus Permanen</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, file: null })}
                onConfirm={confirmForceDelete}
                message={`PERINGATAN: File "${deleteModal.file?.nama_file_asli}" akan dihapus permanen. Lanjutkan?`}
                confirmText="Hapus Permanen"
                isDanger={true}
                confirmIcon={FaTrash}
            />

            <ConfirmationModal
                isOpen={overwriteModal.isOpen}
                onClose={() => setOverwriteModal({ isOpen: false, file: null, message: '' })}
                onConfirm={confirmOverwrite}
                message={overwriteModal.message}
                confirmText="Timpa File"
                isDanger={true}
                confirmIcon={FaSave}
                customActions={
                    <button onClick={handleRename} className="modal-button cancel-button">
                        <FaUndo /> Ganti Nama & Pulihkan
                    </button>
                }
            />

            <Modal isOpen={renameModal.isOpen} onClose={() => setRenameModal({ isOpen: false, file: null })} title="Ganti Nama & Pulihkan">
                <div>
                    <p>File akan dipulihkan dengan nama baru:</p>
                    <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="form-input w-full mt-2"
                    />
                    <div className="confirmation-modal-actions">
                        <button type="button" className="modal-button cancel-button" onClick={() => setRenameModal({ isOpen: false, file: null })}>
                            <FaTimes /> Batal
                        </button>
                        <button type="button" className="modal-button confirm-button" onClick={confirmRename}>
                            <FaSave /> Simpan dengan Nama Baru
                        </button>
                    </div>
                </div>
            </Modal>

            {notification.isOpen && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={closeNotification}
                />
            )}
        </div>
    );
};

export default TrashPage;