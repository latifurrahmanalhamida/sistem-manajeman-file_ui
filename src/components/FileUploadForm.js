import React, { useState } from 'react';
import apiClient from '../services/api';

// Terima prop 'onUploadSuccess' untuk memberitahu Dashboard bahwa upload berhasil
const FileUploadForm = ({ onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Pilih file terlebih dahulu.');
            return;
        }

        setIsUploading(true);
        setError('');

        // Gunakan FormData untuk mengirim file
        const formData = new FormData();
        formData.append('document', selectedFile); // 'document' harus cocok dengan nama di backend

        try {
            const response = await apiClient.post('/api/files', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Jika berhasil, panggil fungsi prop dan reset form
            onUploadSuccess(response.data);
            setSelectedFile(null);

        } catch (err) {
            console.error('Upload error:', err);
            setError('Upload gagal. Pastikan file tidak lebih dari 2MB.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div style={{ border: '1px dashed #ccc', padding: '20px', borderRadius: '8px' }}>
            <h4>Upload Dokumen Baru</h4>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? 'Mengunggah...' : 'Upload'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default FileUploadForm;