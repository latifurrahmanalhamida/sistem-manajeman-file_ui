// src/components/AdminSidebar/AdminSidebar.js
import React from 'react';
// Impor 'Link' untuk tombol kembali, dan 'NavLink' untuk menu navigasi
import { NavLink, Link } from 'react-router-dom';
import './AdminSidebar.css';
// Impor ikon baru untuk tombol kembali
import { FaUsers, FaFolder, FaChartLine, FaArrowLeft } from 'react-icons/fa';

const AdminSidebar = () => {
    return (
        <aside className="admin-sidebar">
            <div> {/* Div pembungkus untuk menu utama */}
                <ul className="admin-sidebar-menu">
                    <li className="menu-item">
                        <NavLink to="/panel-admin/users" end> <FaUsers /> Kelola User </NavLink>
                    </li>
                    <li className="menu-item">
                        <NavLink to="/panel-admin/folders"> <FaFolder /> Kelola Folder </NavLink>
                    </li>
                    <li className="menu-item">
                        <NavLink to="/panel-admin/activities"> <FaChartLine /> Laporan Aktivitas </NavLink>
                    </li>
                </ul>
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

export default AdminSidebar;