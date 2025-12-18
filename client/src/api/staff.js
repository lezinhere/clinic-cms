import api from './auth';

export const staffApi = {
    // Pharmacy
    getPharmacyQueue: () => api.get('/pharmacy/queue'),
    getPharmacyHistory: (search) => api.get(`/pharmacy/history?search=${search || ''}`),
    dispensePrescription: (id, staffId) => api.post(`/pharmacy/dispense/${id}`, { staffId }),

    // Lab
    getLabRequests: () => api.get('/lab/requests'),
    getLabHistory: (search) => api.get(`/lab/history?search=${search || ''}`),
    completeLabRequest: (id, data) => api.post(`/lab/complete/${id}`, data),
};
