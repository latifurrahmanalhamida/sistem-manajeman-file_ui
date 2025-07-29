// src/pages/DaftarUserPage.js

import React, { useState, useEffect } from 'react';
import { getUsers } from '../services/api';
import DataTable from '../components/DataTable/DataTable'; // <-- 1. Impor komponen baru
import { Link } from 'react-router-dom'; // Untuk tombol Tambah User

const DaftarUserPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getUsers();
                setUsers(response.data);
            } catch (error) {
                console.error("Gagal mengambil data user:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    // 2. Definisikan header dan cara merender setiap baris
    const tableHeaders = ['Nama', 'Email', 'Peran', 'Divisi'];
    const renderUserRow = (user) => (
        <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role.name}</td>
            <td>{user.division ? user.division.name : 'N/A'}</td>
        </tr>
    );

    return (
        <div className="dashboard-container"> {/* Menggunakan style dari dashboard */}
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Daftar User</h1>
                <Link to="/admin/tambah-user" style={{
                    padding: '10px 15px',
                    backgroundColor: '#0D2A51',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px'
                }}>
                    + Tambah User
                </Link>
            </div>

            {/* 3. Gunakan komponen DataTable */}
            <DataTable
                headers={tableHeaders}
                data={users}
                renderRow={renderUserRow}
            />
        </div>
    );
};

export default DaftarUserPage;