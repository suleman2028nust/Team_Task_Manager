import axios from 'axios';

// all api calls go through this instance
// baseURL points to our express server
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true, // so session cookie gets sent with every request
});

export default api;
