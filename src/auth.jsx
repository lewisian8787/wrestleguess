import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser, logout as apiLogout, isAuthenticated, getCachedUser } from "./api/auth.js";

const AuthCtx = createContext({ user: null, claims: {}, loading: true, logout: () => {} });

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, claims: {}, loading: true });

  const logout = useCallback(() => {
    apiLogout();
    setState({ user: null, claims: {}, loading: false });
  }, []);

  useEffect(() => {
    async function validateToken() {
      if (!isAuthenticated()) {
        setState({ user: null, claims: {}, loading: false });
        return;
      }

      try {
        const user = await getCurrentUser();
        setState({
          user,
          claims: { admin: user.isAdmin },
          loading: false,
        });
      } catch (error) {
        console.error("Token validation failed:", error);
        apiLogout();
        setState({ user: null, claims: {}, loading: false });
      }
    }

    validateToken();
  }, []);

  return (
    <AuthCtx.Provider value={{ ...state, logout }}>
      {children}
    </AuthCtx.Provider>
  );
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
