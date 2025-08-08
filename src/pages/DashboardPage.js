import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient, { getFiles, downloadFile, deleteFile, toggleFavorite, uploadFile } from '../services/api';
import './DashboardView.css';

// Impor komponen
import Modal from '../components/Modal/Modal';
import FileUploadForm from '../components/FileUploadForm/FileUploadForm';
import ConfirmationModal from '../components/ConfirmationModal/ConfirmationModal';
import Notification from '../components/Notification/Notification';
import FileCard from '../components/FileCard/FileCard';
import { FaPlus, FaDownload, FaTrash, FaStar, FaRegStar, FaEye } from 'react-icons/fa';
import FilePreviewModal from '../components/FilePreviewModal/FilePreviewModal';

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
    const { user, searchQuery, loading: authLoading } = useAuth();
    const [files, setFiles] = useState([]);
    const [isFilesLoading, setIsFilesLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [notification, setNotification] = useState({ isOpen: false, message: '', type: '' });
    const [viewMode, setViewMode] = useState('list');
    const [previewFile, setPreviewFile] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // State untuk overwrite
    const [isOverwriteModalOpen, setOverwriteModalOpen] = useState(false);
    const [pendingFile, setPendingFile] = useState(null);

    const fetchFiles = async () => {
        setIsFilesLoading(true);
        try {
            const response = await getFiles();
            setFiles(response.data);
        } catch (error) {
            console.error('Could not fetch files:', error);
        } finally {
            setIsFilesLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && user) {
            fetchFiles();
        }
    }, [authLoading, user]);

    const handleDownload = async (file) => {
        try {
            const response = await downloadFile(file.id);
            const url = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.nama_file_asli);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error.response ? error.response.data : error.message);
            setNotification({ isOpen: true, message: 'Gagal mengunduh file.', type: 'error' });
        }
    };

    const handleDeleteClick = (file) => {
        setFileToDelete(file);
        setIsDeleteModalOpen(true);
    };

    const handleToggleFavorite = async (file) => {
        try {
            await toggleFavorite(file.id);
            setFiles(currentFiles =>
                currentFiles.map(f =>
                    f.id === file.id ? { ...f, is_favorited: !f.is_favorited } : f
                )
            );
        } catch (error) {
            console.error('Favorite toggle error:', error.response ? error.response.data : error.message);
            setNotification({ isOpen: true, message: 'Gagal mengubah status favorit.', type: 'error' });
        }
    };
    
    const handlePreview = async (file) => {
        try {
            const response = await downloadFile(file.id);
            const fileUrl = window.URL.createObjectURL(new Blob([response.data], { type: file.tipe_file }));
            setPreviewFile({ url: fileUrl, mime: file.tipe_file, name: file.nama_file_asli });
            setIsPreviewOpen(true);
        } catch (error) {
            console.error('Preview error:', error.response ? error.response.data : error.message);
            setNotification({ isOpen: true, message: 'Gagal memuat pratinjau.', type: 'error' });
        }
    };

    const closePreview = () => {
        if (previewFile && previewFile.url) {
            window.URL.revokeObjectURL(previewFile.url);
        }
        setIsPreviewOpen(false);
        setPreviewFile(null);
    };

    const confirmDelete = async () => {
        if (!fileToDelete) return;
        try {
            await deleteFile(fileToDelete.id);
            setNotification({ isOpen: true, message: 'File berhasil dipindahkan ke sampah.', type: 'success' });
            fetchFiles();
        } catch (error) {
            console.error('Delete error:', error.response ? error.response.data : error.message);
            setNotification({ isOpen: true, message: 'Gagal menghapus file.', type: 'error' });
        } finally {
            setIsDeleteModalOpen(false);
            setFileToDelete(null);
        }
    };
    
    const handleUploadComplete = () => {
        setIsUploadModalOpen(false);
        fetchFiles();
        setNotification({ isOpen: true, message: 'File berhasil diunggah!', type: 'success' });
    };

    const handleConflict = (file) => {
        setPendingFile(file);
        setIsUploadModalOpen(false); // Tutup modal upload
        setOverwriteModalOpen(true); // Buka modal konfirmasi timpa
    };

    const confirmOverwrite = async () => {
        if (!pendingFile) return;

        const formData = new FormData();
        formData.append('file', pendingFile);

        try {
            await uploadFile(formData, { overwrite: true });
            setNotification({ isOpen: true, message: 'File berhasil ditimpa!', type: 'success' });
            fetchFiles();
        } catch (error) {
            console.error('Overwrite error:', error.response ? error.response.data : error.message);
            setNotification({ isOpen: true, message: 'Gagal menimpa file.', type: 'error' });
        } finally {
            setOverwriteModalOpen(false);
            setPendingFile(null);
        }
    };

    const closeNotification = () => {
        setNotification({ isOpen: false, message: '', type: '' });
    };

    const filteredFiles = files.filter(file =>
        file.nama_file_asli.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (authLoading) {
        return <div>Loading user data...</div>;
    }

    if (isFilesLoading) {
        return <div>Loading files...</div>;
    }

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
                                        <button onClick={() => handleToggleFavorite(file)} className="action-button" title="Favorite">
                                            {file.is_favorited ? <FaStar color="#ffc107" /> : <FaRegStar color="#6c757d" />}
                                        </button>
                                    </td>
                                    <td>
                                        {file.nama_file_asli}
                                    </td>
                                    <td>{file.uploader ? file.uploader.name : '-'}</td>
                                    <td>{new Date(file.updated_at).toLocaleDateString('id-ID')}</td>
                                    <td>{(file.ukuran_file / 1024 / 1024).toFixed(2)} MB</td>
                                    <td>
                                        <button onClick={() => handlePreview(file)} className="action-button" title="Preview">
                                            <FaEye color="#0dcaf0" />
                                        </button>
                                        <button onClick={() => handleDownload(file)} className="action-button" title="Download">
                                            <FaDownload color="#0d6efd" />
                                        </button>
                                        <button onClick={() => handleDeleteClick(file)} className="action-button" title="Delete">
                                            <FaTrash color="#dc3545" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="stats-grid">
                    {filteredFiles.map(file => (
                        <FileCard 
                            key={file.id} 
                            file={file} 
                            onPreview={handlePreview} 
                            onDownload={handleDownload} 
                            onDelete={handleDeleteClick} 
                            onToggleFavorite={handleToggleFavorite} 
                        />
                    ))}
                </div>
            )}

            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload File Baru">
                <FileUploadForm onUploadComplete={handleUploadComplete} onConflict={handleConflict} />
            </Modal>
            
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                message={`Apakah Anda yakin ingin menghapus file "${fileToDelete?.nama_file_asli}"?`}
            />

            <ConfirmationModal
                isOpen={isOverwriteModalOpen}
                onClose={() => setOverwriteModalOpen(false)}
                onConfirm={confirmOverwrite}
                title="Konfirmasi Timpa File"
                message={`File dengan nama "${pendingFile?.name}" sudah ada. Apakah Anda yakin ingin menggantinya?`}
                confirmText="Timpa File"
                cancelText="Batal"
            />

            {notification.isOpen && (
                <Notification 
                    message={notification.message}
                    type={notification.type}
                    onClose={closeNotification} 
                />
            )}

           <FilePreviewModal
                isOpen={isPreviewOpen}
                onClose={closePreview}
                fileUrl={previewFile?.url}
                mimeType={previewFile?.mime}
                fileName={previewFile?.name}
            />
        </div>
    );
};

// --- Komponen Utama DashboardPage ---
const DashboardPage = () => {
    const { user } = useAuth();
    // Perbaikan: Periksa user.role.name, bukan user.role
    if (user?.role?.name === 'super_admin') {
        return <SuperAdminDashboard />;
    } else {
        return <DivisionUserDashboard />;
    }
};

export default DashboardPage;
