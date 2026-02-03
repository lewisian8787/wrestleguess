import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getLeagueStandings } from "./api/leagues.js";
import NavBar from "./NavBar";
import colors from "./theme";

export default function StandingsPage() {
  const { leagueId } = useParams();

  const [loading, setLoading] = useState(true);
  const [leagueData, setLeagueData] = useState(null);
  const [standings, setStandings] = useState([]);
  const [error, setError] = useState("");
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    async function loadStandings() {
      try {
        setLoading(true);
        setError("");

        const data = await getLeagueStandings(leagueId);
        setLeagueData(data.league);
        setStandings(data.standings);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadStandings();
  }, [leagueId]);

  if (loading) {
    return (
      <>
        <NavBar />
        <div style={pageStyle}>
          <div style={containerStyle}>
            <div style={loadingStyle}>Loading standings...</div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <div style={pageStyle}>
          <div style={containerStyle}>
            <h1 style={titleStyle}>Error</h1>
            <div style={errorStyle}>{error}</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div style={pageStyle}>
        <div style={containerStyle}>
          <h1 style={titleStyle}>{leagueData?.name || "League"} Standings</h1>
          <p style={subtitleStyle}>
            {leagueData?.joinCode && `Join Code: ${leagueData.joinCode}`}
          </p>

          {/* Standings Table */}
          <div style={standingsContainerStyle}>
            <div style={standingsHeaderStyle}>
              <span style={rankColumnHeaderStyle}>Rank</span>
              <span style={nameColumnHeaderStyle}>Player</span>
              <span style={pointsColumnHeaderStyle}>Points</span>
            </div>

            {standings.length === 0 ? (
              <div style={emptyStateStyle}>
                <p style={emptyTextStyle}>No scores yet.</p>
                <p style={emptySubTextStyle}>
                  Make picks and have an admin score an event to see standings!
                </p>
              </div>
            ) : (
              standings.map((member, index) => (
                <div
                  key={member.userId}
                  style={{
                    ...standingsRowStyle,
                    background: index === 0 ? `${colors.primary}10` : (index % 2 === 0 ? "#F8F8F8" : colors.background)
                  }}
                >
                  <span style={rankColumnStyle}>
                    {index === 0 && <span style={medalStyle}>🏆</span>}
                    {index === 1 && <span style={medalStyle}>🥈</span>}
                    {index === 2 && <span style={medalStyle}>🥉</span>}
                    <span style={rankNumberStyle}>#{index + 1}</span>
                  </span>
                  <span style={nameColumnStyle}>{member.displayName || "Guest"}</span>
                  <span style={pointsColumnStyle}>
                    {(member.totalPoints || 0).toFixed(1)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Event Breakdown Section */}
          {standings.length > 0 && standings.some(m => m.eventScores && Object.keys(m.eventScores).length > 0) && (
            <div style={breakdownSectionStyle}>
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                style={breakdownToggleButtonStyle}
                onMouseEnter={(e) => {
                  e.target.style.background = colors.primary;
                  e.target.style.color = colors.buttonText;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.color = colors.primary;
                }}
              >
                {showBreakdown ? "Hide" : "Show"} Event Breakdown
              </button>

              {showBreakdown && (
                <div style={breakdownContentStyle}>
                  {standings.map(member => {
                    const eventScores = member.eventScores || {};
                    const eventIds = Object.keys(eventScores);

                    if (eventIds.length === 0) return null;

                    return (
                      <div key={member.userId} style={breakdownCardStyle}>
                        <div style={breakdownHeaderStyle}>
                          {member.displayName || "Guest"} - Event History
                        </div>
                        <div style={breakdownListStyle}>
                          {eventIds.map(eventId => {
                            const score = eventScores[eventId];
                            return (
                              <div key={eventId} style={breakdownRowStyle}>
                                <span style={breakdownEventIdStyle}>{eventId}</span>
                                <span style={breakdownScoreStyle}>
                                  {score.points?.toFixed(1)} pts
                                </span>
                                <span style={breakdownPicksStyle}>
                                  ({score.correctPicks}/{score.totalPicks})
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ---------- STYLES ---------- */

const pageStyle = {
  minHeight: "calc(100vh - 60px)",
  background: "#F8F8F8",
  fontFamily: '"Roboto", sans-serif',
  padding: "3rem 2rem",
};

const containerStyle = {
  maxWidth: "900px",
  margin: "0 auto",
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
  fontSize: "1rem",
  color: colors.textColor,
  textAlign: "center",
  opacity: 0.7,
  marginBottom: "2.5rem",
  fontWeight: 500,
};

const loadingStyle = {
  textAlign: "center",
  padding: "4rem 2rem",
  fontSize: "1.1rem",
  color: colors.textColor,
  opacity: 0.6,
};

const errorStyle = {
  background: "#fee2e2",
  border: "1px solid #ef4444",
  borderRadius: "8px",
  padding: "1.5rem",
  fontSize: "1rem",
  color: "#dc2626",
  textAlign: "center",
};

const standingsContainerStyle = {
  background: colors.background,
  borderRadius: "12px",
  border: `1px solid ${colors.borderColor}`,
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  overflow: "hidden",
  marginBottom: "2rem",
};

const standingsHeaderStyle = {
  display: "flex",
  padding: "1rem 1.5rem",
  background: "#F8F8F8",
  fontWeight: 700,
  fontSize: "0.85rem",
  borderBottom: `2px solid ${colors.borderColor}`,
  textTransform: "uppercase",
  color: colors.textColor,
  opacity: 0.8,
  letterSpacing: "0.05em",
};

const standingsRowStyle = {
  display: "flex",
  padding: "1rem 1.5rem",
  borderBottom: `1px solid ${colors.borderColor}`,
  fontSize: "1rem",
  alignItems: "center",
  transition: "all 0.2s ease",
};

const rankColumnHeaderStyle = {
  width: "5rem",
  flexShrink: 0,
};

const rankColumnStyle = {
  width: "5rem",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const medalStyle = {
  fontSize: "1.2rem",
};

const rankNumberStyle = {
  fontWeight: 600,
  color: colors.textColor,
};

const nameColumnHeaderStyle = {
  flex: 1,
};

const nameColumnStyle = {
  flex: 1,
  fontWeight: 600,
  color: colors.textColor,
};

const pointsColumnHeaderStyle = {
  width: "6rem",
  textAlign: "right",
};

const pointsColumnStyle = {
  width: "6rem",
  textAlign: "right",
  fontWeight: 700,
  color: colors.primary,
  fontSize: "1.05rem",
};

const emptyStateStyle = {
  padding: "4rem 2rem",
  textAlign: "center",
};

const emptyTextStyle = {
  fontSize: "1.2rem",
  color: colors.textColor,
  margin: "0 0 0.5rem 0",
  fontWeight: 500,
};

const emptySubTextStyle = {
  fontSize: "1rem",
  color: colors.textColor,
  opacity: 0.6,
  margin: 0,
  lineHeight: 1.6,
};

const breakdownSectionStyle = {
  marginTop: "2rem",
};

const breakdownToggleButtonStyle = {
  appearance: "none",
  border: `2px solid ${colors.primary}`,
  borderRadius: "8px",
  background: "transparent",
  color: colors.primary,
  padding: "0.9rem 1.5rem",
  fontSize: "1rem",
  fontWeight: 600,
  width: "100%",
  cursor: "pointer",
  textAlign: "center",
  transition: "all 0.2s ease",
  fontFamily: '"Roboto", sans-serif',
};

const breakdownContentStyle = {
  marginTop: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const breakdownCardStyle = {
  background: colors.background,
  border: `1px solid ${colors.borderColor}`,
  borderRadius: "12px",
  padding: "1.5rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const breakdownHeaderStyle = {
  fontSize: "1rem",
  fontWeight: 700,
  marginBottom: "1rem",
  paddingBottom: "0.75rem",
  borderBottom: `1px solid ${colors.borderColor}`,
  color: colors.textColor,
};

const breakdownListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const breakdownRowStyle = {
  display: "flex",
  alignItems: "center",
  padding: "0.75rem",
  background: "#F8F8F8",
  borderRadius: "6px",
  fontSize: "0.9rem",
};

const breakdownEventIdStyle = {
  flex: 1,
  fontSize: "0.85rem",
  color: colors.textColor,
  opacity: 0.8,
};

const breakdownScoreStyle = {
  fontSize: "0.95rem",
  fontWeight: 700,
  color: colors.primary,
  marginRight: "0.75rem",
};

const breakdownPicksStyle = {
  fontSize: "0.8rem",
  color: colors.textColor,
  opacity: 0.6,
  fontWeight: 500,
};
