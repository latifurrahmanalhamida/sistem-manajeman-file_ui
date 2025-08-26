// src/pages/RecentFilesPage.js

import React, { useState, useMemo, useEffect } from 'react';
import { getRecentFiles, getDivisions } from '../services/api';
import useFileFetcher from '../hooks/useFileFetcher';
import FilterBar from '../components/FilterBar/FilterBar';
import { useAuth } from '../context/AuthContext'; // Use useAuth hook
import './DashboardView.css';

const RecentFilesPage = () => {
    const { files, loading } = useFileFetcher(getRecentFiles);
    const { user } = useAuth(); // Get user from useAuth hook

    const [fileType, setFileType] = useState('');
    const [modifiedDate, setModifiedDate] = useState('');
    const [ownerSearch, setOwnerSearch] = useState('');
    const [divisions, setDivisions] = useState([]);
    const [divisionFilter, setDivisionFilter] = useState('');

    useEffect(() => {
        const fetchDivisionsData = async () => {
            try {
                const response = await getDivisions();
                setDivisions(response.data);
            } catch (error) {
                console.error('Failed to fetch divisions:', error);
            }
        };
        fetchDivisionsData();
    }, []);

    const filteredFiles = useMemo(() => {
        let currentFiles = [...files];

        // Apply owner search filter
        if (ownerSearch) {
            currentFiles = currentFiles.filter(file =>
                (file.uploader?.name ?? '').toLowerCase().includes(ownerSearch.toLowerCase())
            );
        }

        // Apply file type filter
        if (fileType) {
            currentFiles = currentFiles.filter(file => {
                const extension = file.nama_file_asli.split('.').pop().toLowerCase();
                if (fileType === 'doc') return ['doc', 'docx'].includes(extension);
                if (fileType === 'xls') return ['xls', 'xlsx'].includes(extension);
                if (fileType === 'jpg') return ['jpg', 'jpeg'].includes(extension);
                return extension === fileType;
            });
        }

        // Apply modified date filter
        if (modifiedDate) {
            currentFiles = currentFiles.filter(file => {
                const fileDate = new Date(file.created_at);
                const now = new Date();
                now.setHours(0, 0, 0, 0); // Normalize to start of day

                if (modifiedDate === 'today') {
                    return fileDate.toDateString() === now.toDateString();
                } else if (modifiedDate === '7days') {
                    const sevenDaysAgo = new Date(now);
                    sevenDaysAgo.setDate(now.getDate() - 7);
                    return fileDate >= sevenDaysAgo;
                } else if (modifiedDate === '30days') {
                    const thirtyDaysAgo = new Date(now);
                    thirtyDaysAgo.setDate(now.getDate() - 30);
                    return fileDate >= thirtyDaysAgo;
                } else if (modifiedDate === '1year') {
                    const oneYearAgo = new Date(now);
                    oneYearAgo.setFullYear(now.getFullYear() - 1);
                    return fileDate >= oneYearAgo;
                }
                return true;
            });
        }

        // Apply division filter
        if (divisionFilter) {
            currentFiles = currentFiles.filter(file =>
                file.division?.id === parseInt(divisionFilter)
            );
        }

        return currentFiles;
    }, [files, fileType, modifiedDate, ownerSearch, divisionFilter, divisions]); // Removed sort from dependency array

    if (loading) return <div>Loading recent files...</div>;

    return (
        <div className="division-dashboard">
            <div className="dashboard-toolbar">
                <h1>File Terbaru (7 Hari Terakhir)</h1>
            </div>
            <FilterBar
                onFileTypeChange={setFileType}
                onModifiedDateChange={setModifiedDate}
                onOwnerSearch={setOwnerSearch}
                userRole={user?.role?.id} // Pass user role ID
                divisions={divisions}
                onDivisionChange={setDivisionFilter}
            />
            <div className="file-table-container">
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
                        {filteredFiles.map(file => (
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
