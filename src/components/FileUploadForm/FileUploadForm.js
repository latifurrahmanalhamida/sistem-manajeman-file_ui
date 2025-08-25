import React, { useState, useRef } from 'react';
import { uploadFile } from '../../services/api';
import './FileUploadForm.css';
import { FaUpload } from 'react-icons/fa';
import Notification from '../Notification/Notification';
import ProgressModal from '../Modal/ProgressModal';

const FileUploadForm = ({ onUploadComplete, onConflict, currentFolderId = null }) => {
    const [uploadQueue, setUploadQueue] = useState([]); // Array to manage multiple file uploads
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    
    const [notification, setNotification] = useState({
        isOpen: false,
        message: '',
        type: ''
    });

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false); // Control visibility of ProgressModal

    const generateUniqueId = () => Math.random().toString(36).substring(2, 9);

    const handleFileSelection = (selectedFiles) => {
        const newFiles = Array.from(selectedFiles).map(file => ({
            id: generateUniqueId(), // To identify the file for cancellation
            file: file,
            name: file.name,
            progress: 0,
            uploadedBytes: 0,
            totalBytes: file.size,
            status: 'pending', // 'pending', 'uploading', 'completed', 'failed', 'canceled'
            controller: new AbortController() // For cancellation
        }));
        setUploadQueue(prevQueue => [...prevQueue, ...newFiles]);
    };

    const handleFileChange = (e) => {
        handleFileSelection(e.target.files);
    };

    const handleCancelUpload = (id) => {
        setUploadQueue(prevQueue =>
            prevQueue.map(fileItem => {
                if (fileItem.id === id && fileItem.status === 'uploading') {
                    fileItem.controller.abort(); // Abort the ongoing upload
                    return { ...fileItem, status: 'canceled', progress: 0, uploadedBytes: 0 };
                }
                return fileItem;
            })
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (uploadQueue.length === 0) {
            setNotification({ isOpen: true, message: 'Silakan pilih file terlebih dahulu.', type: 'error' });
            return;
        }

        setIsUploadModalOpen(true); // Open progress modal

        let successfulUploads = 0;
        let hasConflict = false;
        for (let i = 0; i < uploadQueue.length; i++) {
            let fileItem = uploadQueue[i];
            // Skip if already completed, failed, or canceled
            if (fileItem.status === 'completed' || fileItem.status === 'failed' || fileItem.status === 'canceled') {
                continue;
            }
            // Update status to uploading
            setUploadQueue(prevQueue =>
                prevQueue.map(item =>
                    item.id === fileItem.id ? { ...item, status: 'uploading' } : item
                )
            );
            const formData = new FormData();
            formData.append('file', fileItem.file);
            if (currentFolderId) {
                formData.append('folder_id', currentFolderId);
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

        for (let i = 0; i < uploadQueue.length; i++) {
            let fileItem = uploadQueue[i];

            // Skip if already completed, failed, or canceled
            if (fileItem.status === 'completed' || fileItem.status === 'failed' || fileItem.status === 'canceled') {
                continue;
            }

            // Update status to uploading
            setUploadQueue(prevQueue =>
                prevQueue.map(item =>
                    item.id === fileItem.id ? { ...item, status: 'uploading' } : item
                )
            );

            const formData = new FormData();
            formData.append('file', fileItem.file);

            try {
                await uploadFile(formData, {}, { // Pass empty options and config object
                    signal: fileItem.controller.signal, // Pass abort signal
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

                // Update status to completed
                setUploadQueue(prevQueue =>
                    prevQueue.map(item =>
                        item.id === fileItem.id ? { ...item, status: 'completed', progress: 100 } : item
                    )
                );
                successfulUploads++;

            } catch (err) {
                if (err.name === 'AbortError') {
                    // Already handled by handleCancelUpload
                    console.log(`Upload for ${fileItem.name} was canceled.`);
                } else if (err.response && err.response.status === 409) {
                    onConflict(fileItem.file, err.response.data.message);
                    hasConflict = true;
                    // Update status to failed due to conflict
                    setUploadQueue(prevQueue =>
                        prevQueue.map(item =>
                            item.id === fileItem.id ? { ...item, status: 'failed' } : item
                        )
                    );
                    // Optionally break if conflict should stop all uploads
                    break; 
                } else {
                    setNotification({ isOpen: true, message: `Gagal mengunggah file ${fileItem.name}. Silakan coba lagi.`, type: 'error' });
                    console.error(err);
                    // Update status to failed
                    setUploadQueue(prevQueue =>
                        prevQueue.map(item =>
                            item.id === fileItem.id ? { ...item, status: 'failed' } : item
                        )
                    );
                }
            }
        }

        // After all uploads (or break due to conflict)
        setIsUploadModalOpen(false); // Close progress modal
        setUploadQueue([]); // Clear queue after completion/attempt

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
                            <p>{uploadQueue.length} file terpilih: {uploadQueue.map(f => f.name).join(', ')}</p>
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
                filesToUpload={uploadQueue} // Pass the entire queue
                onCancel={handleCancelUpload} // Pass the cancel handler
                onClose={() => setIsUploadModalOpen(false)} // Allow closing if needed, or remove if modal auto-closes
            />
        </>
    );
}

export default FileUploadForm;

