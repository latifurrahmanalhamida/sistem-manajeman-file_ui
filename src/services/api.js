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


export const loginUser = (credentials) => {
    return apiClient.post('/login', credentials);
};

export const logoutUser = () => {
    return apiClient.post('/logout');
};

export const getUser = () => {
    return apiClient.get('/user');
};

export const getUsers = () => {
    return apiClient.get('/admin/users'); // Memanggil endpoint yang sudah kita buat
};
export const createUser = (userData) => {
    return apiClient.post('/admin/users', userData); // Memanggil endpoint store
};
export const getRoles = () => {
    // Kita asumsikan endpoint ini ada, kita akan buat di backend nanti jika perlu
    // Untuk sekarang, kita bisa buat endpointnya
    return apiClient.get('/admin/roles'); 
};

export const getDivisions = () => {
    return apiClient.get('/admin/divisions');
};

export const getFiles = () => {
    return apiClient.get('/files');
}
// --- Akhir dari bagian yang hilang ---


export default apiClient;