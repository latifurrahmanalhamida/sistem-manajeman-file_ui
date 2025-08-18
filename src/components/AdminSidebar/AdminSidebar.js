import React from 'react';
import { NavLink, Link } from 'react-router-dom';
// PERUBAHAN: Impor file CSS yang baru
import '../Sidebar/Sidebar.css'; 
import { FaUsers, FaFolder, FaChartLine, FaArrowLeft } from 'react-icons/fa';

const AdminSidebar = () => {
    return (
        // PERUBAHAN: Ganti className menjadi 'sidebar'
        <aside className="sidebar">
            <div>
                <div className="sidebar-header">
                    <h3>Panel Admin</h3>
                </div>
                {/* PERUBAHAN: Menyamakan struktur dengan NavLink */}
                <nav className="sidebar-nav">
                    <NavLink to="/panel-admin/users" className="sidebar-link" end> 
                        <FaUsers /> Kelola User 
                    </NavLink>
                    <NavLink to="/panel-admin/folders" className="sidebar-link"> 
                        <FaFolder /> Kelola Folder 
                    </NavLink>
                    <NavLink to="/panel-admin/activities" className="sidebar-link"> 
                        <FaChartLine /> Laporan Aktivitas 
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

export default AdminSidebar;