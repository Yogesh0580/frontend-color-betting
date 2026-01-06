import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data)
};

// Game API
export const gameAPI = {
    getCurrentGame: () => api.get('/game/current'),
    placeBet: (data) => api.post('/game/bet', data),
    getGameHistory: (page = 1) => api.get(`/game/history?page=${page}`),
    getMyBets: (page = 1) => api.get(`/game/my-bets?page=${page}`),
    getRecentResults: () => api.get('/game/recent-results')
};

// Wallet API
export const walletAPI = {
    getBalance: () => api.get('/wallet/balance'),
    getPaymentDetails: (amount) => api.get(`/wallet/payment-details?amount=${amount}`),
    submitRecharge: (data) => api.post('/wallet/recharge', data),
    getRechargeStatus: () => api.get('/wallet/recharge-status'),
    requestWithdraw: (data) => api.post('/wallet/withdraw', data),
    getWithdrawStatus: () => api.get('/wallet/withdraw-status'),
    getTransactions: (page = 1, type = '') => api.get(`/wallet/transactions?page=${page}&type=${type}`)
};

// Admin API
export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: (page = 1, search = '') => api.get(`/admin/users?page=${page}&search=${search}`),
    toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
    getRecharges: (status = 'pending') => api.get(`/admin/recharges?status=${status}`),
    approveRecharge: (id, note = '') => api.put(`/admin/recharges/${id}/approve`, { note }),
    rejectRecharge: (id, note = '') => api.put(`/admin/recharges/${id}/reject`, { note }),
    getWithdrawals: (status = 'pending') => api.get(`/admin/withdrawals?status=${status}`),
    approveWithdrawal: (id, note = '') => api.put(`/admin/withdrawals/${id}/approve`, { note }),
    rejectWithdrawal: (id, note = '') => api.put(`/admin/withdrawals/${id}/reject`, { note }),
    getGameStats: () => api.get('/admin/game-stats'),
    getPaymentSettings: () => api.get('/admin/payment-settings'),
    updatePaymentSettings: (data) => api.put('/admin/payment-settings', data),
    // Live game control
    getLiveBets: () => api.get('/admin/live-bets'),
    setResult: (color) => api.post('/admin/set-result', { color }),
    clearResult: () => api.post('/admin/clear-result')
};

export default api;
