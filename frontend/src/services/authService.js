import api from './api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (this.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }
  }

  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      this.token = token;
      this.user = user;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { token, user };
    } catch (error) {
      throw error;
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    delete api.defaults.headers.common['Authorization'];
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  getUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }

  hasRole(role) {
    return this.user && this.user.role === role;
  }

  isAdmin() {
    return this.hasRole('admin');
  }

  isDestek() {
    return this.hasRole('destek');
  }

  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(data) {
    try {
      const response = await api.put('/auth/change-password', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const response = await api.post('/auth/users', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getUsers() {
    try {
      const response = await api.get('/auth/users');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/auth/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const response = await api.delete(`/auth/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();