import React from 'react';
import { NavLink, Link } from 'react-router-dom';
// PERUBAHAN: Impor file CSS yang baru
import '../Sidebar/Sidebar.css'; 
import { FaHome, FaUsers, FaCog, FaArrowLeft } from 'react-icons/fa';

const SuperAdminSidebar = () => {
    return (
        // PERUBAHAN: Ganti className menjadi 'sidebar'
        <aside className="sidebar">
            <div>
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

            <div className="sidebar-footer">
                <Link to="/dashboard" className="sidebar-back-button">
                    <FaArrowLeft /> Kembali ke Dashboard
                </Link>
            </div>
        </aside>
    );
};

export default SuperAdminSidebar;