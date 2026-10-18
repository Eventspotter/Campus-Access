import { apiClient } from './apiClient';
export const listNotices = () => apiClient('/notices');
export const getSummary = () => apiClient('/notices/summary/me');
export const markNoticeRead = id => apiClient(`/notices/${id}/read`, { method: 'PATCH', body: {} });
