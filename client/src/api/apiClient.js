export async function apiClient(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, { method, credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  } catch { throw new Error('Unable to connect. Check your connection and try again.'); }
  const data = await response.json().catch(() => ({ message: 'The server is unavailable. Please try again.' }));
  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') window.dispatchEvent(new Event('session-expired'));
    throw Object.assign(new Error(data.message || 'Request failed.'), { status: response.status });
  }
  return data;
}
