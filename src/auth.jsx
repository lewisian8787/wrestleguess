// src/auth.js
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { auth } from "./firebase";
import { Navigate, useLocation } from "react-router-dom";

const AuthCtx = createContext({ user: null, claims: {}, loading: true });

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, claims: {}, loading: true });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return setState({ user: null, claims: {}, loading: false });

      const token = await getIdTokenResult(user).catch(() => null);
      setState({ user, claims: token?.claims ?? {}, loading: false });
    });

    return unsub;
  }, []);

  return <AuthCtx.Provider value={state}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}

export function RequireAuth({ children, allowGuests = false, redirectIfAuthed }) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return <div>Checking sign-in…</div>;

  if (redirectIfAuthed && user) return <Navigate to={redirectIfAuthed} replace />;

  if (allowGuests) return children;

  if (!user) return <Navigate to="/" replace state={{ from: loc }} />;

  return children;
}

export function RequireAdmin({ children }) {
  const { user, loading, claims } = useAuth();
  const loc = useLocation();

  if (loading) return <div>Checking admin…</div>;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: loc }} />;
  if (!claims.admin) return <Navigate to="/home" replace />;

  return children;
}
