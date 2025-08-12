// src/components/AdminSidebar/AdminSidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './AdminSidebar.css';
// Anda mungkin perlu install react-icons: npm install react-icons
import { FaUsers, FaFolder, FaChartLine } from 'react-icons/fa';

const AdminSidebar = () => {
    return (
        <aside className="admin-sidebar">
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
        </aside>
    );
};

export default AdminSidebar;