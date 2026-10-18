import { apiClient } from './apiClient';

export const login = credentials => apiClient('/auth/login', { method: 'POST', body: credentials });
export const logout = () => apiClient('/auth/logout', { method: 'POST', body: {} });
export const getMe = () => apiClient('/auth/me');
