import axios from 'axios';

// Custom Axios instance
const api = axios.create({
    baseURL: '/api',
    withCredentials: true, // Send session cookie
});

// Redirect to login if session expires
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            if (!window.location.pathname.startsWith('/login') &&
                !window.location.pathname.startsWith('/register')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
