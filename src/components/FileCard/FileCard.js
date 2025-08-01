// src/components/FileCard/FileCard.js
import React from 'react';
import './FileCard.css';
import { FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaFileArchive, FaFile } from 'react-icons/fa';

// Fungsi helper untuk memilih ikon berdasarkan tipe file
const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return <FaFileImage color="#0d6efd" />;
    if (['pdf'].includes(extension)) return <FaFilePdf color="#dc3545" />;
    if (['doc', 'docx'].includes(extension)) return <FaFileWord color="#0d6efd" />;
    if (['xls', 'xlsx'].includes(extension)) return <FaFileExcel color="#198754" />;
    if (['zip', 'rar', '7z'].includes(extension)) return <FaFileArchive color="#6c757d" />;
    return <FaFile color="#6c757d" />;
};

const FileCard = ({ file }) => {
    return (
        <div className="file-card">
            <div className="file-icon">
                {getFileIcon(file.nama_file_asli)}
            </div>
            <p className="file-name">{file.nama_file_asli}</p>
        </div>
    );
};

export default FileCard;