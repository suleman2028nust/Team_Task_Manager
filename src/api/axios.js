import axios from 'axios';

// all api calls go through this instance
// baseURL points to our express server (relative for production, proxied for dev)
const api = axios.create({
    baseURL: '/api',
    withCredentials: true, // so session cookie gets sent with every request
});

export default api;
