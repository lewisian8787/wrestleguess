import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getGlobalLeaderboard } from "./api/users.js";
import { useAuth } from "./auth.jsx";
import NavBar from "./NavBar";
import PublicNav from "./PublicNav";
import colors from "./theme";

export default function GlobalLeaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    setLoading(true);
    try {
      const leaderboardData = await getGlobalLeaderboard();
      setLeaderboard(leaderboardData || []);
    } catch (err) {
      console.error("Error loading leaderboard:", err);
    }
    setLoading(false);
  }

  return (
    <div style={pageStyle}>
      {user ? <NavBar /> : <PublicNav />}

      {/* Main Content */}
      <main style={mainStyle}>
        <div style={containerStyle}>
          <h1 style={titleStyle}>Global Leaderboard</h1>
          <p style={subtitleStyle}>Top players worldwide — all-time standings</p>

          {loading ? (
            <div style={loadingStyle}>Loading leaderboard...</div>
          ) : leaderboard.length === 0 ? (
            <div style={emptyStateStyle}>
              <p>No players on the leaderboard yet.</p>
              <p style={{ marginTop: "1rem", opacity: 0.7 }}>Be the first to join and make predictions!</p>
            </div>
          ) : (
            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeaderRowStyle}>
                    <th style={{ ...tableHeaderCellStyle, width: "80px" }}>Rank</th>
                    <th style={tableHeaderCellStyle}>Player</th>
                    <th style={{ ...tableHeaderCellStyle, textAlign: "center" }}>Events</th>
                    <th style={{ ...tableHeaderCellStyle, textAlign: "right" }}>Avg / Event</th>
                    <th style={{ ...tableHeaderCellStyle, textAlign: "right" }}>Total Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((player, index) => (
                    <tr key={index} style={tableRowStyle}>
                      <td style={rankCellStyle}>
                        {index + 1 <= 3 ? (
                          <span style={{ ...medalStyle, ...(index === 0 ? goldMedalStyle : index === 1 ? silverMedalStyle : bronzeMedalStyle) }}>
                            #{index + 1}
                          </span>
                        ) : (
                          <span style={regularRankStyle}>#{index + 1}</span>
                        )}
                      </td>
                      <td style={nameCellStyle}>
                        <Link
                          to={`/user/${player.userId}`}
                          style={playerLinkStyle}
                          onMouseEnter={e => e.target.style.color = colors.primary}
                          onMouseLeave={e => e.target.style.color = colors.textColor}
                        >
                          {player.displayName}
                        </Link>
                      </td>
                      <td style={{ ...tableCellStyle, textAlign: "center" }}>{player.eventsPlayed}</td>
                      <td style={{ ...tableCellStyle, textAlign: "right", opacity: 0.75 }}>
                        {player.eventsPlayed > 0
                          ? (player.totalScore / player.eventsPlayed).toFixed(1)
                          : "—"}
                      </td>
                      <td style={{ ...pointsCellStyle, textAlign: "right" }}>
                        {Math.round(player.totalScore)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}

/* ---------- STYLES ---------- */

const pageStyle = {
  minHeight: "100vh",
  background: "#F8F8F8",
  fontFamily: '"Roboto", sans-serif',
};


const mainStyle = {
  padding: "3rem 2rem",
  maxWidth: "1200px",
  margin: "0 auto",
};

const containerStyle = {
  width: "100%",
};

const titleStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "2.5rem",
  color: colors.primary,
  textAlign: "center",
  margin: "0 0 0.5rem 0",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const subtitleStyle = {
  fontSize: "1.1rem",
  color: colors.textColor,
  textAlign: "center",
  opacity: 0.7,
  marginBottom: "3rem",
};

const loadingStyle = {
  textAlign: "center",
  padding: "4rem 2rem",
  fontSize: "1.1rem",
  color: colors.textColor,
  opacity: 0.6,
};

const emptyStateStyle = {
  textAlign: "center",
  padding: "4rem 2rem",
  fontSize: "1.1rem",
  color: colors.textColor,
  background: colors.background,
  borderRadius: "12px",
  border: `1px solid ${colors.borderColor}`,
};

const tableContainerStyle = {
  background: colors.background,
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  border: `1px solid ${colors.borderColor}`,
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "600px",
};

const tableHeaderRowStyle = {
  borderBottom: `2px solid ${colors.borderColor}`,
};

const tableHeaderCellStyle = {
  padding: "1.2rem 1.5rem",
  textAlign: "left",
  fontSize: "0.85rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: colors.textColor,
  opacity: 0.7,
};

const tableRowStyle = {
  borderBottom: `1px solid ${colors.borderColor}`,
  transition: "background 0.2s ease",
};

const tableCellStyle = {
  padding: "1.2rem 1.5rem",
  fontSize: "1rem",
  color: colors.textColor,
};

const rankCellStyle = {
  ...tableCellStyle,
  fontWeight: 700,
};

const medalStyle = {
  display: "inline-block",
  padding: "0.4rem 0.8rem",
  borderRadius: "6px",
  fontSize: "0.9rem",
  fontWeight: 700,
};

const goldMedalStyle = {
  background: "#FFD700",
  color: "#000",
};

const silverMedalStyle = {
  background: "#C0C0C0",
  color: "#000",
};

const bronzeMedalStyle = {
  background: "#CD7F32",
  color: "#fff",
};

const regularRankStyle = {
  opacity: 0.6,
};

const nameCellStyle = {
  ...tableCellStyle,
  fontWeight: 600,
};

const pointsCellStyle = {
  ...tableCellStyle,
  fontWeight: 700,
  color: colors.primary,
};

const playerLinkStyle = {
  color: colors.textColor,
  textDecoration: "none",
  transition: "color 0.15s ease",
};
