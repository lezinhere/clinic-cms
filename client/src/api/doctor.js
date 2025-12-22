import api from './auth';

export const doctorApi = {
    getAppointments: (doctorId) => api.get(`/doctor/appointments/${doctorId}`),
    getHistory: (doctorId, search) => api.get(`/doctor/history/${doctorId}?search=${search || ''}`),
    getAppointment: (id) => api.get(`/doctor/appointment/${id}`),
    searchMedicines: (query) => api.get(`/doctor/medicines/search?query=${query}`),
    searchLabs: (query) => api.get(`/doctor/labs/search?query=${query}`),
    submitConsultation: (data) => api.post('/doctor/consult/submit', data),
    instantBook: (data) => api.post('/doctor/instant-book', data),
    cancelAppointment: (id) => api.patch(`/doctor/appointment/${id}`, { status: 'CANCELLED' }),
};
