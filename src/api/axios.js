import axios from 'axios';

// all api calls go through this instance
// baseURL points to our express server (relative for production, proxied for dev)
const api = axios.create({
    baseURL: '/api',
    withCredentials: true, // so session cookie gets sent with every request
});

// Global 401 interceptor — if session expires anywhere, redirect to login immediately
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Avoid redirect loop if already on login/register page
            if (!window.location.pathname.startsWith('/login') &&
                !window.location.pathname.startsWith('/register')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
