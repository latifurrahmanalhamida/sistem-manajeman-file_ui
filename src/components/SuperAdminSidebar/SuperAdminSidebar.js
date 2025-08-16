import React from 'react';
import { NavLink, Link } from 'react-router-dom'; // <-- Impor 'Link'
import './SuperAdminSidebar.css';
import { FaHome, FaUsers, FaCog, FaArrowLeft } from 'react-icons/fa'; // <-- Impor 'FaArrowLeft'

const SuperAdminSidebar = () => {
    return (
        <aside className="super-admin-sidebar">
            <div> {/* Tambahkan div pembungkus untuk item utama */}
                <div className="sidebar-header">
                    <h3>Super Admin Console</h3>
                </div>
                <nav className="sidebar-nav">
                    <NavLink to="/super-admin/beranda" className="sidebar-link">
                        <FaHome /> Beranda
                    </NavLink>
                    <NavLink to="/super-admin/manajemen" className="sidebar-link">
                        <FaUsers /> Manajemen
                    </NavLink>
                    <NavLink to="/super-admin/pengaturan" className="sidebar-link">
                        <FaCog /> Pengaturan
                    </NavLink>
                </nav>
            </div>

            {/* --- BAGIAN BARU UNTUK TOMBOL KEMBALI --- */}
            <div className="sidebar-footer">
                <Link to="/dashboard" className="sidebar-back-button">
                    <FaArrowLeft /> Kembali ke Dashboard
                </Link>
            </div>
            {/* ------------------------------------------- */}
        </aside>
    );
};

export default SuperAdminSidebar;