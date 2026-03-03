import { api, setStoredUser } from './client.js';

export async function getUserProfile() {
  const data = await api.get('/api/users/profile');
  return data.user;
}

export async function getGlobalLeaderboard() {
  const data = await api.get('/api/users/leaderboard');
  return { leaderboard: data.leaderboard, season: data.season };
}

export async function getMonthlyLeaderboard(year, month) {
  const data = await api.get(`/api/users/leaderboard/monthly?year=${year}&month=${month}`);
  return { leaderboard: data.leaderboard, month: data.month };
}

export async function getUserStats() {
  const data = await api.get('/api/users/stats');
  return data.stats;
}

export async function getPublicUserProfile(userId) {
  const data = await api.get(`/api/users/${userId}`);
  return data.user;
}

export async function getPublicUserHistory(userId) {
  const data = await api.get(`/api/users/${userId}/history`);
  return data.history;
}

export async function getFollowing() {
  const data = await api.get('/api/users/following');
  return data.following;
}

export async function followUser(userId) {
  const data = await api.post(`/api/users/follow/${userId}`);
  return data;
}

export async function unfollowUser(userId) {
  const data = await api.delete(`/api/users/follow/${userId}`);
  return data;
}

export async function updateProfile(displayName) {
  const data = await api.put('/api/users/profile', { displayName });
  setStoredUser(data.user);
  return data;
}

export async function changePassword(currentPassword, newPassword) {
  return api.put('/api/users/password', { currentPassword, newPassword });
}
