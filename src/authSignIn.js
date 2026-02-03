// src/authSignIn.js - JWT-based authentication (migrated from Firebase)
import { getToken, clearAuth } from './api/client.js';
import { login, logout as apiLogout, getCurrentUser, getCachedUser } from './api/auth.js';

/** Returns the current user or null (no sign-in side effects). */
export async function getCurrentUserOrNull() {
  // First check cached user
  const cached = getCachedUser();
  if (cached) return cached;

  // Check if we have a token
  const token = getToken();
  if (!token) return null;

  // Try to fetch current user from API
  try {
    const user = await getCurrentUser();
    return user;
  } catch (err) {
    // Token invalid or expired
    clearAuth();
    return null;
  }
}

/**
 * For JWT auth, we don't do anonymous sign-in.
 * This returns the current user or null.
 * Callers should redirect to login if no user.
 */
export async function getOrInitUser() {
  return getCurrentUserOrNull();
}

/** Kept for callers that expect this name (LeagueGateway, etc.). */
export async function requireUserOrSignInAnonymouslyForDev() {
  return getOrInitUser();
}

/** Email/password sign-in for admin screens and regular login. */
export async function signInEmailPassword(email, password) {
  const data = await login({ email, password });
  return data.user;
}

/** Sign out - clears local auth state. */
export async function signOutUser() {
  apiLogout();
}

/** Default export for convenience (some files may default-import). */
export default getOrInitUser;
