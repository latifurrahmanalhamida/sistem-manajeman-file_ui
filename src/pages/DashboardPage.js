import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { downloadFile, deleteFile, toggleFavorite, uploadFile, renameFile } from '../services/api';
import { getDivisionsWithFolders } from '../services/api';
import FolderCard from '../components/FolderCard/FolderCard';
import './DashboardView.css';

// Impor komponen
import Modal from '../components/Modal/Modal';
import FileUploadForm from '../components/FileUploadForm/FileUploadForm';
import ConfirmationModal from '../components/ConfirmationModal/ConfirmationModal';
import Notification from '../components/Notification/Notification';
import FileCard from '../components/FileCard/FileCard';
import FilePreviewModal from '../components/FilePreviewModal/FilePreviewModal';
import SortControls from '../components/SortControls/SortControls'; // Import SortControls

import { FaPlus, FaDownload, FaTrash, FaStar, FaRegStar, FaEye, FaTimes, FaSave, FaPencilAlt } from 'react-icons/fa';
import getFileIcon from '../utils/fileIcons';
import { truncateFilename } from '../utils/formatters';


// --- Komponen Dashboard untuk Super Admin ---

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const [divisions, setDivisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [notification, setNotification] = useState({ isOpen: false, message: '', type: '' });

    useEffect(() => {
        const fetchDivisions = async () => {
            try {
                const response = await getDivisionsWithFolders();
                setDivisions(response.data);
            } catch (error) {
                console.error('Could not fetch divisions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDivisions();
    }, []);

    const handleUploadComplete = () => {
        setIsUploadModalOpen(false);
        setNotification({ isOpen: true, message: 'File berhasil diunggah!', type: 'success' });
    };

    if (loading) return <div>Loading data divisi...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Super Admin Dashboard</h1>
                <p>Selamat Datang, <strong>{user?.name}</strong></p>
                <button className="upload-button" onClick={() => setIsUploadModalOpen(true)}>
                    <FaPlus size={14} /> <span>Upload File ke Folder Manapun</span>
                </button>
            </div>
            {divisions.map(division => (
                <section key={division.id} style={{ marginBottom: '2rem' }}>
                    <h2>{division.name}</h2>
                    <div className="folders-grid">
                        {division.folders && division.folders.length > 0 ? (
                            division.folders.map(folder => (
                                <FolderCard key={folder.id} folder={folder} />
                            ))
                        ) : (
                            <p style={{ color: '#888' }}>Belum ada folder di divisi ini.</p>
                        )}
                    </div>
                </section>
            ))}

            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload File ke Folder Manapun">
                <div>
                    <label htmlFor="folder-select">Pilih Folder Tujuan:</label>
                    <select id="folder-select" value={selectedFolderId || ''} onChange={e => setSelectedFolderId(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }}>
                        <option value="">-- Pilih Folder --</option>
                        {divisions.map(division => (
                            division.folders && division.folders.map(folder => (
                                <option key={folder.id} value={folder.id}>{division.name} - {folder.name}</option>
                            ))
                        ))}
                    </select>
                    <FileUploadForm onUploadComplete={handleUploadComplete} currentFolderId={selectedFolderId} />
                </div>
            </Modal>

            {notification.isOpen && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ isOpen: false, message: '', type: '' })}
                />
            )}
        </div>
    );
};


// --- Komponen Dashboard untuk Admin/User Devisi ---
// Helper function untuk format ukuran bytes

