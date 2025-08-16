// src/pages/KelolaFolderPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { getContents, deleteFolder } from '../services/api';
import CreateFolderModal from '../components/Modal/CreateFolderModal';
import FolderRow from '../components/DataTable/FolderRow';
import ConfirmationModal from '../components/ConfirmationModal/ConfirmationModal';
import './KelolaFolderPage.css';

const KelolaFolderPage = () => {
    const [folders, setFolders] = useState([]);
    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [folderToDelete, setFolderToDelete] = useState(null); // modal hapus

    const fetchContents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getContents(currentFolderId);
            setFolders(response.data.folders || []);
        } catch (err) {
            console.error("Gagal mengambil konten:", err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentFolderId]);

    useEffect(() => {
        fetchContents();
    }, [fetchContents]);

    const handleFolderDoubleClick = (folderId) => {
        setCurrentFolderId(folderId);
    };

    const handleDeleteClick = (folder) => {
        setFolderToDelete(folder);
    };

    const handleConfirmDelete = async () => {
        if (!folderToDelete) return;
        try {
            await deleteFolder(folderToDelete.id);
            setFolderToDelete(null);
            await fetchContents(); // refresh dari backend
        } catch (error) {
            console.error("Gagal menghapus folder:", error);
            setFolderToDelete(null);
        }
    };

    return (
        <div className="container-fluid mt-4 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>SDM</h4>
                <button onClick={() => setIsCreateModalOpen(true)} className="btn-add-folder">
                    Tambah Folder +
                </button>
            </div>

            {isLoading && <p>Loading...</p>}
            {error && <p className="text-danger">Terjadi kesalahan saat memuat data.</p>}

            {!isLoading && !error && (
                <table className="professional-table">
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Divisi</th>
                            <th>Dibuat Oleh</th>
                            <th>Tanggal diubah</th>
                            <th>Ukuran</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {folders.map(folder => (
                            <FolderRow
                                key={`folder-${folder.id}`}
                                folder={folder}
                                onDoubleClick={handleFolderDoubleClick}
                                onDeleteClick={handleDeleteClick}
                            />
                        ))}
                    </tbody>
                </table>
            )}

            {!isLoading && !error && folders.length === 0 && (
                <p className="text-center mt-4">Folder ini kosong.</p>
            )}

            <CreateFolderModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                currentFolderId={currentFolderId}
                onFolderCreated={fetchContents}
            />

            <ConfirmationModal
                isOpen={!!folderToDelete}
                onClose={() => setFolderToDelete(null)}
                onConfirm={handleConfirmDelete}
                message={`Anda yakin ingin menghapus folder "${folderToDelete?.name}"?`}
            />
        </div>
    );
};

export default KelolaFolderPage;
