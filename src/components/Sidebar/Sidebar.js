// src/components/Sidebar.js

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaTachometerAlt, FaUsers, FaFolderOpen, FaChartBar, FaPlus, FaList, FaSignOutAlt } from 'react-icons/fa';
import './Sidebar.css'; 

const Sidebar = () => {
    // 1. Ambil data 'user' dari context
    const { user, logout } = useAuth(); 
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h3>Manajemen File</h3>
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className="menu-item">
                    <FaTachometerAlt /> <span>Dashboard</span>
                </NavLink>

                {/* 2. Terapkan kondisi untuk Super Admin */}
                {user && user.role === 'super_admin' && (
                    <>
                        <NavLink to="/admin" className="menu-item">
                            <FaFolderOpen /> <span>Admin Page</span>
                        </NavLink>
                    </>
                )}
                
                {/* 3. Terapkan kondisi untuk Super Admin dan Admin Devisi */}
                {user && (user.role === 'super_admin' || user.role === 'admin_devisi') && (
                    <div className="menu-item-dropdown">
                        <button onClick={toggleUserMenu} className="menu-item dropdown-toggle">
                            <span><FaUsers /> <span>Kelola User</span></span>
                            <span className={`arrow ${isUserMenuOpen ? 'open' : ''}`}>▼</span>
                        </button>
                        
                        {isUserMenuOpen && (
                            <div className="submenu">
                                <NavLink to="/admin/tambah-user" className="submenu-item">
                                    <FaPlus /> <span>Tambah User Devisi</span>
                                </NavLink>
                                <NavLink to="/admin/daftar-user" className="submenu-item">
                                    <FaList /> <span>Daftar User</span>
                                </NavLink>
                            </div>
                        )}
                    </div>
                )}

                <NavLink to="/laporan" className="menu-item">
                    <FaChartBar /> <span>Laporan</span>
                </NavLink>
            </nav>
            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-button">
                    <FaSignOutAlt /> <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;