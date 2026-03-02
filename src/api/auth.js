import { api, getToken, setToken, setStoredUser, clearAuth, getStoredUser } from './client.js';

export async function register({ email, password, displayName }) {
  const data = await api.post('/api/auth/register', { email, password, displayName });
  setToken(data.token);
  setStoredUser(data.user);
  return data;
}

export async function login({ email, password }) {
  const data = await api.post('/api/auth/login', { email, password });
  setToken(data.token);
  setStoredUser(data.user);
  return data;
}

export async function getCurrentUser() {
  const data = await api.get('/api/auth/me');
  setStoredUser(data.user);
  return data.user;
}

export async function forgotPassword(email) {
  return api.post('/api/auth/forgot-password', { email });
}

export async function resetPassword(token, password) {
  return api.post('/api/auth/reset-password', { token, password });
}

export function logout() {
  clearAuth();
}

export function isAuthenticated() {
  return !!getToken();
}

export function getCachedUser() {
  return getStoredUser();
}
