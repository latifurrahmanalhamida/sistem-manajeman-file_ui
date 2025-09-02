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
export const getDivisionsWithFolders = () => apiClient.get('/admin/divisions-with-folders');

// File Management
export const getFiles = () => apiClient.get('/files');
export const uploadFile = (formData, options = {}, config = {}) => {
    const { overwrite = false, newName = null, folderId = null } = options;
    if (overwrite) {
        formData.append('overwrite', 'true');
    }
    if (newName) {
        formData.append('new_name', newName);
    }
    if (folderId) {
        formData.append('folder_id', folderId);
    }
    return apiClient.post('/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        ...config
    });
};
export const downloadFile = (fileId) => apiClient.get(`/files/${fileId}`, { responseType: 'blob' });
export const deleteFile = (fileId) => apiClient.delete(`/files/${fileId}`); // Soft delete

// Sidebar File Features
export const getRecentFiles = () => apiClient.get('/files/recent');
export const getFavorites = () => apiClient.get('/files/favorites');
export const getTrashedFiles = () => apiClient.get('/files/trashed');
export const toggleFavorite = (fileId) => apiClient.post(`/files/${fileId}/favorite`);
export const restoreFile = (fileId, options = {}) => {
    const { overwrite = false, newName = null } = options;
    const data = { overwrite, new_name: newName };
    return apiClient.post(`/files/${fileId}/restore`, data);
};
export const forceDeleteFile = (fileId) => apiClient.delete(`/files/${fileId}/force`);
export const renameFile = (fileId, newName) => apiClient.put(`/files/${fileId}/rename`, { new_name: newName });

// --- LOGIKA UNTUK BLOKIR LOGIN & SESSION TIMEOUT ---
// Catatan: Logika ini disediakan sebagai fungsi utilitas. Anda perlu mengintegrasikannya
// ke dalam komponen React Anda (misalnya, halaman Login, App.js, atau Context).

const MAX_LOGIN_ATTEMPTS = 3;
const LOGIN_LOCKOUT_TIME = 5 * 60 * 1000; // 5 menit

/**
 * Memeriksa apakah pengguna saat ini diblokir untuk mencoba login.
 * @returns {{isLocked: boolean, remainingTime: number}} - Mengembalikan status blokir dan sisa waktu dalam milidetik.
 * Cara Penggunaan: Panggil di halaman login Anda sebelum mencoba login.
 */
export const checkLoginLockout = () => {
    const lockoutUntil = localStorage.getItem('lockoutUntil');
    if (!lockoutUntil) {
        return { isLocked: false, remainingTime: 0 };
    }

    const remainingTime = parseInt(lockoutUntil, 10) - Date.now();
    if (remainingTime > 0) {
        return { isLocked: true, remainingTime };
    }

    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lockoutUntil');
    return { isLocked: false, remainingTime: 0 };
};

/**
 * Mencatat percobaan login yang gagal. Jika percobaan melebihi batas,
 * fungsi ini akan memblokir login selama waktu yang ditentukan.
 * Cara Penggunaan: Panggil di blok .catch() dari fungsi login Anda ketika API mengembalikan error password salah.
 */
export const recordFailedLoginAttempt = () => {
    const { isLocked } = checkLoginLockout();
    if (isLocked) {
        return; // Sudah dalam masa blokir
    }

    let attempts = parseInt(localStorage.getItem('loginAttempts') || '0', 10);
    attempts += 1;
    localStorage.setItem('loginAttempts', attempts.toString());

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
        const lockoutUntil = Date.now() + LOGIN_LOCKOUT_TIME;
        localStorage.setItem('lockoutUntil', lockoutUntil.toString());
    }
};

/**
 * Menghapus catatan percobaan login yang gagal.
 * Cara Penggunaan: Panggil fungsi ini saat login berhasil.
 */
export const clearLoginAttempts = () => {
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lockoutUntil');
};


// --- LOGIKA UNTUK SESSION INACTIVITY TIMEOUT ---

let inactivityTimer;
let warningTimer;

const INACTIVITY_LOGOUT_TIME = 15 * 60 * 1000; // 15 menit
const INACTIVITY_WARNING_TIME = 14 * 60 * 1000; // Peringatan pada 14 menit

/**
 * Memulai timer untuk memantau inaktivitas pengguna.
 * Cara Penggunaan: Panggil ini setelah pengguna berhasil login.
 * @param {function} onTimeout - Callback untuk logout (misalnya, membersihkan state, redirect ke /login).
 * @param {function} onWarning - Callback untuk menampilkan peringatan (misalnya, menampilkan modal).
 */
export const startInactivityTimer = (onTimeout, onWarning) => {
    clearTimeout(warningTimer);
    clearTimeout(inactivityTimer);

    warningTimer = setTimeout(onWarning, INACTIVITY_WARNING_TIME);
    inactivityTimer = setTimeout(onTimeout, INACTIVITY_LOGOUT_TIME);
};

/**
 * Mereset timer inaktivitas.
 * Cara Penggunaan: Panggil fungsi ini dari event listener global (untuk klik, keypress, dll.) di App.js.
 * Anda harus meneruskan kembali fungsi onTimeout dan onWarning yang sama.
 */
export const resetInactivityTimer = (onTimeout, onWarning) => {
    startInactivityTimer(onTimeout, onWarning);
};

/**
 * Menghentikan timer inaktivitas.
 * Cara Penggunaan: Panggil saat pengguna logout secara manual.
 */
export const stopInactivityTimer = () => {
    clearTimeout(warningTimer);
    clearTimeout(inactivityTimer);
};

export default apiClient;
