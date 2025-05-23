import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5052';

console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    if (error.response?.status >= 500) {
      console.error('Server Error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export const emailAPI = {
  getEmails: (params = {}) => api.get('/emails', { params }),
  
  getEmailById: (id) => api.get(`/emails/${id}`),
  
  updateEmail: (id, data) => api.put(`/emails/${id}`, data),
  
  forwardEmail: (id, data) => api.post(`/emails/${id}/forward`, data),
  
  replyEmail: (id, data) => api.post(`/emails/${id}/reply`, data),
  
  downloadAttachment: (attachmentId) => {
    return api.get(`/emails/attachments/${attachmentId}/download`, {
      responseType: 'blob'
    });
  },
  
  getStats: () => api.get('/emails/stats'),
};

export default api;