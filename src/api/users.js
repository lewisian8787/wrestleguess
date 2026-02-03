import { api } from './client.js';

export async function getUserProfile() {
  const data = await api.get('/api/users/profile');
  return data.user;
}

export async function getGlobalLeaderboard() {
  const data = await api.get('/api/users/leaderboard');
  return data.leaderboard;
}
