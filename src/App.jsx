// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./LandingPage.jsx";
import UserLogin from "./UserLogin.jsx";
import GlobalLeaderboard from "./GlobalLeaderboard.jsx";
import HowToPlay from "./HowToPlay.jsx";
import LeagueGateway from "./LeagueGateway.jsx";
import EventsListPage from "./EventsListPage.jsx";
import PickEventPage from "./PickEventPage.jsx";
import StandingsPage from "./StandingsPage.jsx";
import AdminLogin from "./AdminLogin.jsx";
import AdminEventPanel from "./AdminEventPanel.jsx";
import NotFound from "./NotFound.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import colors from './theme'

export default function App() {
  return (
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
  );
}
