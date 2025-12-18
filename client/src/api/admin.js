import api from './auth';

export const adminApi = {
    getAllStaff: () => api.get('/admin/staff'),
    createStaffMember: (data) => api.post('/admin/staff', data),
    updateStaffMember: (id, data) => api.put(`/admin/staff/${id}`, data),
    deleteStaffMember: (id) => api.delete(`/admin/staff/${id}`),
};
