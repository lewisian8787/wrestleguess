// src/App.jsx
import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import colors from './theme'

// Eager load critical pages
import LandingPage from "./LandingPage.jsx";
import UserLogin from "./UserLogin.jsx";

// Lazy load heavy components
const GlobalLeaderboard = lazy(() => import("./GlobalLeaderboard.jsx"));
const HowToPlay = lazy(() => import("./HowToPlay.jsx"));
const LeagueGateway = lazy(() => import("./LeagueGateway.jsx"));
const EventsListPage = lazy(() => import("./EventsListPage.jsx"));
const PickEventPage = lazy(() => import("./PickEventPage.jsx"));
const StandingsPage = lazy(() => import("./StandingsPage.jsx"));
const AdminLogin = lazy(() => import("./AdminLogin.jsx"));
const AdminEventPanel = lazy(() => import("./AdminEventPanel.jsx"));
const NotFound = lazy(() => import("./NotFound.jsx"));

// Loading component
const PageLoader = () => (
  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: colors.background,
    color: colors.textColor,
    fontFamily: '"Bebas Neue", "Impact", sans-serif',
    fontSize: "2rem"
  }}>
    Loading...
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/leaderboard" element={<GlobalLeaderboard />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/home" element={<ProtectedRoute><LeagueGateway /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><EventsListPage /></ProtectedRoute>} />
        <Route path="/event/:eventId/pick" element={<ProtectedRoute><PickEventPage /></ProtectedRoute>} />
        <Route path="/league/:leagueId/standings" element={<ProtectedRoute><StandingsPage /></ProtectedRoute>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/event" element={<AdminEventPanel />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
