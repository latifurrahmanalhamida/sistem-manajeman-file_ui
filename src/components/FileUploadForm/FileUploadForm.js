// src/components/FileUploadForm/FileUploadForm.js

import React, { useState, useRef } from 'react';
import { uploadFile } from '../../services/api';
import './FileUploadForm.css';
import { FaUpload } from 'react-icons/fa';
import Notification from '../Notification/Notification';

const FileUploadForm = ({ onUploadComplete, onConflict }) => {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    
    const [notification, setNotification] = useState({
        isOpen: false,
        message: '',
        type: ''
    });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) setFile(selectedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setNotification({ isOpen: true, message: 'Silakan pilih file terlebih dahulu.', type: 'error' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            await uploadFile(formData);
            setNotification({ isOpen: true, message: 'File berhasil diunggah!', type: 'success' });
        } catch (err) {
            if (err.response && err.response.status === 409) {
                // File sudah ada, panggil onConflict dengan file dan pesan error
                onConflict(file, err.response.data.message);
            } else {
                setNotification({ isOpen: true, message: 'Gagal mengunggah file. Silakan coba lagi.', type: 'error' });
                console.error(err);
            }
        }
    };
    
    const closeNotification = () => {
        if (notification.type === 'success') {
            onUploadComplete();
        }
        setNotification({ isOpen: false, message: '', type: '' });
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) setFile(droppedFile);
    };

    return (
        <>
            <div className="upload-form-container">
                <form onSubmit={handleSubmit}>
                    <div
                        className={`drop-zone ${isDragging ? 'is-active' : ''}`}
                        onClick={() => fileInputRef.current.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                        />
                        <div className="drop-zone-icon"><FaUpload /></div>
                        <p>Seret & lepas file di sini, atau klik untuk memilih file</p>
                    </div>

                    {file && (
                        <div className="file-preview">
                            <p>File terpilih: {file.name}</p>
                        </div>
                    )}
                    
                    <button type="submit" className="upload-button" disabled={!file}>
                        Upload
                    </button>
                </form>
            </div>
            
            {notification.isOpen && (
                <Notification 
                    message={notification.message}
                    type={notification.type}
                    onClose={closeNotification} 
                />
            )}
        </>
    );
};

export default FileUploadForm;