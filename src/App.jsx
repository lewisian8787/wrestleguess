// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./LandingPage.jsx";
import LeagueGateway from "./LeagueGateway.jsx";
import PickEventPage from "./PickEventPage.jsx";
import StandingsPage from "./StandingsPage.jsx";
import AdminLogin from "./AdminLogin.jsx";
import AdminEventPanel from "./AdminEventPanel.jsx";
import NotFound from "./NotFound.jsx";
import colors from './theme'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<LeagueGateway />} />
      <Route path="/event/:eventId/pick" element={<PickEventPage />} />
      <Route path="/league/:leagueId/standings" element={<StandingsPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/event" element={<AdminEventPanel />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
