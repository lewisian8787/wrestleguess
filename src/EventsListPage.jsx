import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUserOrNull } from "./authSignIn";
import { getEvents } from "./api/events.js";
import { getUserPicks } from "./api/picks.js";
import NavBar from "./NavBar";
import colors from "./theme";

export default function EventsListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPicks, setUserPicks] = useState({}); // { eventId: true/false }
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const user = await getCurrentUserOrNull();

        // Fetch all events
        const eventsList = await getEvents();

        // Sort by date (most recent first)
        eventsList.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA;
        });

        setEvents(eventsList);

        // Check which events the user has already picked
        if (user) {
          try {
            const picks = await getUserPicks();
            const picksStatus = {};
            (picks || []).forEach(pick => {
              picksStatus[pick.eventId] = true;
            });
            setUserPicks(picksStatus);
          } catch {
            // User has no picks yet
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading events:", err);
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <>
        <NavBar />
        <div style={pageStyle}>
          <div style={containerStyle}>
            <div style={loadingStyle}>Loading events...</div>
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
          <h1 style={titleStyle}>Available Events</h1>
          <p style={subtitleStyle}>Make your predictions for upcoming wrestling events</p>

          {events.length === 0 ? (
            <div style={emptyStateStyle}>
              <p style={emptyTextStyle}>No events available yet.</p>
              <p style={emptySubTextStyle}>Check back soon for upcoming wrestling events!</p>
            </div>
          ) : (
            <div style={eventsGridStyle}>
              {events.map(event => {
                const eventDate = event.date?.toDate
                  ? event.date.toDate()
                  : new Date(event.date || Date.now());

                const hasPicked = userPicks[event.id];
                const isLocked = event.locked;
                const isScored = event.scored;

                return (
                  <div key={event.id} style={eventCardStyle}>
                    <div style={eventHeaderStyle}>
                      <div style={eventBrandStyle}>{event.brand || "Wrestling"}</div>
                      <div style={eventDateStyle}>
                        {isNaN(eventDate) ? "Date TBD" : eventDate.toLocaleDateString()}
                      </div>
                    </div>

                    <h3 style={eventNameStyle}>{event.name || "Unnamed Event"}</h3>

                    {event.matches && (
                      <div style={eventMetaStyle}>
                        {event.matches.length} {event.matches.length === 1 ? "match" : "matches"}
                      </div>
                    )}

                    <div style={eventStatusStyle}>
                      {isScored && <span style={scoredBadgeStyle}>✓ Scored</span>}
                      {isLocked && !isScored && <span style={lockedBadgeStyle}>🔒 Locked</span>}
                      {hasPicked && !isScored && <span style={pickedBadgeStyle}>✓ Picks Submitted</span>}
                    </div>

                    <button
                      onClick={() => navigate(`/event/${event.id}/pick`)}
                      style={{
                        ...makePicksButtonStyle,
                        ...(isLocked && !hasPicked ? disabledButtonStyle : {}),
                      }}
                      onMouseEnter={(e) => {
                        if (!(isLocked && !hasPicked)) {
                          e.target.style.transform = "translateY(-1px)";
                          e.target.style.boxShadow = `0 6px 16px ${colors.primary}50`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = `0 4px 12px ${colors.primary}40`;
                      }}
                      disabled={isLocked && !hasPicked}
                    >
                      {hasPicked ? "View/Edit Picks" : "Make Picks"}
                    </button>
                  </div>
                );
              })}
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
  maxWidth: "1200px",
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
  background: colors.background,
  borderRadius: "12px",
  border: `1px solid ${colors.borderColor}`,
  padding: "4rem 2rem",
  textAlign: "center",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
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
};

const eventsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "1.5rem",
  marginBottom: "2rem",
};

const eventCardStyle = {
  background: colors.background,
  border: `1px solid ${colors.borderColor}`,
  borderRadius: "12px",
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  transition: "all 0.2s ease",
};

const eventHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "0.8rem",
  paddingBottom: "0.75rem",
  borderBottom: `1px solid ${colors.borderColor}`,
};

const eventBrandStyle = {
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: colors.primary,
};

const eventDateStyle = {
  color: colors.textColor,
  opacity: 0.6,
  fontWeight: 500,
};

const eventNameStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "1.5rem",
  fontWeight: 600,
  margin: 0,
  lineHeight: 1.2,
  color: colors.textColor,
  letterSpacing: "0.02em",
};

const eventMetaStyle = {
  fontSize: "0.9rem",
  color: colors.textColor,
  opacity: 0.7,
  fontWeight: 500,
};

const eventStatusStyle = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
  minHeight: "1.75rem",
  alignItems: "center",
};

const scoredBadgeStyle = {
  fontSize: "0.75rem",
  padding: "0.35rem 0.7rem",
  background: "#22c55e",
  color: "#fff",
  borderRadius: "4px",
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
};

const lockedBadgeStyle = {
  fontSize: "0.75rem",
  padding: "0.35rem 0.7rem",
  background: "#ef4444",
  color: "#fff",
  borderRadius: "4px",
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
};

const pickedBadgeStyle = {
  fontSize: "0.75rem",
  padding: "0.35rem 0.7rem",
  background: colors.primary,
  color: "#fff",
  borderRadius: "4px",
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
};

const makePicksButtonStyle = {
  appearance: "none",
  border: "none",
  borderRadius: "8px",
  padding: "1rem",
  background: `linear-gradient(135deg, ${colors.buttonGradientStart}, ${colors.buttonGradientEnd})`,
  fontWeight: 600,
  fontSize: "1rem",
  color: colors.buttonText,
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: `0 4px 12px ${colors.primary}40`,
  fontFamily: '"Roboto", sans-serif',
};

const disabledButtonStyle = {
  opacity: 0.4,
  cursor: "not-allowed",
  background: `${colors.borderColor}`,
  boxShadow: "none",
};
