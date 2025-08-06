// src/pages/DashboardPage.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient, { getFiles, downloadFile, deleteFile, toggleFavorite } from '../services/api';
import './DashboardView.css';

// Impor komponen
import Modal from '../components/Modal/Modal';
import FileUploadForm from '../components/FileUploadForm/FileUploadForm';
import ConfirmationModal from '../components/ConfirmationModal/ConfirmationModal';
import Notification from '../components/Notification/Notification';
import FileCard from '../components/FileCard/FileCard';
import { FaPlus, FaDownload, FaTrash, FaStar, FaRegStar } from 'react-icons/fa';

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
    const { user, searchQuery } = useAuth();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [notification, setNotification] = useState({ isOpen: false, message: '', type: '' });
    const [viewMode, setViewMode] = useState('list');

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const response = await getFiles();
            setFiles(response.data);
        } catch (error) {
            console.error('Could not fetch files:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleDownload = async (file) => {
        try {
            const response = await downloadFile(file.id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.nama_file_asli);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            setNotification({ isOpen: true, message: 'Gagal mengunduh file.', type: 'error' });
        }
    };

    const handleDeleteClick = (file) => {
        setFileToDelete(file);
        setIsDeleteModalOpen(true);
    };

    const handleToggleFavorite = async (file) => {
        try {
            setFiles(currentFiles =>
                currentFiles.map(f =>
                    f.id === file.id ? { ...f, is_favorited: !f.is_favorited } : f
                )
            );
            await toggleFavorite(file.id);
        } catch (error) {
            setNotification({ isOpen: true, message: 'Gagal mengubah status favorit.', type: 'error' });
            setFiles(currentFiles =>
                currentFiles.map(f =>
                    f.id === file.id ? { ...f, is_favorited: !f.is_favorited } : f
                )
            );
        }
    };

    const confirmDelete = async () => {
        if (!fileToDelete) return;
        try {
            await deleteFile(fileToDelete.id);
            setNotification({ isOpen: true, message: 'File berhasil dipindahkan ke sampah.', type: 'success' });
        } catch (error) {
            setNotification({ isOpen: true, message: 'Gagal menghapus file.', type: 'error' });
        } finally {
            setIsDeleteModalOpen(false);
            setFileToDelete(null);
            fetchFiles();
        }
    };
    
    const handleUploadSuccess = () => {
        setIsUploadModalOpen(false);
        fetchFiles();
        setNotification({ isOpen: true, message: 'File berhasil diunggah!', type: 'success' });
    };

    const closeNotification = () => {
        setNotification({ isOpen: false, message: '', type: '' });
    };

    const filteredFiles = files.filter(file =>
        file.nama_file_asli.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div>Loading files...</div>;

    return (
        <div className="division-dashboard">
            <div className="dashboard-toolbar">
                <h1>{user?.division?.name || 'File Divisi'}</h1>
                <button className="upload-button" onClick={() => setIsUploadModalOpen(true)}>
                    <FaPlus size={14} /> <span>Tambah File</span>
                </button>
            </div>

            <div className="filter-bar">
                <div className="view-toggle">
                    <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}>List</button>
                    <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}>Grid</button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="file-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Nama</th>
                                <th>Pemilik</th>
                                <th>Tanggal diubah</th>
                                <th>Ukuran file</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFiles.map(file => (
                                <tr key={file.id}>
                                    <td>
                                        <button onClick={() => handleToggleFavorite(file)} className="action-button">
                                            {file.is_favorited ? <FaStar color="#ffc107" /> : <FaRegStar color="#6c757d" />}
                                        </button>
                                    </td>
                                    <td>{file.nama_file_asli}</td>
                                    <td>{file.uploader ? file.uploader.name : '-'}</td>
                                    <td>{new Date(file.updated_at).toLocaleDateString('id-ID')}</td>
                                    <td>{(file.ukuran_file / 1024 / 1024).toFixed(2)} MB</td>
                                    <td>
                                        <button onClick={() => handleDownload(file)} className="action-button">
                                            <FaDownload color="#0d6efd" />
                                        </button>
                                        {(user?.role === 'admin_devisi' || (user?.role === 'user_devisi' && user?.id === file.uploader_id)) && (
                                            <button onClick={() => handleDeleteClick(file)} className="action-button">
                                                <FaTrash color="#dc3545" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="stats-grid">
                    {filteredFiles.map(file => (
                        <FileCard key={file.id} file={file} />
                    ))}
                </div>
            )}

            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload File Baru">
                <FileUploadForm onSuccess={handleUploadSuccess} />
            </Modal>
            
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                message={`Apakah Anda yakin ingin menghapus file "${fileToDelete?.nama_file_asli}"?`}
            />

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