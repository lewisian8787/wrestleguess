import { api } from './client.js';

export async function createLeague({ name }) {
  const data = await api.post('/api/leagues', { name });
  return data.league;
}

export async function joinLeague({ joinCode }) {
  const data = await api.post('/api/leagues/join', { joinCode });
  return data.league;
}

export async function getUserLeagues() {
  const data = await api.get('/api/leagues');
  return data.leagues;
}

export async function getLeagueStandings(leagueId) {
  const data = await api.get(`/api/leagues/${leagueId}/standings`);
  return data;
}
