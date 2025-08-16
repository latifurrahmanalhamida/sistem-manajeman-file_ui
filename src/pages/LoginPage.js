// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';
import { VscError } from "react-icons/vsc"; 

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loginInput, setLoginInput] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(loginInput, password);
            navigate('/dashboard');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login gagal. Periksa kembali kredensial Anda.';
            setError(errorMessage);
            console.error("Login error details:", err);
        }
    };

    return (
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
                            <label>Email atau NIPP</label>
                            <input
                                type="text"
                                value={loginInput}
                                onChange={(e) => setLoginInput(e.target.value)}
                                required
                                placeholder="masukan email atau nipp yang sudah terdaftar"
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

                        {error && (
                            <div className="error-message">
                                <VscError size={20} />
                                <span>{error}</span>
                            </div>
                        )}
                        
                        <button type="submit" className="login-button">Masuk</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;