// src/pages/FavoritesPage.js

import React from 'react';
import { getFavorites } from '../services/api';
import useFileFetcher from '../hooks/useFileFetcher';
import './DashboardView.css'; 

const FavoritesPage = () => {
    const { files, loading } = useFileFetcher(getFavorites);

    if (loading) return <div>Loading favorite files...</div>;

    return (
        <div className="division-dashboard">
            <div className="dashboard-toolbar">
                <h1>File Favorit</h1>
            </div>
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Pemilik</th>
                            <th>Divisi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map(file => (
                            <tr key={file.id}>
                                <td>{file.nama_file_asli}</td>
                                <td>{file.uploader?.name ?? 'User Dihapus'}</td>
                                <td>{file.division?.name ?? 'Tidak Ada Divisi'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FavoritesPage;