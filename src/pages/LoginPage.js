// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css'; // <-- 1. Impor file CSS


const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.';
            setError(errorMessage);
            console.error("Login error details:", err);
        }
    };

    // 2. HAPUS seluruh objek const styles = { ... };

    return (
        // 3. Ganti semua 'style={...}' menjadi 'className="..."'
        <div className="login-page">
            <div className="left-pane">
                <div className="overlay">
                    <h1 className="overlay-title">Sistem Manajemen File</h1>
                    <p className="overlay-subtitle">Menghubungkan Setiap Perjalanan, Mengelola Setiap Dokumen.</p>
                </div>
            </div>

            <div className="right-pane">
                <div className="login-box">
                    <h2 className="title">Login</h2>
                    <div className="title-underline"></div>
                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="contoh@kai.id"
                            />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit" className="login-button">Masuk</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;