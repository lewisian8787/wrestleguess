import { api } from './client.js';

export async function submitPicks({ eventId, choices, totalConfidence }) {
  const data = await api.post('/api/picks', { eventId, choices, totalConfidence });
  return data.pick;
}

export async function getPicksForEvent(eventId) {
  const data = await api.get(`/api/picks/event/${eventId}`);
  return data.pick;
}

export async function getUserPicks() {
  const data = await api.get('/api/picks/user');
  return data.picks;
}

export async function deletePicks(eventId) {
  const data = await api.delete(`/api/picks/event/${eventId}`);
  return data;
}
