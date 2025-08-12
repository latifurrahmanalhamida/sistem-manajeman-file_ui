// src/pages/TambahUserPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../services/api'; 
import './AdminPanel.css';
import Notification from '../components/Notification/Notification';

const TambahUserPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        nipp: '',
        username: ''
    });
    const [notification, setNotification] = useState({ isOpen: false, message: '', type: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createUser(formData);
            // Tampilkan notifikasi sukses
            setNotification({ isOpen: true, message: 'User berhasil dibuat!', type: 'success' });
            // Arahkan kembali setelah beberapa saat
            setTimeout(() => {
                navigate('/panel-admin/users');
            }, 2000);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Gagal membuat user. Periksa kembali data Anda.';
            setNotification({ isOpen: true, message: errorMsg, type: 'error' });
            console.error(error);
        }
    };

    const closeNotification = () => {
        setNotification({ isOpen: false, message: '', type: '' });
    };

    return (
        <div className="admin-page-container">
            <h3>Buat User Baru</h3>
            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>NIPP</label>
                        <input name="nipp" value={formData.nipp} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                        <label>Nama Lengkap</label>
                        <input name="name" value={formData.name} onChange={handleChange} className="form-input" required />
                    </div>
                    <div className="form-group">
                        <label>Username</label>
                        <input name="username" value={formData.username} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-input" required minLength="8" />
                    </div>
                    <button type="submit" className="form-button">Simpan</button>
                </form>
            </div>
            
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

export default TambahUserPage;