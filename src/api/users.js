import { api } from './client.js';

export async function getUserProfile() {
  const data = await api.get('/api/users/profile');
  return data.user;
}

export async function getGlobalLeaderboard() {
  const data = await api.get('/api/users/leaderboard');
  return data.leaderboard;
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
