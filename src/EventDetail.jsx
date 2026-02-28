import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "./auth";
import { getEvent, getEventScores } from "./api/events.js";
import NavBar from "./NavBar";
import PublicNav from "./PublicNav";
import colors from "./theme";

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  async function loadEvent() {
    setLoading(true);
    setNotFound(false);
    try {
      const eventData = await getEvent(eventId);
      if (!eventData) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setEvent(eventData);

      if (eventData.scored) {
        const scoresData = await getEventScores(eventId);
        setScores(scoresData || []);
      }
    } catch (err) {
      if (err.message === "Event not found") {
        setNotFound(true);
      } else {
        console.error("Error loading event:", err);
      }
    }
    setLoading(false);
  }

  function getStatusBadge(event) {
    if (event.scored) return { label: "Scored", bg: "#22c55e", color: "#fff" };
    if (event.locked) return { label: "Locked", bg: "#ef4444", color: "#fff" };
    return { label: "Open for Picks", bg: colors.primary, color: "#fff" };
  }

  return (
    <div style={pageStyle}>
      {user ? <NavBar /> : <PublicNav />}

      <main style={mainStyle}>
        {loading ? (
          <div style={loadingStyle}>Loading event...</div>
        ) : notFound ? (
          <div style={notFoundStyle}>
            <h2 style={notFoundTitleStyle}>Event Not Found</h2>
            <p style={{ opacity: 0.7 }}>This event doesn&apos;t exist or has been removed.</p>
            <button onClick={() => navigate(-1)} style={backButtonStyle}>
              ← Go Back
            </button>
          </div>
        ) : event ? (
          <>
            {/* Event Header */}
            <div style={eventHeaderStyle}>
              <div style={eventMetaStyle}>
                <span style={brandBadgeStyle}>{event.brand}</span>
                <span style={eventDateStyle}>
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long", month: "long", day: "numeric", year: "numeric"
                  })}
                </span>
                {(() => {
                  const badge = getStatusBadge(event);
                  return (
                    <span style={{ ...statusBadgeStyle, background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  );
                })()}
              </div>
              <h1 style={eventTitleStyle}>{event.name}</h1>
              <p style={matchCountStyle}>{event.matches?.length || 0} matches</p>

              {/* CTA for logged-in users if picks are open */}
              {user && !event.locked && !event.scored && (
                <button
                  onClick={() => navigate(`/event/${event.id}/pick`)}
                  style={ctaButtonStyle}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = colors.buttonGradientEnd;
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = colors.primary;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Make Your Picks →
                </button>
              )}
            </div>

            {/* Match Card */}
            <section style={sectionStyle}>
              <h2 style={sectionTitleStyle}>Match Card</h2>
              <div style={matchListStyle}>
                {(event.matches || []).map((match, idx) => (
                  <div key={match.matchId || idx} style={matchCardStyle}>
                    <div style={matchHeaderStyle}>
                      <span style={matchTypeStyle}>{match.type}</span>
                      <div style={matchBadgesStyle}>
                        {match.titleMatch && (
                          <span style={titleMatchBadgeStyle}>Title Match</span>
                        )}
                        {match.multiplier && match.multiplier > 1 && (
                          <span style={multiplierBadgeStyle}>{match.multiplier}×</span>
                        )}
                      </div>
                    </div>
                    <div style={competitorsStyle}>
                      {(match.competitors || []).map((competitor, cIdx) => (
                        <span
                          key={cIdx}
                          style={{
                            ...competitorStyle,
                            ...(event.scored && match.winner === competitor ? winnerStyle : {}),
                          }}
                        >
                          {competitor}
                          {event.scored && match.winner === competitor && (
                            <span style={winnerCheckStyle}> ✓</span>
                          )}
                        </span>
                      ))}
                    </div>
                    {event.scored && !match.winner && (
                      <p style={noContestStyle}>No Contest</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Top Scorers (scored events only) */}
            {event.scored && (
              <section style={sectionStyle}>
                <h2 style={sectionTitleStyle}>Top Scorers</h2>
                {scores.length === 0 ? (
                  <div style={emptyStateStyle}>No scored picks for this event.</div>
                ) : (
                  <div style={tableContainerStyle}>
                    <table style={tableStyle}>
                      <thead>
                        <tr style={tableHeaderRowStyle}>
                          <th style={{ ...tableHeaderCellStyle, width: "60px" }}>Rank</th>
                          <th style={tableHeaderCellStyle}>Player</th>
                          <th style={{ ...tableHeaderCellStyle, textAlign: "center" }}>Correct</th>
                          <th style={{ ...tableHeaderCellStyle, textAlign: "right" }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scores.map((row, idx) => (
                          <tr key={row.userId} style={tableRowStyle}>
                            <td style={rankCellStyle}>
                              {idx + 1 <= 3 ? (
                                <span style={{
                                  ...medalStyle,
                                  ...(idx === 0 ? goldMedalStyle : idx === 1 ? silverMedalStyle : bronzeMedalStyle)
                                }}>
                                  #{idx + 1}
                                </span>
                              ) : (
                                <span style={{ opacity: 0.6 }}>#{idx + 1}</span>
                              )}
                            </td>
                            <td style={{ ...tableCellStyle, fontWeight: 600 }}>
                              <Link
                                to={`/user/${row.userId}`}
                                style={playerLinkStyle}
                                onMouseEnter={e => e.target.style.color = colors.primary}
                                onMouseLeave={e => e.target.style.color = colors.textColor}
                              >
                                {row.displayName}
                              </Link>
                            </td>
                            <td style={{ ...tableCellStyle, textAlign: "center" }}>
                              {row.correctPicks}/{event.matches?.length || 0}
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
            )}
          </>
        ) : null}
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
  maxWidth: "1000px",
  margin: "0 auto",
  padding: "3rem 2rem 4rem",
};

const loadingStyle = {
  textAlign: "center",
  padding: "4rem 2rem",
  fontSize: "1.1rem",
  color: colors.textColor,
  opacity: 0.6,
};

const notFoundStyle = {
  textAlign: "center",
  padding: "4rem 2rem",
};

const notFoundTitleStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "2rem",
  color: colors.textColor,
  marginBottom: "0.5rem",
};

const backButtonStyle = {
  marginTop: "1.5rem",
  padding: "0.7rem 1.5rem",
  background: "transparent",
  border: `1px solid ${colors.borderColor}`,
  borderRadius: "8px",
  fontSize: "0.95rem",
  cursor: "pointer",
  color: colors.textColor,
};

const eventHeaderStyle = {
  marginBottom: "2.5rem",
};

const eventMetaStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  flexWrap: "wrap",
  marginBottom: "0.75rem",
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

const eventDateStyle = {
  fontSize: "0.9rem",
  color: colors.textColor,
  opacity: 0.6,
};

const statusBadgeStyle = {
  fontSize: "0.75rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  padding: "0.3rem 0.7rem",
  borderRadius: "4px",
};

const eventTitleStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "3rem",
  color: colors.highlight,
  margin: "0 0 0.25rem 0",
  letterSpacing: "0.03em",
  lineHeight: 1.1,
};

const matchCountStyle = {
  fontSize: "0.95rem",
  color: colors.textColor,
  opacity: 0.6,
  margin: "0 0 1.25rem 0",
};

const ctaButtonStyle = {
  padding: "0.85rem 2rem",
  background: colors.primary,
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "1rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
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

const matchListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const matchCardStyle = {
  background: colors.background,
  border: `1px solid ${colors.borderColor}`,
  borderRadius: "10px",
  padding: "1.25rem 1.5rem",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
};

const matchHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "0.6rem",
};

const matchTypeStyle = {
  fontSize: "0.78rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: colors.textColor,
  opacity: 0.5,
};

const matchBadgesStyle = {
  display: "flex",
  gap: "0.5rem",
};

const titleMatchBadgeStyle = {
  fontSize: "0.7rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  background: "#F6AE2D",
  color: "#000",
  padding: "0.2rem 0.5rem",
  borderRadius: "4px",
};

const multiplierBadgeStyle = {
  fontSize: "0.7rem",
  fontWeight: 700,
  background: colors.accent,
  color: "#fff",
  padding: "0.2rem 0.5rem",
  borderRadius: "4px",
};

const competitorsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
  alignItems: "center",
};

const competitorStyle = {
  fontSize: "1rem",
  fontWeight: 500,
  color: colors.textColor,
  padding: "0.3rem 0.8rem",
  borderRadius: "6px",
  background: "#F2F2F2",
};

const winnerStyle = {
  background: "#d1fae5",
  color: "#065f46",
  fontWeight: 700,
};

const winnerCheckStyle = {
  color: "#22c55e",
};

const noContestStyle = {
  fontSize: "0.85rem",
  color: colors.textColor,
  opacity: 0.5,
  marginTop: "0.5rem",
  marginBottom: 0,
  fontStyle: "italic",
};

const tableContainerStyle = {
  background: colors.background,
  borderRadius: "12px",
  border: `1px solid ${colors.borderColor}`,
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  overflowX: "auto",
};

const tableStyle = {
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
};

const tableCellStyle = {
  padding: "1rem 1.5rem",
  fontSize: "0.95rem",
  color: colors.textColor,
};

const rankCellStyle = {
  ...tableCellStyle,
  fontWeight: 700,
};

const medalStyle = {
  display: "inline-block",
  padding: "0.3rem 0.6rem",
  borderRadius: "6px",
  fontSize: "0.85rem",
  fontWeight: 700,
};

const goldMedalStyle = { background: "#FFD700", color: "#000" };
const silverMedalStyle = { background: "#C0C0C0", color: "#000" };
const bronzeMedalStyle = { background: "#CD7F32", color: "#fff" };

const playerLinkStyle = {
  color: colors.textColor,
  textDecoration: "none",
  transition: "color 0.15s ease",
};

const emptyStateStyle = {
  textAlign: "center",
  padding: "2.5rem",
  color: colors.textColor,
  opacity: 0.6,
  background: colors.background,
  borderRadius: "12px",
  border: `1px solid ${colors.borderColor}`,
};
