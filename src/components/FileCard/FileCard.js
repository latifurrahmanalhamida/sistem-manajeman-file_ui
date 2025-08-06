// src/components/FileCard/FileCard.js
import React from 'react';
import './FileCard.css';
import { FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaFileArchive, FaFile, FaDownload, FaTrash, FaStar, FaRegStar } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

// Fungsi helper untuk memilih ikon berdasarkan tipe file
const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return <FaFileImage size={40} color="#6c757d" />;
    if (['pdf'].includes(extension)) return <FaFilePdf size={40} color="#dc3545" />;
    if (['doc', 'docx'].includes(extension)) return <FaFileWord size={40} color="#0d6efd" />;
    if (['xls', 'xlsx'].includes(extension)) return <FaFileExcel size={40} color="#198754" />;
    if (['zip', 'rar', '7z'].includes(extension)) return <FaFileArchive size={40} color="#6c757d" />;
    return <FaFile size={40} color="#6c757d" />;
};

const FileCard = ({ file, onPreview, onDownload, onDelete, onToggleFavorite }) => {
    const { user } = useAuth();

    return (
        <div className="file-card">
            <div className="file-card-icon" onClick={() => onPreview(file)}>
                {getFileIcon(file.nama_file_asli)}
            </div>
            <p className="file-card-name" onClick={() => onPreview(file)}>
                {file.nama_file_asli}
            </p>
            <div className="file-card-actions">
                <button onClick={() => onToggleFavorite(file)} className="action-button" title="Favorite">
                    {file.is_favorited ? <FaStar color="#ffc107" /> : <FaRegStar color="#6c757d" />}
                </button>
                <button onClick={() => onDownload(file)} className="action-button" title="Download">
                    <FaDownload color="#0d6efd" />
                </button>
                {/* {(user?.role?.name === 'super_admin' || user?.role?.name === 'admin_devisi' || (user?.role?.name === 'user_devisi' && user?.id === file.uploader_id)) && ( */}
                    <button onClick={() => onDelete(file)} className="action-button" title="Delete">
                        <FaTrash color="#dc3545" />
                    </button>
                {/* )} */}
            </div>
        </div>
    );
};

export default FileCard;
