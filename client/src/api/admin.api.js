import { apiClient } from './apiClient';

const resource = role => role === 'student' ? 'students' : 'faculty';

export const listAccounts = role => apiClient(`/admin/${resource(role)}`);
export const createAccount = (role, body) => apiClient(`/admin/${resource(role)}`, { method: 'POST', body });
export const setAccountActive = (role, id, active) => apiClient(`/admin/${resource(role)}/${id}/status`, { method: 'PATCH', body: { active } });
export const changeAccountPassword = (id, newPassword) => apiClient(`/admin/accounts/${id}/password`, { method: 'POST', body: { newPassword } });
