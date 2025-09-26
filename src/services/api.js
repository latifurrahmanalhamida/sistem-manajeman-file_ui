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

// --- HELPER: Ambil CSRF Cookie untuk Sanctum SPA --- //
export const ensureCsrfCookie = async () => {
  try {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
      withCredentials: true,
    });
  } catch (err) {
    console.error("Gagal ambil CSRF cookie:", err);
  }
};

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


// Ambil daftar backup
export const fetchBackups = () => {
  return apiClient.get("/backup/list");
};

// Jalankan backup manual
export const createBackup = () => {
  return apiClient.post("/backup/run");
};

// Download backup berdasarkan ID
// export const downloadBackup = (id) =>
//   apiClient.get(`/backup/download/${id}`, {
//     responseType: "blob",
//     headers: {
//       "Cache-Control": "no-cache",
//       "Pragma": "no-cache",
//       "Accept": "application/zip",   // penting
//       "Range": "bytes=0-",           // minta full file dari awal
//     },
//   });

export const downloadBackup = (id) =>
  apiClient.get(`/backup/download/${id}`, { responseType: "blob" });

// export const downloadBackup = (id) => {
//   return apiClient.get(`/backup/download/${id}`, {
//     responseType: "blob",
//   });
// };

// Hapus backup berdasarkan ID
export const deleteBackup = (id) => {
  return apiClient.delete(`/backup/${id}`);
};

// Ambil setting backup
export const fetchBackupSettings = async () => {
  await ensureCsrfCookie(); // wajib untuk Sanctum SPA
  const res = await apiClient.get("/backup/settings");
  return res.data;
};

// Update setting backup
export const updateBackupSettings = async (backup_path) => {
  await ensureCsrfCookie(); // wajib
  const res = await apiClient.post("/backup/settings", { backup_path });
  return res.data;
};

export const fetchBackupSchedule = async () => {
  await ensureCsrfCookie(); // wajib untuk Sanctum SPA
  const res = await apiClient.get("/backup/schedule");
  return res.data;
}
export const updateBackupSchedule = async (schedule) => {
  await ensureCsrfCookie(); // wajib
  const res = await apiClient.post("/backup/schedule", schedule );
  return res.data;
};

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

export default apiClient;