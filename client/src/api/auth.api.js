import { apiClient } from './apiClient';
export const login = credentials => apiClient('/auth/login', { method: 'POST', body: credentials });
export const logout = () => apiClient('/auth/logout', { method: 'POST', body: {} });
export const getMe = () => apiClient('/auth/me');
export const requestPasswordReset = email => apiClient('/auth/password/request', { method: 'POST', body: { email } });
export const resetPassword = (token, password) => apiClient('/auth/password/reset', { method: 'POST', body: { token, password } });
export const setupMfa = password => apiClient('/auth/mfa/setup', { method: 'POST', body: { password } });
export const confirmMfa = code => apiClient('/auth/mfa/confirm', { method: 'POST', body: { code } });
export const disableMfa = (password, code) => apiClient('/auth/mfa/disable', { method: 'POST', body: { password, code } });
