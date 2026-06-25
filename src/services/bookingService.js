import api from './api';

// Toggle via Vite env var `VITE_USE_MOCK` (set to "false" to call the local API)
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'false' ? false : true;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const bookingService = {
  async bookDemo(bookingData) {
    if (!USE_MOCK) {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    }

    await delay(1200); // Simulate API latency
    console.log('Demo booked successfully:', bookingData);
    return {
      success: true,
      message: 'Demo class booked successfully! Our team will reach out to you within 2 hours.',
      bookingId: 'BK-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    };
  },

  async registerTutor(tutorData) {
    if (!USE_MOCK) {
      const response = await api.post('/tutors/register', tutorData);
      return response.data;
    }

    await delay(2000); // Simulate processing files and credentials
    console.log('Tutor registered successfully (mock):', tutorData);
    return {
      success: true,
      message: 'Registration application submitted! We will review your profile and contact you soon.',
      applicationId: 'APP-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    };
  },

  async subscribeNewsletter(email) {
    if (!USE_MOCK) {
      const response = await api.post('/newsletter/subscribe', { email });
      return response.data;
    }

    await delay(800);
    console.log('Newsletter subscription:', email);
    return {
      success: true,
      message: 'Subscribed successfully! Thank you for staying tuned.'
    };
  },

  async submitContact(contactData) {
    if (!USE_MOCK) {
      const response = await api.post('/contact', contactData);
      return response.data;
    }

    await delay(1000);
    console.log('Contact form submitted:', contactData);
    return {
      success: true,
      message: 'Your message has been received! Our support representative will email you shortly.'
    };
  }
};
