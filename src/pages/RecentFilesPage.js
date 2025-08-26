// src/pages/RecentFilesPage.js

import React from 'react';
import { getRecentFiles } from '../services/api';
import useFileFetcher from '../hooks/useFileFetcher';
import './DashboardView.css'; 

const RecentFilesPage = () => {
    const { files, loading } = useFileFetcher(getRecentFiles);

    if (loading) return <div>Loading recent files...</div>;

    return (
        <div className="division-dashboard">
            <div className="dashboard-toolbar">
                <h1>File Terbaru (7 Hari Terakhir)</h1>
            </div>
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Pemilik</th>
                            <th>Divisi</th>
                            <th>Tanggal Upload</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map(file => (
                            <tr key={file.id}>
                                <td>{file.nama_file_asli}</td>
                                <td>{file.uploader?.name ?? 'User Dihapus'}</td>
                                <td>{file.division?.name ?? 'Tidak Ada Divisi'}</td>
                                <td>{new Date(file.created_at).toLocaleDateString('id-ID')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentFilesPage;