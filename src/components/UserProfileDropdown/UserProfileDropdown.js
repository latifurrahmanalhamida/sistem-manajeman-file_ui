// src/components/UserProfileDropdown/UserProfileDropdown.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
// HANYA ADA SATU BARIS IMPOR DARI REACT-ROUTER-DOM
import { useNavigate, Link } from 'react-router-dom';
import './UserProfileDropdown.css';
// Impor ikon yang dibutuhkan
import { FaUserCircle, FaSignOutAlt, FaUserEdit } from 'react-icons/fa';

const UserProfileDropdown = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Menutup dropdown jika klik di luar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <div className="profile-dropdown" ref={dropdownRef}>
            <div className="profile-trigger" onClick={() => setIsOpen(!isOpen)}>
                <span role="img" aria-label="notifications">🔔</span>
                <span>{user?.name || 'User'}</span>
                <FaUserCircle size={24} />
            </div>

            {isOpen && (
                <div className="dropdown-menu">
                    {/* TAMBAHKAN LINK KE PROFIL DI SINI */}
                    <Link to="/profile" className="dropdown-item">
                        <FaUserEdit />
                        <span>Profil Saya</span>
                    </Link>
                    <hr className="dropdown-divider" />
                    <button onClick={handleLogout} className="logout-button">
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserProfileDropdown;