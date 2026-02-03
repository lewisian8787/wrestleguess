import { api } from './client.js';

export async function getEvents() {
  const data = await api.get('/api/events');
  return data.events;
}

export async function getEvent(eventId) {
  const data = await api.get(`/api/events/${eventId}`);
  return data.event;
}

export async function createEvent({ name, date, matches, brand }) {
  const data = await api.post('/api/events', { name, date, matches, brand });
  return data.event;
}

export async function updateEvent(eventId, updates) {
  const data = await api.put(`/api/events/${eventId}`, updates);
  return data.event;
}

export async function deleteEvent(eventId) {
  const data = await api.delete(`/api/events/${eventId}`);
  return data;
}

export async function scoreEvent(eventId) {
  const data = await api.post(`/api/events/${eventId}/score`);
  return data;
}
