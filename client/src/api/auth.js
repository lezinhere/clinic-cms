import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const authApi = {
    staffLogin: (staffId, passcode) => api.post('/auth/staff-login', { staffId, passcode }),
    sendOtp: (phone) => api.post('/auth/otp/send', { phone }),
    verifyOtp: (phone, code) => api.post('/auth/otp/verify', { phone, code }),
    getStaffByRole: (role) => api.get(`/staff/${role}`)
};

export default api;
