import axios from 'axios';

// Buat instance axios dengan konfigurasi dasar
const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    headers: {
        'Accept': 'application/json',
    }
});

// Interceptor untuk menambahkan token secara otomatis
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// --- SEMUA FUNGSI API ANDA ---
export const loginUser = (credentials) => apiClient.post('/login', credentials);
export const logoutUser = () => apiClient.post('/logout');
export const getUser = () => apiClient.get('/user');

// User Management
export const getUsers = () => apiClient.get('/admin/users');
export const getUserById = (id) => apiClient.get(`/admin/users/${id}`);
export const createUser = (userData) => apiClient.post('/admin/users', userData);
export const updateUser = (id, data) => apiClient.put(`/admin/users/${id}`, data);
export const deleteUser = (userId) => apiClient.delete(`/admin/users/${userId}`);

// --- FUNGSI UNTUK USER TRASH ---
export const getTrashedUsers = () => {
    return apiClient.get('/admin/users/trashed');
};

export const restoreUser = (userId) => {
    return apiClient.put(`/admin/users/${userId}/restore`);
};

export const forceDeleteUser = (userId) => {
    return apiClient.delete(`/admin/users/${userId}/force-delete`);
};

// Division & Role Management
export const getRoles = () => apiClient.get('/admin/roles');
export const getDivisions = () => apiClient.get('/admin/divisions');

// File Management
export const getFiles = () => apiClient.get('/files');
export const uploadFile = (formData, options = {}) => {
    const { overwrite = false } = options;
    if (overwrite) {
        formData.append('overwrite', 'true');
    }
    return apiClient.post('/files', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
    });
};
export const downloadFile = (fileId) => apiClient.get(`/files/${fileId}`, { responseType: 'blob' });
export const deleteFile = (fileId) => apiClient.delete(`/files/${fileId}`); // Soft delete

// Sidebar File Features
export const getRecentFiles = () => apiClient.get('/files/recent');
export const getFavorites = () => apiClient.get('/files/favorites');
export const getTrashedFiles = () => apiClient.get('/files/trashed');
export const toggleFavorite = (fileId) => apiClient.post(`/files/${fileId}/favorite`);
export const restoreFile = (fileId) => apiClient.post(`/files/${fileId}/restore`);
export const forceDeleteFile = (fileId) => apiClient.delete(`/files/${fileId}/force`);

export default apiClient;