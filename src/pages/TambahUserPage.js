// src/pages/TambahUserPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createUser, getRoles, getDivisions } from '../services/api';
import './TambahUserPage.css';

const TambahUserPage = () => {
    const { user: adminUser } = useAuth(); // Ambil data admin yang login
    const navigate = useNavigate();

    // State untuk form
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roleId, setRoleId] = useState('');
    const [divisionId, setDivisionId] = useState('');

    // State untuk data dropdown
    const [roles, setRoles] = useState([]);
    const [divisions, setDivisions] = useState([]);

    // State untuk UI feedback
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Ambil data roles dan divisions saat halaman dimuat
    useEffect(() => {
        if (adminUser?.role === 'super_admin') {
            const fetchDataForDropdowns = async () => {
                try {
                    const rolesRes = await getRoles();
                    const divisionsRes = await getDivisions();
                    setRoles(rolesRes.data);
                    setDivisions(divisionsRes.data);
                } catch (err) {
                    setError('Gagal memuat data peran dan divisi.');
                }
            };
            fetchDataForDropdowns();
        }
    }, [adminUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        let userData = { name, email, password };

        // Jika admin adalah Super Admin, sertakan role dan divisi
        if (adminUser?.role === 'super_admin') {
            userData.role_id = roleId;
            userData.division_id = divisionId;
        }

        try {
            await createUser(userData);
            setSuccess('User baru berhasil dibuat! Mengarahkan ke daftar user...');

            setTimeout(() => {
                navigate('/admin/daftar-user');
            }, 2000);

        } catch (err) {
            if (err.response && err.response.data.errors) {
                const validationErrors = Object.values(err.response.data.errors).flat().join('\n');
                setError(validationErrors);
            } else {
                setError('Gagal membuat user baru. Silakan coba lagi.');
            }
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Tambah User Baru</h1>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nama:</label>
                        <input
                            className="form-input"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            className="form-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            className="form-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength="8"
                        />
                    </div>

                    {/* Dropdown hanya muncul untuk Super Admin */}
                    {adminUser?.role === 'super_admin' && (
                        <>
                            <div className="form-group">
                                <label>Peran (Role):</label>
                                <select className="form-input" value={roleId} onChange={(e) => setRoleId(e.target.value)} required>
                                    <option value="">Pilih Peran</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Divisi:</label>
                                <select className="form-input" value={divisionId} onChange={(e) => setDivisionId(e.target.value)} required>
                                    <option value="">Pilih Divisi</option>
                                    {divisions.map(division => (
                                        <option key={division.id} value={division.id}>{division.name}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    <button type="submit" className="form-button">Simpan User</button>

                    {error && <p className="form-message error">{error}</p>}
                    {success && <p className="form-message success">{success}</p>}
                </form>
            </div>
        </div>
    );
};

export default TambahUserPage;