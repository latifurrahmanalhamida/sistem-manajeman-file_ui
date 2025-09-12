import React, { useState, useRef } from 'react';
import { uploadFile } from '../../services/api';
import './FileUploadForm.css';
import { FaUpload } from 'react-icons/fa';
import Notification from '../Notification/Notification';
import ProgressModal from '../Modal/ProgressModal';

const FileUploadForm = ({ onUploadComplete, onConflict, currentFolderId = null, divisionId = null }) => {
    const [uploadQueue, setUploadQueue] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    
    const [notification, setNotification] = useState({
        isOpen: false,
        message: '',
        type: ''
    });

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const handleFileSelection = (files) => {
        const newFiles = Array.from(files).map(file => ({
            file,
            id: file.name + '_' + Date.now(),
            status: 'pending',
            progress: 0,
            uploadedBytes: 0,
            totalBytes: file.size,
            controller: new AbortController()
        }));

        setUploadQueue(prevQueue => [...prevQueue, ...newFiles]);
        setNotification({ isOpen: true, message: '', type: '' });
    };

    const handleFileChange = (e) => {
        handleFileSelection(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploadModalOpen(true);

        let successfulUploads = 0;
        let hasConflict = false;

        for (let i = 0; i < uploadQueue.length; i++) {
            let fileItem = uploadQueue[i];

            if (fileItem.status === 'completed' || fileItem.status === 'failed' || fileItem.status === 'canceled') {
                continue;
            }

            setUploadQueue(prevQueue =>
                prevQueue.map(item =>
                    item.id === fileItem.id ? { ...item, status: 'uploading' } : item
                )
            );

            const formData = new FormData();
            formData.append('file', fileItem.file);
            if (currentFolderId) {
                formData.append('folder_id', currentFolderId);
            } else if (divisionId) {
                formData.append('division_id', divisionId);
            }

            try {
                await uploadFile(formData, {}, {
                    signal: fileItem.controller.signal,
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadQueue(prevQueue =>
                            prevQueue.map(item =>
                                item.id === fileItem.id
                                    ? { ...item, progress: percentCompleted, uploadedBytes: progressEvent.loaded, totalBytes: progressEvent.total }
                                    : item
                            )
                        );
                    }
                });
                setUploadQueue(prevQueue =>
                    prevQueue.map(item =>
                        item.id === fileItem.id ? { ...item, status: 'completed', progress: 100 } : item
                    )
                );
                successfulUploads++;
            } catch (err) {
                if (err.name === 'AbortError') {
                    console.log(`Upload for ${fileItem.name} was canceled.`);
                } else if (err.response && err.response.status === 409) {
                    onConflict(fileItem.file, err.response.data.message);
                    hasConflict = true;
                    setUploadQueue(prevQueue =>
                        prevQueue.map(item =>
                            item.id === fileItem.id ? { ...item, status: 'failed' } : item
                        )
                    );
                    break;
                } else {
                    setNotification({ isOpen: true, message: `Gagal mengunggah file ${fileItem.name}. Silakan coba lagi.`, type: 'error' });
                    console.error(err);
                    setUploadQueue(prevQueue =>
                        prevQueue.map(item =>
                            item.id === fileItem.id ? { ...item, status: 'failed' } : item
                        )
                    );
                }
            }
        }
        setIsUploadModalOpen(false);
        setUploadQueue([]);
        if (successfulUploads > 0 && !hasConflict) {
            setNotification({ isOpen: true, message: `${successfulUploads} file berhasil diunggah!`, type: 'success' });
            onUploadComplete();
        } else if (hasConflict) {
            // onConflict would have handled the notification
        } else if (successfulUploads === 0 && !hasConflict) {
            setNotification({ isOpen: true, message: 'Tidak ada file yang berhasil diunggah.', type: 'error' });
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
        handleFileSelection(e.dataTransfer.files);
    };

    const handleCancelUpload = (id) => {
        setUploadQueue(prevQueue =>
            prevQueue.map(fileItem => {
                if (fileItem.id === id && fileItem.status === 'uploading') {
                    fileItem.controller.abort();
                    return { ...fileItem, status: 'canceled', progress: 0, uploadedBytes: 0 };
                }
                return fileItem;
            })
        );
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
                            multiple
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                        />
                        <div className="drop-zone-icon"><FaUpload /></div>
                        <p>Seret & lepas file di sini, atau klik untuk memilih file</p>
                    </div>

                    {uploadQueue.length > 0 && (
                        <div className="file-preview">
                            <p>{uploadQueue.length} file terpilih: {uploadQueue.map(f => f.file?.name).join(', ')}</p>
                        </div>
                    )}

                    <button type="submit" className="upload-button" disabled={uploadQueue.length === 0 || isUploadModalOpen}>
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

            <ProgressModal
                isOpen={isUploadModalOpen}
                filesToUpload={uploadQueue}
                onCancel={handleCancelUpload}
                onClose={() => setIsUploadModalOpen(false)}
            />
        </>
    );
}

export default FileUploadForm;