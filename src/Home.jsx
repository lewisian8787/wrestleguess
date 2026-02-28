import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./auth";
import { getUserStats, getPublicUserHistory, getFollowing } from "./api/users.js";
import { getEvents } from "./api/events.js";
import NavBar from "./NavBar";
import colors from "./theme";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [following, setFollowing] = useState([]);
  const [openEvents, setOpenEvents] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [statsData, eventsData, historyData, followingData] = await Promise.all([
        getUserStats(),
        getEvents(),
        user?.id ? getPublicUserHistory(user.id) : Promise.resolve([]),
        getFollowing(),
      ]);

      setStats(statsData);
      setFollowing(followingData || []);

      const open = (eventsData || []).filter(e => !e.locked && !e.scored);
      setOpenEvents(open.slice(0, 3));

      setRecentResults((historyData || []).slice(0, 3));
    } catch (err) {
      console.error("Error loading dashboard:", err);
    }
    setLoading(false);
  }

  const displayName = user?.displayName || "Wrestler";

  return (
    <div style={pageStyle}>
      <NavBar />

      <main style={mainStyle}>
        {/* Welcome header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>Welcome back, {displayName}</h1>
        </div>

        {loading ? (
          <div style={loadingStyle}>Loading your dashboard...</div>
        ) : (
          <>
            {/* Stats Bar */}
            {stats && (
              <section style={sectionStyle}>
                <h2 style={sectionTitleStyle}>Your Stats</h2>
                <div style={statsGridStyle}>
                  <div style={statCardStyle}>
                    <div style={statValueStyle}>#{stats.globalRank}</div>
                    <div style={statLabelStyle}>Global Rank</div>
                  </div>
                  <div style={statCardStyle}>
                    <div style={{ ...statValueStyle, color: colors.primary }}>
                      {Math.round(stats.totalScore)}
                    </div>
                    <div style={statLabelStyle}>Total Points</div>
                  </div>
                  <div style={statCardStyle}>
                    <div style={statValueStyle}>{stats.eventsPlayed}</div>
                    <div style={statLabelStyle}>Events Played</div>
                  </div>
                  <div style={statCardStyle}>
                    <div style={statValueStyle}>
                      {stats.eventsPlayed > 0
                        ? parseFloat(stats.avgPerEvent).toFixed(1)
                        : "—"}
                    </div>
                    <div style={statLabelStyle}>Avg / Event</div>
                  </div>
                </div>
              </section>
            )}

            {/* Following */}
            <section style={sectionStyle}>
              <h2 style={sectionTitleStyle}>Following</h2>
              {following.length === 0 ? (
                <div style={emptyStateStyle}>
                  Follow players from the <a href="/leaderboard" style={inlineLinkStyle}>leaderboard</a> to see their standings here.
                </div>
              ) : (
                <div style={resultsTableContainerStyle}>
                  <table style={resultsTableStyle}>
                    <thead>
                      <tr style={tableHeaderRowStyle}>
                        <th style={{ ...tableHeaderCellStyle, width: "60px" }}>Rank</th>
                        <th style={tableHeaderCellStyle}>Player</th>
                        <th style={{ ...tableHeaderCellStyle, textAlign: "center" }}>Global</th>
                        <th style={{ ...tableHeaderCellStyle, textAlign: "center" }}>Events</th>
                        <th style={{ ...tableHeaderCellStyle, textAlign: "right" }}>Avg / Event</th>
                        <th style={{ ...tableHeaderCellStyle, textAlign: "right" }}>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {following.map((player, idx) => (
                        <tr key={player.userId} style={tableRowStyle}>
                          <td style={{ ...tableCellStyle, fontWeight: 700 }}>
                            {idx + 1 <= 3 ? (
                              <span style={{
                                ...followMedalStyle,
                                ...(idx === 0 ? goldMedalStyle : idx === 1 ? silverMedalStyle : bronzeMedalStyle)
                              }}>
                                #{idx + 1}
                              </span>
                            ) : (
                              <span style={{ opacity: 0.6 }}>#{idx + 1}</span>
                            )}
                          </td>
                          <td style={{ ...tableCellStyle, fontWeight: 600 }}>
                            <Link to={`/user/${player.userId}`} style={playerLinkStyle}
                              onMouseEnter={e => e.target.style.color = colors.primary}
                              onMouseLeave={e => e.target.style.color = colors.textColor}
                            >
                              {player.displayName}
                            </Link>
                          </td>
                          <td style={{ ...tableCellStyle, textAlign: "center", opacity: 0.65 }}>
                            #{player.globalRank}
                          </td>
                          <td style={{ ...tableCellStyle, textAlign: "center" }}>
                            {player.eventsPlayed}
                          </td>
                          <td style={{ ...tableCellStyle, textAlign: "right", opacity: 0.75 }}>
                            {player.eventsPlayed > 0
                              ? parseFloat(player.avgPerEvent).toFixed(1)
                              : "—"}
                          </td>
                          <td style={{ ...tableCellStyle, textAlign: "right", fontWeight: 700, color: colors.primary }}>
                            {Math.round(player.totalScore)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Open for Picks */}
            <section style={sectionStyle}>
              <h2 style={sectionTitleStyle}>Open for Picks</h2>
              {openEvents.length === 0 ? (
                <div style={emptyStateStyle}>No upcoming events open for picks right now.</div>
              ) : (
                <div style={eventCardsGridStyle}>
                  {openEvents.map(event => (
                    <div key={event.id} style={eventCardStyle}>
                      <div style={eventCardHeaderStyle}>
                        <span style={brandBadgeStyle}>{event.brand}</span>
                        <span style={eventDateStyle}>
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric"
                          })}
                        </span>
                      </div>
                      <h3 style={eventCardTitleStyle}>{event.name}</h3>
                      <p style={eventMatchCountStyle}>
                        {event.matches?.length || 0} matches
                      </p>
                      <button
                        onClick={() => navigate(`/event/${event.id}/pick`)}
                        style={makePicksButtonStyle}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = colors.buttonGradientEnd;
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = colors.primary;
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        Make Picks
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Results */}
            <section style={sectionStyle}>
              <h2 style={sectionTitleStyle}>Your Recent Results</h2>
              {recentResults.length === 0 ? (
                <div style={emptyStateStyle}>
                  No results yet. Make some picks and come back after events are scored!
                </div>
              ) : (
                <div style={resultsTableContainerStyle}>
                  <table style={resultsTableStyle}>
                    <thead>
                      <tr style={tableHeaderRowStyle}>
                        <th style={tableHeaderCellStyle}>Event</th>
                        <th style={{ ...tableHeaderCellStyle, textAlign: "center" }}>Brand</th>
                        <th style={{ ...tableHeaderCellStyle, textAlign: "center" }}>Correct</th>
                        <th style={{ ...tableHeaderCellStyle, textAlign: "right" }}>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentResults.map(row => (
                        <tr
                          key={row.eventId}
                          style={tableRowStyle}
                          onClick={() => navigate(`/event/${row.eventId}`)}
                          onMouseEnter={e => e.currentTarget.style.background = "#F8F8F8"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ ...tableCellStyle, fontWeight: 600, cursor: "pointer" }}>
                            {row.eventName}
                          </td>
                          <td style={{ ...tableCellStyle, textAlign: "center" }}>
                            <span style={brandBadgeSmallStyle}>{row.brand}</span>
                          </td>
                          <td style={{ ...tableCellStyle, textAlign: "center" }}>
                            {row.correctPicks}/{row.totalMatches}
                          </td>
                          <td style={{ ...tableCellStyle, textAlign: "right", fontWeight: 700, color: colors.primary }}>
                            {Math.round(row.pointsEarned)} pts
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
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
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "2.5rem 2rem 4rem",
};

const headerStyle = {
  marginBottom: "2rem",
};

const titleStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "2.2rem",
  color: colors.highlight,
  margin: 0,
  letterSpacing: "0.03em",
};

const loadingStyle = {
  textAlign: "center",
  padding: "4rem 2rem",
  fontSize: "1.1rem",
  color: colors.textColor,
  opacity: 0.6,
};

const sectionStyle = {
  marginBottom: "3rem",
};

const sectionTitleStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "1.5rem",
  color: colors.textColor,
  margin: "0 0 1.2rem 0",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "1rem",
};

const statCardStyle = {
  background: colors.background,
  border: `1px solid ${colors.borderColor}`,
  borderRadius: "12px",
  padding: "1.5rem",
  textAlign: "center",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
};

const statValueStyle = {
  fontSize: "2rem",
  fontWeight: 700,
  color: colors.highlight,
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  letterSpacing: "0.02em",
};

const statLabelStyle = {
  fontSize: "0.8rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: colors.textColor,
  opacity: 0.55,
  marginTop: "0.4rem",
};

const eventCardsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: "1.25rem",
};

const eventCardStyle = {
  background: colors.background,
  border: `1px solid ${colors.borderColor}`,
  borderRadius: "12px",
  padding: "1.5rem",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const eventCardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const brandBadgeStyle = {
  fontSize: "0.75rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  background: colors.highlight,
  color: "#fff",
  padding: "0.3rem 0.7rem",
  borderRadius: "4px",
};

const brandBadgeSmallStyle = {
  fontSize: "0.7rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  background: colors.highlight,
  color: "#fff",
  padding: "0.2rem 0.5rem",
  borderRadius: "4px",
};

const eventDateStyle = {
  fontSize: "0.8rem",
  color: colors.textColor,
  opacity: 0.55,
};

const eventCardTitleStyle = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: colors.textColor,
  margin: "0.2rem 0 0",
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  letterSpacing: "0.03em",
  fontSize: "1.25rem",
};

const eventMatchCountStyle = {
  fontSize: "0.85rem",
  color: colors.textColor,
  opacity: 0.6,
  margin: 0,
};

const makePicksButtonStyle = {
  marginTop: "0.75rem",
  padding: "0.7rem 1.2rem",
  background: colors.primary,
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "0.95rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
  alignSelf: "flex-start",
};

const resultsTableContainerStyle = {
  background: colors.background,
  borderRadius: "12px",
  border: `1px solid ${colors.borderColor}`,
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  overflowX: "auto",
};

const resultsTableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "400px",
};

const tableHeaderRowStyle = {
  borderBottom: `2px solid ${colors.borderColor}`,
};

const tableHeaderCellStyle = {
  padding: "1rem 1.5rem",
  textAlign: "left",
  fontSize: "0.8rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: colors.textColor,
  opacity: 0.6,
};

const tableRowStyle = {
  borderBottom: `1px solid ${colors.borderColor}`,
  transition: "background 0.15s ease",
};

const tableCellStyle = {
  padding: "1rem 1.5rem",
  fontSize: "0.95rem",
  color: colors.textColor,
};

const emptyStateStyle = {
  textAlign: "center",
  padding: "2rem",
  fontSize: "0.95rem",
  color: colors.textColor,
  opacity: 0.6,
  background: colors.background,
  borderRadius: "10px",
  border: `1px solid ${colors.borderColor}`,
};

const followMedalStyle = {
  display: "inline-block",
  padding: "0.2rem 0.5rem",
  borderRadius: "4px",
  fontSize: "0.82rem",
  fontWeight: 700,
};

const goldMedalStyle = {
  background: "#FFD700",
  color: "#7A5900",
};

const silverMedalStyle = {
  background: "#C0C0C0",
  color: "#4A4A4A",
};

const bronzeMedalStyle = {
  background: "#CD7F32",
  color: "#fff",
};

const playerLinkStyle = {
  color: colors.textColor,
  textDecoration: "none",
};

const inlineLinkStyle = {
  color: colors.primary,
  textDecoration: "none",
  fontWeight: 600,
};
