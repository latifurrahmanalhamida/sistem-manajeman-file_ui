import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers, deleteUser } from '../services/api';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import './AdminPanel.css';
import '../components/DataTable/DataTable.css';
import ConfirmationModal from '../components/ConfirmationModal/ConfirmationModal';
import Notification from '../components/Notification/Notification';

const DaftarUserPage = () => {
    const { user: adminUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalState, setModalState] = useState({ isOpen: false, user: null });
    const [notification, setNotification] = useState({ isOpen: false, message: '', type: '' });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getUsers();
            setUsers(response.data);
        } catch (error) {
            console.error("Gagal mengambil data user:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();

        const handleFocus = () => {
            fetchUsers();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchUsers]);

    const handleDeleteClick = (user) => {
        setModalState({ isOpen: true, user: user });
    };

    const confirmDelete = async () => {
        if (!modalState.user) return;
        try {
            await deleteUser(modalState.user.id);
            setNotification({ isOpen: true, message: 'User berhasil dihapus.', type: 'success' });
            fetchUsers(); // Muat ulang daftar user
        } catch (error) {
            setNotification({ isOpen: true, message: 'Gagal menghapus user.', type: 'error' });
        } finally {
            setModalState({ isOpen: false, user: null });
        }
    };
    
    const closeNotification = () => {
        setNotification({ isOpen: false, message: '', type: '' });
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div>Loading...</div>;

    return (
        <div className="admin-page-container">
            <div className="admin-header-container">
                <div className="admin-header-title">
                    <span className="page-subtitle">{adminUser?.division?.name ? `${adminUser.division.name} Drive` : 'Semua User'}</span>
                    <h1 className="page-main-title">Kelola User</h1>
                </div>
                <div className="admin-header-actions">
                    <Link to="/panel-admin/tambah-user" className="add-user-button">
                        <FaPlus size={14} /> <span>Tambah User</span>
                    </Link>
                </div>
            </div>
            <div className="controls-container">
                <input
                    type="search"
                    placeholder="Cari nama atau email..."
                    className="search-bar-admin"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                {/* Link ikon ke halaman Sampah */}
                <Link to="/panel-admin/users/trash" title="Lihat User di Sampah">
                    <FaTrash />
                </Link>
            </div>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>NIPP</th>
                            <th>Nama Lengkap</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Penyimpanan Digunakan</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.nipp || '-'}</td>
                                <td>{user.name}</td>
                                <td>{user.username || '-'}</td>
                                <td>{user.email}</td>
                                <td>{user.penyimpanan_digunakan}</td>
                                <td>
                                    <Link to={`/panel-admin/users/edit/${user.id}`} className="action-button">
                                        <FaEdit color="#0d6efd" />
                                    </Link>
                                    <button onClick={() => handleDeleteClick(user)} className="action-button">
                                        <FaTrash color="#dc3545" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, user: null })}
                onConfirm={confirmDelete}
                message={`Anda yakin ingin menghapus user "${modalState.user?.name}"?`}
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

export default DaftarUserPage;
