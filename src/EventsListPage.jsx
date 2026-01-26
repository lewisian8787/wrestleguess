import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

export default function EventsListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPicks, setUserPicks] = useState({}); // { eventId: true/false }
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;

        // Fetch all events
        const eventsRef = collection(db, "events");
        const eventsSnap = await getDocs(eventsRef);

        const eventsList = eventsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort by date (most recent first)
        eventsList.sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
          const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
          return dateB - dateA;
        });

        setEvents(eventsList);

        // Check which events the user has already picked
        if (user) {
          const picksStatus = {};
          for (const event of eventsList) {
            const pickRef = doc(db, "events", event.id, "picks", user.uid);
            const pickSnap = await getDoc(pickRef);
            picksStatus[event.id] = pickSnap.exists();
          }
          setUserPicks(picksStatus);
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
        <ScreenWrapper>
          <Header title="Loading events..." />
        </ScreenWrapper>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <ScreenWrapper>
        <Header title="Available Events" />

      {events.length === 0 ? (
        <div style={emptyStateStyle}>
          No events available yet. Check back soon!
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
                    {event.matches.length} matches
                  </div>
                )}

                <div style={eventStatusStyle}>
                  {isScored && <span style={scoredBadgeStyle}>Scored</span>}
                  {isLocked && !isScored && <span style={lockedBadgeStyle}>Locked</span>}
                  {hasPicked && !isScored && <span style={pickedBadgeStyle}>Picks Submitted</span>}
                </div>

                <button
                  onClick={() => navigate(`/event/${event.id}/pick`)}
                  style={{
                    ...makePicksButtonStyle,
                    ...(isLocked && !hasPicked ? disabledButtonStyle : {}),
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

      <Footer />
    </ScreenWrapper>
    </>
  );
}

/* ----- Helper Components ----- */
function ScreenWrapper({ children }) {
  return <div style={screenWrapperStyle}>{children}</div>;
}

function Header({ title }) {
  return <h1 style={headerStyle}>{title}</h1>;
}

function Footer() {
  return (
    <p style={footerStyle}>
      prototype build • not for gambling • bragging rights only
    </p>
  );
}

/* ----- Styles ----- */
const screenWrapperStyle = {
  minHeight: "100vh",
  backgroundColor: "#0b0b10",
  color: "white",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  padding: "1.5rem",
  maxWidth: "1000px",
  margin: "0 auto",
};

const headerStyle = {
  fontSize: "1.25rem",
  fontWeight: 600,
  marginBottom: "1.5rem",
  textAlign: "center",
};

const emptyStateStyle = {
  background: "#1a1a22",
  border: "1px solid #2f2f44",
  borderRadius: "0.75rem",
  padding: "3rem 1rem",
  textAlign: "center",
  fontSize: "0.9rem",
  opacity: 0.7,
};

const eventsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "1rem",
  marginBottom: "2rem",
};

const eventCardStyle = {
  background: "#1a1a22",
  border: "1px solid #2f2f44",
  borderRadius: "0.75rem",
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const eventHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "0.75rem",
  opacity: 0.7,
};

const eventBrandStyle = {
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const eventDateStyle = {
  opacity: 0.8,
};

const eventNameStyle = {
  fontSize: "1.1rem",
  fontWeight: 600,
  margin: 0,
  lineHeight: 1.3,
};

const eventMetaStyle = {
  fontSize: "0.8rem",
  opacity: 0.6,
};

const eventStatusStyle = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
  minHeight: "1.5rem",
};

const scoredBadgeStyle = {
  fontSize: "0.7rem",
  padding: "0.25rem 0.5rem",
  background: "#4ade80",
  color: "#000",
  borderRadius: "0.3rem",
  fontWeight: 600,
};

const lockedBadgeStyle = {
  fontSize: "0.7rem",
  padding: "0.25rem 0.5rem",
  background: "#f87171",
  color: "#000",
  borderRadius: "0.3rem",
  fontWeight: 600,
};

const pickedBadgeStyle = {
  fontSize: "0.7rem",
  padding: "0.25rem 0.5rem",
  background: "#ffd600",
  color: "#000",
  borderRadius: "0.3rem",
  fontWeight: 600,
};

const makePicksButtonStyle = {
  appearance: "none",
  border: "0",
  borderRadius: "0.6rem",
  padding: "0.75rem",
  background:
    "radial-gradient(circle at 20% 20%, rgba(255,214,0,1) 0%, rgba(255,132,0,1) 60%, rgba(170,60,0,1) 100%)",
  fontWeight: 600,
  fontSize: "0.9rem",
  color: "#000",
  textAlign: "center",
  cursor: "pointer",
};

const disabledButtonStyle = {
  opacity: 0.5,
  cursor: "not-allowed",
};

const footerStyle = {
  fontSize: "0.7rem",
  textAlign: "center",
  opacity: 0.5,
  marginTop: "2rem",
  lineHeight: 1.4,
};
