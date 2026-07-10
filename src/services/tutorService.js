import api from './api';

// Normalize backend tutor data to match frontend field expectations
function normalizeTutor(t) {
  if (!t) return t;
  return {
    ...t,
    id: t.id || t._id || '',
    name: t.name || t.fullName || 'Anonymous Tutor',
    about: t.about || t.bio || 'No biography details provided.',
    modes: t.modes || (t.teachingMode
      ? (t.teachingMode === 'Both' ? ['Online', 'Offline'] : [t.teachingMode])
      : ['Online']),
    experience: t.experience !== undefined ? t.experience : (t.experienceYears || 3),
  };
}

// Safely extract array list of tutors from API response and normalize them
function extractTutorList(resData) {
  if (Array.isArray(resData)) {
    return resData.map(normalizeTutor);
  }
  if (resData && Array.isArray(resData.data)) {
    return resData.data.map(normalizeTutor);
  }
  if (resData && Array.isArray(resData.tutors)) {
    return resData.tutors.map(normalizeTutor);
  }
  if (resData && typeof resData === 'object') {
    return [normalizeTutor(resData)];
  }
  return [];
}

export const tutorService = {
  async registerTutor(formData) {
    const response = await api.post('/tutors', formData);
    return response.data;
  },

  async getTutors(filters = {}) {
    try {
      const response = await api.get('/tutors', { params: filters });
      return extractTutorList(response.data);
    } catch (error) {
      console.error('tutorService.getTutors error:', error);
      throw error;
    }
  },

  async getTutorById(id) {
    try {
      const response = await api.get(`/tutors/${id}`);
      const rawData = response.data && response.data.data ? response.data.data : response.data;
      return normalizeTutor(rawData);
    } catch (error) {
      console.error(`tutorService.getTutorById error for ID ${id}:`, error);
      throw error;
    }
  },

  async getFeaturedTutors() {
    try {
      const response = await api.get('/tutors', { params: { featured: true } });
      const list = extractTutorList(response.data);
      return list.filter(t => t.featured);
    } catch (error) {
      console.error('tutorService.getFeaturedTutors error:', error);
      return [];
    }
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

