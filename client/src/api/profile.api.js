import { apiClient } from './apiClient';
export const getProfile = () => apiClient('/profile/me');
export const updateProfile = body => apiClient('/profile/me', { method: 'PATCH', body });
export async function uploadAvatar(file) {
  const response = await fetch('/api/profile/avatar', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': file.type }, body: file });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Upload failed.');
  return data;
}
