// src/pages/KelolaPenggunaPage.js

import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import './KelolaDivisiPage.css'; // Kita bisa gunakan kembali CSS yang sama
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import PenggunaFormModal from '../components/Dashboard/PenggunaFormModal';
import ConfirmationModal from '../components/ConfirmationModal/ConfirmationModal';
import Badge from '../components/Dashboard/Badge';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const getRoleBadgeType = (roleName) => {
    if (roleName === 'super_admin') return 'danger';
    if (roleName === 'admin_devisi') return 'primary';
    return 'secondary';
};

const KelolaPenggunaPage = () => {
    const { triggerActivityLogRefresh } = useAppContext();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State untuk form modal (Tambah/Edit)
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);

    // State untuk modal konfirmasi Hapus
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Semua state dan fungsi handler Anda tidak berubah
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/admin/users');
            setUsers(response.data);
        } catch (err) {
            setError('Gagal memuat data pengguna.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const handleOpenCreateModal = () => {
        setUserToEdit(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (user) => {
        setUserToEdit(user);
        setIsFormModalOpen(true);
    };
    
    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setUserToEdit(null);
    };

    const handleSave = () => {
        fetchUsers();
        triggerActivityLogRefresh();
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
            await apiClient.delete(`/admin/users/${userToDelete.id}`);
            fetchUsers();
            triggerActivityLogRefresh();
        } catch (err) {
            alert('Gagal menghapus pengguna.');
            console.error('Delete error:', err);
        } finally {
            handleCloseDeleteModal();
        }
    };

    if (loading) return <div>Memuat data pengguna...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <>
            <div className="kelola-divisi-page">
                <div className="page-header">
                    <h1>Kelola Pengguna</h1>
                    {/* --- PERUBAHAN ADA DI SINI --- */}
                    <div className="header-actions">
                        <Link to="/super-admin/manajemen/pengguna/sampah" className="btn btn-secondary">
                            <FaTrash /> Arsip Pengguna
                        </Link>
                        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                            <FaPlus /> Tambah Pengguna
                        </button>
                    </div>
                    {/* --------------------------- */}
                </div>

                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>NIPP</th>
                                <th>Nama Lengkap</th>
                                <th>Email</th>
                                <th>Divisi</th>
                                <th>Peran</th>
                                <th>Penyimpanan</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
<tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.nipp || '-'}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.division?.name || 'N/A'}</td>
                                    <td>
                                        {user.role ? <Badge type={getRoleBadgeType(user.role.name)} text={user.role.name} /> : 'N/A'}
                                    </td>
                                    <td>{user.penyimpanan_digunakan}</td>
                                    <td className="action-buttons">
                                        <button className="btn-icon btn-edit" title="Edit" onClick={() => handleOpenEditModal(user)}>
                                            <FaEdit />
                                        </button>
                                        <button className="btn-icon btn-delete" title="Hapus" onClick={() => handleDeleteClick(user)}>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Render kedua modal di sini */}
            <PenggunaFormModal
                isOpen={isFormModalOpen}
                onClose={handleCloseFormModal}
                onSave={handleSave}
                userToEdit={userToEdit}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={confirmDelete}
                message={`Apakah Anda yakin ingin menghapus pengguna "${userToDelete?.name}"?`}
                isDanger={true}
                confirmText="Ya, Hapus"
            />
        </>
    );
};

export default KelolaPenggunaPage;