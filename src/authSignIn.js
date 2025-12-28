// src/authSignIn.js
import { auth } from "./firebase";
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

let cachedUser = null;

/** Returns the current user or null (no sign-in side effects). */
export async function getCurrentUserOrNull() {
  if (auth.currentUser) return auth.currentUser;
  if (cachedUser) return cachedUser;

  // Wait one tick for any pending auth state (SSR/Vite cold start)
  await new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) cachedUser = u;
      unsub();
      resolve();
    });
  });

  return auth.currentUser || cachedUser || null;
}

/** Ensures there is a user (anon if needed) and returns it. */
export async function getOrInitUser() {
  const existing = await getCurrentUserOrNull();
  if (existing) return (cachedUser = existing);
  const { user } = await signInAnonymously(auth);
  cachedUser = user;
  return user;
}

/** Kept for callers that expect this name (LeagueGateway, etc.). */
export async function requireUserOrSignInAnonymouslyForDev() {
  return getOrInitUser();
}

/** Email/password sign-in for admin screens. */
export async function signInEmailPassword(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  cachedUser = cred.user;
  return cred.user;
}

/** Optional helper some screens may import. */
export async function signOutUser() {
  await signOut(auth);
  cachedUser = null;
}

/** Default export for convenience (some files may default-import). */
export default getOrInitUser;
