// src/pages/PilihDivisiPage.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import { FaFolder, FaDatabase } from 'react-icons/fa';
import './PilihDivisiPage.css'; // Kita akan buat file CSS ini

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const PilihDivisiPage = () => {
    const [divisions, setDivisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

    // BARU: Logika untuk mengurutkan data divisi
    const processedDivisions = React.useMemo(() => {
        if (divisions.length === 0) return [];

        // Cari tahu ukuran penyimpanan maksimum
        const maxStorage = Math.max(...divisions.map(d => d.total_storage), 1); // hindari pembagian dengan nol

        // Urutkan data
        let sortableItems = divisions.map(division => ({
            ...division,
            // Hitung persentase penyimpanan
            storage_percentage: (division.total_storage / maxStorage) * 100,
        }));

        // ... sisa logika sorting tetap sama ...
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [divisions, sortConfig]);

    // BARU: Fungsi untuk mengubah konfigurasi urutan
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    useEffect(() => {
        const fetchDivisions = async () => {
            try {
                const response = await apiClient.get('/admin/divisions-with-stats');
                setDivisions(response.data);
            } catch (err) {
                setError('Gagal memuat data divisi.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDivisions();
    }, []);

    if (loading) return <div>Memuat data divisi...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="pilih-divisi-page">
            <h1>Pilih Divisi untuk Dikelola</h1>
                <div className="sort-controls">
                <span>Urutkan berdasarkan:</span>
                <button onClick={() => requestSort('name')} className={sortConfig.key === 'name' ? 'active' : ''}>
                    Nama
                </button>
                <button onClick={() => requestSort('total_storage')} className={sortConfig.key === 'total_storage' ? 'active' : ''}>
                    Ukuran
                </button>
                <button onClick={() => requestSort('folders_count')} className={sortConfig.key === 'folders_count' ? 'active' : ''}>
                    Folder
                </button>
            </div>
            <div className="division-grid">
                {processedDivisions.map(division => (
                    <Link 
                        key={division.id} 
                        to={`/super-admin/kelola-folder/divisi/${division.id}`} 
                        className="division-card"
                    >
                        <h3>{division.name}</h3>
                        <div className="division-stats">
                            <span><FaFolder /> {division.folders_count} Folder</span>
                            <div className="storage-info">
                                <span><FaDatabase /> {formatBytes(division.total_storage)}</span>
                                
                                {/* --- PROGRESS BAR YANG DITAMBAHKAN --- */}
                                <div className="progress-bar">
                                    <div 
                                        className="progress-bar-fill" 
                                        style={{ width: `${division.storage_percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default PilihDivisiPage;