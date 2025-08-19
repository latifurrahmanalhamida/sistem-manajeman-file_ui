// src/components/Dashboard/PenggunaFormModal.js

import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import Modal from '../Modal/Modal';
import './PenggunaFormModal.css'; // Akan kita buat setelah ini

const PenggunaFormModal = ({ isOpen, onClose, onSave, userToEdit }) => {
    const initialFormData = {
        name: '',
        email: '',
        nipp: '',
        username: '',
        password: '',
        role_id: '',
        division_id: '',
    };

    const [formData, setFormData] = useState(initialFormData);
    const [roles, setRoles] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditMode = userToEdit !== null;

    // Efek untuk mengambil data roles dan divisions dari API
    useEffect(() => {
        if (isOpen) {
            const fetchDataForDropdowns = async () => {
                try {
                    const [rolesRes, divisionsRes] = await Promise.all([
                        apiClient.get('/admin/roles'),
                        apiClient.get('/admin/divisions')
                    ]);
                    setRoles(rolesRes.data);
                    setDivisions(divisionsRes.data);
                } catch (err) {
                    console.error("Gagal mengambil data untuk dropdown", err);
                }
            };
            fetchDataForDropdowns();
        }
    }, [isOpen]);

    // Efek untuk mengisi form saat mode edit
    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setFormData({
                    name: userToEdit.name || '',
                    email: userToEdit.email || '',
                    nipp: userToEdit.nipp || '',
                    username: userToEdit.username || '',
                    password: '', // Password tidak diisi saat edit
                    role_id: userToEdit.role_id || '',
                    division_id: userToEdit.division_id || '',
                });
            } else {
                setFormData(initialFormData);
            }
            setError(null); // Reset error setiap kali modal dibuka
        }
    }, [userToEdit, isOpen, isEditMode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Hapus field password jika kosong (saat mode edit)
        const dataToSubmit = { ...formData };
        if (isEditMode && !dataToSubmit.password) {
            delete dataToSubmit.password;
        }

        try {
            if (isEditMode) {
                await apiClient.put(`/admin/users/${userToEdit.id}`, dataToSubmit);
            } else {
                await apiClient.post('/admin/users', dataToSubmit);
            }
            onSave();
            onClose();
        } catch (err) {
            const errorData = err.response?.data?.errors;
            if (errorData) {
                // Mengambil pesan error pertama dari validasi Laravel
                const firstError = Object.values(errorData)[0][0];
                setError(firstError);
            } else {
                setError('Terjadi kesalahan yang tidak diketahui.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}>
            <form onSubmit={handleSubmit} className="pengguna-form">
                {/* NIPP & Nama Lengkap */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="nipp">NIPP</label>
                        <input id="nipp" name="nipp" type="text" value={formData.nipp} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">Nama Lengkap</label>
                        <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} required />
                    </div>
                </div>
                
                {/* Email & Username */}
                <div className="form-row">
                     <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input id="username" name="username" type="text" value={formData.username} onChange={handleInputChange} />
                    </div>
                </div>

                {/* Password */}
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input id="password" name="password" type="password" onChange={handleInputChange} placeholder={isEditMode ? 'Kosongkan jika tidak ingin diubah' : ''} required={!isEditMode} />
                </div>
                
                {/* Dropdown Role & Divisi */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="role_id">Peran (Role)</label>
                        <select id="role_id" name="role_id" value={formData.role_id} onChange={handleInputChange} required>
                            <option value="">Pilih Peran</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="division_id">Divisi</label>
                        <select id="division_id" name="division_id" value={formData.division_id} onChange={handleInputChange} required>
                            <option value="">Pilih Divisi</option>
                            {divisions.map(division => (
                                <option key={division.id} value={division.id}>{division.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                {error && <p className="error-message">{error}</p>}

                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                        Batal
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default PenggunaFormModal;