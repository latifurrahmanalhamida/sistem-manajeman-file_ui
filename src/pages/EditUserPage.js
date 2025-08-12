// src/pages/EditUserPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, updateUser } from '../services/api';
import './AdminPanel.css';
import Notification from '../components/Notification/Notification';

const EditUserPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', nipp: '', username: '' });
    const [notification, setNotification] = useState({ isOpen: false, message: '', type: '' });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getUserById(userId);
                setFormData(response.data);
            } catch (error) {
                console.error("Gagal mengambil data user", error);
            }
        };
        fetchUser();
    }, [userId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateUser(userId, formData);
            setNotification({ isOpen: true, message: 'User berhasil diperbarui!', type: 'success' });
            setTimeout(() => {
                navigate('/panel-admin/users');
            }, 2000);
        } catch (error) {
            setNotification({ isOpen: true, message: 'Gagal memperbarui user.', type: 'error' });
        }
    };
    
    const closeNotification = () => {
        setNotification({ isOpen: false, message: '', type: '' });
    };

    return (
        <div className="admin-page-container">
            <h3>Edit User</h3>
            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>NIPP</label>
                        <input name="nipp" value={formData.nipp || ''} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                        <label>Nama Lengkap</label>
                        <input name="name" value={formData.name || ''} onChange={handleChange} className="form-input" required />
                    </div>
                    <div className="form-group">
                        <label>Username</label>
                        <input name="username" value={formData.username || ''} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="form-input" required />
                    </div>
                    <button type="submit" className="form-button">Simpan Perubahan</button>
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

export default EditUserPage;