const DivisionUserDashboard = () => {
    const { user, searchQuery, loading: authLoading } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentFolderId, setCurrentFolderId] = useState(null);
    // const [breadcrumbs, setBreadcrumbs] = useState([]);
    // const [currentFolder, setCurrentFolder] = useState(null);
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const [isFilesLoading, setIsFilesLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFolderId, setSelectedFolderId] = useState(null); // Untuk dropdown folder tujuan upload
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [notification, setNotification] = useState({ isOpen: false, message: '', type: '' });
    const [viewMode, setViewMode] = useState('list');
    const [previewFile, setPreviewFile] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // State untuk modal overwrite dan rename
    const [overwriteModal, setOverwriteModal] = useState({ isOpen: false, file: null, message: '' });
    const [renameModal, setRenameModal] = useState({ isOpen: false, file: null, newName: '' });
    const [sortBy, setSortBy] = useState('updated_at'); // Default sort by updated_at
    const [sortOrder, setSortOrder] = useState('desc'); // Default sort order descending
    const [selectedFileIds, setSelectedFileIds] = useState([]); // New state for selected file IDs
    // const rootLabel = user?.division?.name ? `${user.division.name} Drive` : 'My Drive';

    const fetchFiles = React.useCallback(async () => {
        setIsFilesLoading(true);
        try {
            const folder_id = searchParams.get('folder_id');
            const url = folder_id ? `/files?folder_id=${folder_id}` : '/files';
            const res = await fetch(process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}${url}` : `http://localhost:8000/api${url}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });
            const data = await res.json();
            setFolders(data.folders || []);
            setFiles(data.files || []);
            setBreadcrumbs(data.breadcrumbs || []);
        } catch (error) {
            console.error('Could not fetch items:', error);
        } finally {
            setIsFilesLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!authLoading && user) {
            // Sinkronkan state currentFolderId dengan URL
            const fid = searchParams.get('folder_id');
            setCurrentFolderId(fid ? parseInt(fid, 10) : null);
            fetchFiles();
        }
    }, [authLoading, user, searchParams, fetchFiles]);

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
    
    // --- FUNGSI BARU DIMASUKKAN DI SINI ---
    const handlePreview = async (file) => {
        try {
            console.log(`Mencoba memuat pratinjau untuk file: ${file.nama_file_asli}`);
            const response = await downloadFile(file.id);

            // Defensive Check 1: Pastikan respons ada
            if (!response) {
                throw new Error("Tidak ada respons dari server.");
            }

            // Defensive Check 2: Pastikan respons berisi data biner (Blob)
            if (!(response.data instanceof Blob)) {
                 throw new Error("Server tidak mengembalikan data file. Kemungkinan terjadi error di backend.");
            }

            // Defensive Check 3: Pastikan blob tidak kosong
            if (response.data.size === 0) {
                throw new Error("Data file kosong atau tidak valid dari server.");
            }
            
            console.log("Data file berhasil diterima, membuat URL sementara...");
            const fileUrl = window.URL.createObjectURL(response.data);
            
            setPreviewFile({ url: fileUrl, mime: file.tipe_file, name: file.nama_file_asli });
            setIsPreviewOpen(true);

        } catch (error) {
            // Tangani semua kemungkinan error di sini
            console.error('GAGAL MEMUAT PRATINJAU:', error);
            
            let errorMessage = 'Gagal memuat data pratinjau. Silakan coba lagi.';
            if (error.response) {
                errorMessage = `Gagal memuat pratinjau: Server merespons dengan status ${error.response.status}.`;
            } else {
                errorMessage = `Gagal memuat pratinjau: ${error.message}`;
            }

            setNotification({ isOpen: true, message: errorMessage, type: 'error' });
        }
    };

    const closePreview = () => {
        if (previewFile && previewFile.url) {
            window.URL.revokeObjectURL(previewFile.url);
        }
        setIsPreviewOpen(false);
        setPreviewFile(null);
    };
    // --- AKHIR DARI FUNGSI BARU ---

    const confirmDelete = async () => {
        if (!fileToDelete) return;
        try {
            await deleteFile(fileToDelete.id);
            setNotification({ isOpen: true, message: 'File berhasil dipindahkan ke sampah.', type: 'success' });
            fetchFiles(); // Refresh list file
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

    const handleConflict = (file, message) => {
        setOverwriteModal({ isOpen: true, file: file, message: message });
        setIsUploadModalOpen(false); // Tutup modal upload
    };

    const handleRenameClick = (file) => {
        // Perbaikan: Cari file dari files berdasarkan nama asli jika id tidak ada
        let targetFile = file;
        if (!file || !file.id) {
            // Cek jika file punya properti file.name (dari upload/overwrite)
            const fileName = file?.file?.name || file?.name;
            if (fileName) {
                targetFile = files.find(f => f.nama_file_asli === fileName);
            }
        }
        if (!targetFile || !targetFile.id) {
            setNotification({ isOpen: true, message: 'File tidak ditemukan untuk diubah nama. Silakan refresh halaman setelah replace file.', type: 'error' });
            return;
        }
        setRenameModal({ isOpen: true, file: targetFile, newName: targetFile.nama_file_asli });
    };

    const confirmRename = async () => {
        if (!renameModal.file || !renameModal.newName) return;
        try {
            const response = await renameFile(renameModal.file.id, renameModal.newName);
            setFiles(currentFiles =>
                currentFiles.map(f => (f.id === renameModal.file.id ? response.data.file : f))
            );
            setNotification({ isOpen: true, message: 'Nama file berhasil diubah.', type: 'success' });
            setRenameModal({ isOpen: false, file: null, newName: '' });
        } catch (error) {
            const message = error.response?.data?.message || 'Gagal mengubah nama file.';
            setNotification({ isOpen: true, message, type: 'error' });
        }
    };

    const handleSortChange = (column, order) => {
        setSortBy(column);
        setSortOrder(order);
    };

    const handleFileSelect = (fileId) => {
        setSelectedFileIds(prevSelected => {
            if (prevSelected.includes(fileId)) {
                return prevSelected.filter(id => id !== fileId);
            } else {
                return [...prevSelected, fileId];
            }
        });
    };

    const handleSelectAllClick = () => {
        const allFileIds = sortedAndFilteredFiles.map(file => file.id);
        setSelectedFileIds(allFileIds);
    };

    const handleBulkDownload = () => {
        selectedFileIds.forEach(fileId => {
            const fileToDownload = files.find(f => f.id === fileId);
            if (fileToDownload) {
                handleDownload(fileToDownload);
            }
        });
    };

    const handleBulkDelete = () => {
        setIsBulkDeleteModalOpen(true);
    };

    const confirmBulkDelete = async () => {
        const promises = selectedFileIds.map(id => deleteFile(id));
        try {
            await Promise.all(promises);
            setNotification({ isOpen: true, message: `${selectedFileIds.length} file berhasil dipindahkan ke sampah.`, type: 'success' });
            fetchFiles();
            setSelectedFileIds([]);
        } catch (error) {
            console.error('Bulk delete error:', error);
            setNotification({ isOpen: true, message: 'Gagal menghapus beberapa file.', type: 'error' });
        } finally {
            setIsBulkDeleteModalOpen(false);
        }
    };

    const executeUpload = async (file, options = {}) => {
        const formData = new FormData();
        formData.append('file', file);
        if (options.newName) {
            formData.append('new_name', options.newName);
        }
        if (options.overwrite) {
            formData.append('overwrite', true);
        }

        try {
            // Sertakan folder_id jika berada di dalam folder
            const fid = searchParams.get('folder_id');
            if (fid) {
                formData.append('folder_id', fid);
            }
            await uploadFile(formData, options);
            const successMessage = options.overwrite ? 'File berhasil ditimpa!' : (options.newName ? 'File berhasil diunggah dengan nama baru!' : 'File berhasil diunggah!');
            setNotification({ isOpen: true, message: successMessage, type: 'success' });
            fetchFiles();
        } catch (err) {
            if (err.response && err.response.status === 409) {
                handleConflict(file, err.response.data.message);
            } else {
                console.error('Upload error:', err.response ? err.response.data : err.message);
                setNotification({ isOpen: true, message: 'Gagal mengunggah file.', type: 'error' });
            }
        } finally {
            setOverwriteModal({ isOpen: false, file: null, message: '' });
        }
    };

    const confirmOverwrite = () => {
        executeUpload(overwriteModal.file, { overwrite: true });
    };

    const closeNotification = () => {
        setNotification({ isOpen: false, message: '', type: '' });
    };

    const sortedAndFilteredFiles = files
        .filter(file => file.nama_file_asli.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            let valA, valB;
            if (sortBy === 'nama_file_asli') {
                valA = a.nama_file_asli ? a.nama_file_asli.toLowerCase() : '';
                valB = b.nama_file_asli ? b.nama_file_asli.toLowerCase() : '';
            } else if (sortBy === 'uploader.name') {
                valA = a.uploader ? a.uploader.name.toLowerCase() : '';
                valB = b.uploader ? b.uploader.name.toLowerCase() : '';
            } else if (sortBy === 'updated_at') {
                valA = new Date(a.updated_at).getTime();
                valB = new Date(b.updated_at).getTime();
            }
            if (valA < valB) {
                return sortOrder === 'asc' ? -1 : 1;
            }
            if (valA > valB) {
                return sortOrder === 'asc' ? 1 : -1;
            }
            return 0;
        });

    if (authLoading) return <div>Loading user data...</div>;
    if (isFilesLoading) return <div>Loading files...</div>;

    return (
        <div className="division-dashboard">
            <div className="dashboard-content">
                <div className="dashboard-toolbar">
                    <h1>{user?.division?.name || 'File Divisi'}</h1>
                    <button className="upload-button" onClick={() => setIsUploadModalOpen(true)}>
                        <FaPlus size={14} /> <span>Tambah File</span>
                    </button>
                </div>

                <div className="controls-container">
                    {/* Tombol List/Grid untuk file */}
                    <div className="view-toggle" style={{ marginBottom: '1rem' }}>
                        <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}>List</button>
                        <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}>Grid</button>
                    </div>
                    {selectedFileIds.length > 0 ? (
                        <div className="action-toolbar">
                            <button className="action-button" onClick={() => setSelectedFileIds([])}><FaTimes /> ({selectedFileIds.length} dipilih)</button>
                            <button className="action-button" onClick={handleSelectAllClick}>Pilih Semua</button>
                            <button className="action-button" onClick={handleBulkDownload} disabled={selectedFileIds.length === 0}><FaDownload /></button>
                            <button className="action-button" onClick={handleBulkDelete} disabled={selectedFileIds.length === 0}><FaTrash /></button>
                            {selectedFileIds.length === 1 && (
                                <>
                                    <button className="action-button" onClick={() => {
                                        const fileToPreview = files.find(f => f.id === selectedFileIds[0]);
                                        if (fileToPreview) {
                                            handlePreview(fileToPreview);
                                        }
                                    }}><FaEye /></button>
                                    <button className="action-button" onClick={() => {
                                        const fileToRename = files.find(f => f.id === selectedFileIds[0]);
                                        if (fileToRename) {
                                            handleRenameClick(fileToRename);
                                        } else {
                                            setNotification({ isOpen: true, message: 'File yang ingin diganti namanya tidak ditemukan.', type: 'error' });
                                        }
                                    }}><FaPencilAlt /></button>
                                </>
                            )}
                        </div>
                    ) : (
                        <SortControls sortBy={sortBy} sortOrder={sortOrder} onSortChange={handleSortChange} />
                    )}
                    {/* Hapus view-toggle untuk folder, hanya file yang bisa list/grid */}
                </div>

                {/* Breadcrumb Section */}
                <div className="breadcrumbs" style={{ marginBottom: '1rem', fontSize: '1rem' }}>
                    <span className="breadcrumb-item" style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={() => { setSearchParams({}); setCurrentFolderId(null); }}>
                        {user?.division?.name ? `${user.division.name} Drive` : 'My Drive'}
                    </span>
                    {breadcrumbs.map((bc, idx) => (
                        <span key={bc.id} className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => { setSearchParams({ folder_id: bc.id }); setCurrentFolderId(bc.id); }}>
                            {' > '}{bc.name}
                        </span>
                    ))}
                </div>

                {/* Folder Section: Selalu Grid, tanpa opsi List */}
                {folders && folders.length > 0 && (
                    <section className="folder-section">
                        <h2>Folders</h2>
                        <div className="folders-grid">
                            {folders.map((folder) => (
                                <FolderCard
                                    key={folder.id}
                                    folder={folder}
                                    onClick={() => {
                                        setCurrentFolderId(folder.id);
                                        setSearchParams({ folder_id: folder.id });
                                    }}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {viewMode === 'list' ? (
                    <div className="file-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th className="col-nama">Nama</th>
                                    <th>Pemilik</th>
                                    <th>Tanggal diubah</th>
                                    <th>Ukuran file</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedAndFilteredFiles.map(file => (
                                    <tr
                                        key={file.id}
                                        onClick={() => handleFileSelect(file.id)}
                                        className={selectedFileIds.includes(file.id) ? 'selected' : ''}
                                    >
                                        <td className="nama-cell">
                                            <button onClick={(e) => { e.stopPropagation(); handleToggleFavorite(file); }} className="action-button favorite-button" title="Favorite">
                                                {file.is_favorited ? <FaStar color="#ffc107" /> : <FaRegStar color="#6c757d" />}
                                            </button>
                                            <span className="file-icon">
                                                {getFileIcon(file.tipe_file, file.nama_file_asli)}
                                            </span>
                                            <span title={file.nama_file_asli}>
                                                {truncateFilename(file.nama_file_asli, 54)}
                                            </span>
                                        </td>
                                        <td>{file.uploader ? file.uploader.name : '-'}</td>
                                        <td>{new Date(file.updated_at).toLocaleDateString('id-ID')}</td>
                                        <td>{(file.ukuran_file / 1024 / 1024).toFixed(2)} MB</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="stats-grid">
                        {sortedAndFilteredFiles.map(file => (
                            <FileCard
                                key={file.id}
                                file={file}
                                onPreview={handlePreview}
                                onDownload={handleDownload}
                                onDelete={handleDeleteClick}
                                onToggleFavorite={handleToggleFavorite}
                                onRename={handleRenameClick}
                                onSelect={handleFileSelect}
                                isSelected={selectedFileIds.includes(file.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload File Baru">
                <FileUploadForm onUploadComplete={handleUploadComplete} onConflict={handleConflict} currentFolderId={currentFolderId} />
            </Modal>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                message={`Apakah Anda yakin ingin menghapus file "${fileToDelete?.nama_file_asli}"?`}
                isDanger={true}
                confirmText="Hapus"
            />

            <ConfirmationModal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                onConfirm={confirmBulkDelete}
                message={`Apakah Anda yakin ingin menghapus ${selectedFileIds.length} file yang dipilih?`}
                isDanger={true}
                confirmText="Hapus Semua"
            />

            <ConfirmationModal
                isOpen={overwriteModal.isOpen}
                onClose={() => setOverwriteModal({ isOpen: false, file: null, message: '' })}
                onConfirm={confirmOverwrite}
                message={overwriteModal.message || `File dengan nama "${overwriteModal.file?.name}" sudah ada. Timpa file?`}
                confirmText="Timpa"
                isDanger={true}
                customActions={
                    <button onClick={() => {
                        handleRenameClick(overwriteModal.file);
                        setOverwriteModal({ isOpen: false, file: null, message: '' });
                    }} className="modal-button cancel-button">
                        Ganti Nama
                    </button>
                }
            />

            <Modal
                isOpen={renameModal.isOpen}
                onClose={() => setRenameModal({ ...renameModal, isOpen: false })}
                title="Ganti Nama File"
            >
                <div>
                    <p>Masukkan nama file baru untuk "{renameModal.file?.nama_file_asli}":</p>
                    <input
                        type="text"
                        value={renameModal.newName}
                        onChange={(e) => setRenameModal({ ...renameModal, newName: e.target.value })}
                        className="form-input w-full mt-2"
                    />
                    <div className="confirmation-modal-actions">
                        <button type="button" className="modal-button cancel-button" onClick={() => setRenameModal({ ...renameModal, isOpen: false })}>
                            <FaTimes /> Batal
                        </button>
                        <button type="button" className="modal-button confirm-button" onClick={confirmRename}>
                            <FaSave /> Simpan
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
    if (user?.role === 'super_admin') {
        return <SuperAdminDashboard />;
    }
    return <DivisionUserDashboard />;
};

export default DashboardPage;

