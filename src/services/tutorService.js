import api from './api';

export const tutorService = {
  async registerTutor(formData) {
    const debugObj = {};
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        debugObj[key] = `[File: ${value.name}]`;
      } else {
        try { debugObj[key] = JSON.parse(value); } catch { debugObj[key] = value; }
      }
    }
    console.log('Sending tutor object to API:', debugObj);

    const response = await api.post('/tutors', formData);
    return response.data;
  },

  async getTutors(filters = {}) {
    const response = await api.get('/tutors', { params: filters });
    console.log('API Response (Get Tutors):', response.data);
    return response.data;
  },

  async getTutorById(id) {
    const response = await api.get(`/tutors/${id}`);
    return response.data;
  },

  async getFeaturedTutors() {
    const response = await api.get('/tutors', { params: { featured: true } });
    return Array.isArray(response.data) ? response.data.filter(t => t.featured) : [];
  },

  async updateTutor(id, data) {
    const response = await api.put(`/tutors/${id}`, data);
    return response.data;
  },

  async deleteTutor(id) {
    const response = await api.delete(`/tutors/${id}`);
    return response.data;
  }
};
