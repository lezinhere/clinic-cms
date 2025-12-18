import api from './auth';

export const patientApi = {
    getDoctors: () => api.get('/patient/doctors'),
    bookAppointment: (data) => api.post('/patient/book', data),
    getHistory: (id) => api.get(`/patient/history/${id}`),
};
