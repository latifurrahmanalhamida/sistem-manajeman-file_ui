// src/pages/ProfilePage.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom'; // <-- DITAMBAHKAN

const ProfilePage = () => {
    const { user } = useAuth();

    // Style untuk tombol, agar konsisten
    const buttonStyle = {
        display: 'inline-block',
        padding: '10px 20px',
        marginTop: '20px',
        backgroundColor: '#007bff',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        fontWeight: 'bold'
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Profil Saya</h1>
            </div>
            <div className="table-container" style={{maxWidth: '600px'}}>
                <p><strong>Nama:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                {/* Logika tampilan diubah untuk menampilkan nama peran */}
                <p><strong>Peran:</strong> {user?.role?.name || 'N/A'}</p> 
                <p><strong>Divisi:</strong> {user?.division?.name || 'N/A'}</p>

                {/* Tombol kondisional untuk Super Admin */}
                {user?.role?.name === 'super_admin' && (
                    <Link to="/panel-super-admin" style={buttonStyle}>
                        Panel Super Admin
                    </Link>
                )}

                {/* KODE DIAGNOSTIK: Tampilkan data user mentah */}
                <hr />
                <h3>Data Pengguna (Diagnostik):</h3>
                <pre>
                    {JSON.stringify(user, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default ProfilePage;