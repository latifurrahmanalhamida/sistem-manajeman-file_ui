// src/components/Dashboard/FolderFormModal.js

import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import Modal from '../Modal/Modal';
// Kita bisa gunakan kembali CSS dari form lain untuk konsistensi
import './DivisiFormModal.css';

const FolderFormModal = ({ isOpen, onClose, onSave, folderToEdit, parentId }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = folderToEdit !== null;

  useEffect(() => {
    if (isOpen) {
      setName(isEditMode ? folderToEdit.name : '');
      setError(null);
    }
  }, [folderToEdit, isOpen, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const computedParentFolderId = isEditMode
      ? (folderToEdit.parent_folder_id ?? folderToEdit.parent_id ?? null)
      : parentId;

    const folderData = {
      name,
      parent_folder_id: computedParentFolderId,
    };

    try {
      if (isEditMode) {
        await apiClient.put(`/admin/folders/${folderToEdit.id}`, folderData);
      } else {
        await apiClient.post('/admin/folders', folderData);
      }
      onSave();
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.errors?.name?.[0] || err.response?.data?.message || 'Terjadi kesalahan.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Ubah Nama Folder' : 'Buat Folder Baru'}>
      <form onSubmit={handleSubmit} className="divisi-form">
        <div className="form-group">
          <label htmlFor="folder-name">Nama Folder</label>
          <input
            id="folder-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Laporan Bulanan"
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Batal</button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FolderFormModal;
