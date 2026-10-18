import { apiClient } from './apiClient';
const resource = role => role === 'student' ? 'students' : 'faculty';
export const listAccounts = role => apiClient(`/admin/${resource(role)}`);
export const createAccount = (role, body) => apiClient(`/admin/${resource(role)}`, { method: 'POST', body });
export const setAccountActive = (role, id, active) => apiClient(`/admin/${resource(role)}/${id}/status`, { method: 'PATCH', body: { active } });
export const createNotice = body => apiClient('/admin/notices', { method: 'POST', body });
export const recordAttendance = (id, body) => apiClient(`/admin/attendance/${id}`, { method: 'PUT', body });
export const changeAccountPassword = (id, newPassword) => apiClient(`/admin/accounts/${id}/password`, { method: 'POST', body: { newPassword } });
export async function importStudents(file) {
  const response = await fetch('/api/admin/students/import', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'text/csv' }, body: await file.text() });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Import failed.');
  return data;
}
export async function downloadAccounts(role) {
  const response = await fetch(`/api/admin/${resource(role)}/export`, { credentials: 'same-origin' });
  if (!response.ok) throw new Error('Download failed.');
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a'); link.href = url; link.download = `${role}-accounts.xlsx`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
