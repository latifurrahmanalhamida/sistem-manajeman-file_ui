// src/pages/KelolaFolderPage.js

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../services/api';
import './KelolaFolderPage.css';
import { FaPlus, FaEdit, FaTrash, FaFolder } from 'react-icons/fa';
import FolderFormModal from '../components/Dashboard/FolderFormModal';
import ConfirmationModal from '../components/ConfirmationModal/ConfirmationModal';
import { useAuth } from '../context/AuthContext';

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === null || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const KelolaFolderPage = () => {
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk modal form (bisa untuk create/edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState(null);

  // State untuk modal konfirmasi hapus
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [currentParentId, setCurrentParentId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  const fetchFolders = async () => {
    setLoading(true);
    try {
      const parent_id = currentParentId ?? searchParams.get('parent_id');
      const { data } = await apiClient.get('/admin/folders', { params: { parent_id } });
      setFolders(data);
      if (parent_id) {
        const { data: showData } = await apiClient.get(`/admin/folders/${parent_id}`);
        setBreadcrumbs(showData.breadcrumbs || []);
      } else {
        setBreadcrumbs([]);
      }
    } catch (err) {
      setError('Gagal memuat data folder.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const pid = searchParams.get('parent_id');
    setCurrentParentId(pid ? parseInt(pid, 10) : null);
    fetchFolders();
  }, [searchParams]);

  const handleSave = () => {
    fetchFolders(); // Refresh data setelah berhasil menyimpan
  };

  // Handler untuk modal form
  const handleOpenCreateModal = () => {
    setFolderToEdit(null); // Mode create
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (folder) => {
    setFolderToEdit(folder); // Mode edit
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setFolderToEdit(null);
  };

  // Handler untuk modal hapus
  const handleDeleteClick = (folder) => {
    setFolderToDelete(folder);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setFolderToDelete(null);
  };

  const confirmDelete = async () => {
    if (!folderToDelete) return;
    try {
      await apiClient.delete(`/admin/folders/${folderToDelete.id}`);
      fetchFolders(); // Refresh data
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus folder.');
    } finally {
      handleCloseDeleteModal();
    }
  };

  if (loading) return <div>Memuat data folder...</div>;
  if (error) return <div className="error-message">{error}</div>

  return (
    <>
      <div className="kelola-folder-page">
        <div className="page-header">
          <div>
            <div className="breadcrumbs">
              <span className="breadcrumb-item" onClick={() => { setSearchParams({}); setCurrentParentId(null); }}>{user?.division?.name ? `${user.division.name} Drive` : 'My Drive'}</span>
              {breadcrumbs.map(bc => (
                <span key={bc.id} className="breadcrumb-item" onClick={() => { setSearchParams({ parent_id: bc.id }); setCurrentParentId(bc.id); }}>{' > '}{bc.name}</span>
              ))}
            </div>
            <h1>Kelola Folder</h1>
          </div>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <FaPlus /> Tambah Folder
          </button>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Folder</th>
                <th>Dibuat Oleh</th>
                <th>Tanggal Diubah</th>
                <th>Ukuran Total</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {folders.map((folder) => (
                <tr key={folder.id} onClick={() => { setSearchParams({ parent_id: folder.id }); setCurrentParentId(folder.id); }}>
                  <td className="folder-name-cell">
                    <FaFolder /> <span>{folder.name}</span>
                  </td>
                  <td>{folder.user?.name || 'N/A'}</td>
                  <td>{new Date(folder.updated_at).toLocaleDateString('id-ID')}</td>
                  <td>{formatBytes(folder.files_sum_ukuran_file)}</td>
                  <td className="action-buttons">
                    <button
                      className="btn-icon btn-edit"
                      title="Ubah Nama"
                      onClick={(e) => { e.stopPropagation(); handleOpenEditModal(folder); }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      title="Hapus"
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(folder); }}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FolderFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSave={handleSave}
        folderToEdit={folderToEdit}
        parentId={currentParentId}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDelete}
        message={`Apakah Anda yakin ingin menghapus folder "${folderToDelete?.name}"? Aksi ini akan menghapus semua file di dalamnya.`}
        isDanger={true}
        confirmText="Ya, Hapus"
      />
    </>
  );
};

export default KelolaFolderPage;
