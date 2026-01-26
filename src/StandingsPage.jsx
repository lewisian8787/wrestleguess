import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import NavBar from "./NavBar";

export default function StandingsPage() {
  const { leagueId } = useParams();

  const [loading, setLoading] = useState(true);
  const [leagueData, setLeagueData] = useState(null);
  const [standings, setStandings] = useState([]);
  const [error, setError] = useState("");
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        // 1. Get league info
        const leagueRef = doc(db, "leagues", leagueId);
        const leagueSnap = await getDoc(leagueRef);

        if (!leagueSnap.exists()) {
          setError("League not found");
          setLoading(false);
          return;
        }

        setLeagueData(leagueSnap.data());

        // 2. Get all members with their scores
        const membersRef = collection(db, "leagues", leagueId, "members");
        const membersSnap = await getDocs(membersRef);

        // 3. Sort by totalPoints descending
        const membersList = membersSnap.docs
          .map(doc => ({
            userId: doc.id,
            ...doc.data()
          }))
          .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

        setStandings(membersList);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    })();
  }, [leagueId]);

  if (loading) {
    return (
      <>
        <NavBar />
        <ScreenWrapper>
          <Header title="Loading standings..." />
          <StatusBox text="Fetching league data..." />
        </ScreenWrapper>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <ScreenWrapper>
          <Header title="Error" />
          <StatusBox text={error} />
        </ScreenWrapper>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <ScreenWrapper>
        <Header title={`${leagueData?.name || "League"} Standings`} />

      <div style={standingsCardStyle}>
        <div style={standingsHeaderStyle}>
          <span style={rankColumnStyle}>Rank</span>
          <span style={nameColumnStyle}>Player</span>
          <span style={pointsColumnStyle}>Points</span>
        </div>

        {standings.length === 0 ? (
          <div style={emptyStateStyle}>
            No scores yet. Make picks and have an admin score an event to see standings!
          </div>
        ) : (
          standings.map((member, index) => (
            <div
              key={member.userId}
              style={{
                ...standingsRowStyle,
                background: index === 0 ? "#2a2a3a" : index % 2 === 0 ? "#1a1a22" : "#16161e"
              }}
            >
              <span style={rankColumnStyle}>
                {index === 0 && "🏆 "}
                {index === 1 && "🥈 "}
                {index === 2 && "🥉 "}
                #{index + 1}
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
        <div style={{ marginTop: "1.5rem" }}>
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            style={breakdownToggleStyle}
          >
            {showBreakdown ? "Hide" : "Show"} Event Breakdown
          </button>

          {showBreakdown && (
            <div style={{ marginTop: "1rem" }}>
              {standings.map(member => {
                const eventScores = member.eventScores || {};
                const eventIds = Object.keys(eventScores);

                if (eventIds.length === 0) return null;

                return (
                  <div key={member.userId} style={breakdownCardStyle}>
                    <div style={breakdownHeaderStyle}>
                      {member.displayName || "Guest"} - Event History
                    </div>
                    {eventIds.map(eventId => {
                      const score = eventScores[eventId];
                      return (
                        <div key={eventId} style={breakdownRowStyle}>
                          <span style={{ flex: 1, fontSize: "0.8rem" }}>{eventId}</span>
                          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                            {score.points?.toFixed(1)} pts
                          </span>
                          <span style={{ fontSize: "0.75rem", opacity: 0.7, marginLeft: "0.5rem" }}>
                            ({score.correctPicks}/{score.totalPicks})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Footer />
    </ScreenWrapper>
    </>
  );
}

/* ----- Helper Components ----- */
function ScreenWrapper({ children }) {
  return (
    <div style={screenWrapperStyle}>
      {children}
    </div>
  );
}

function Header({ title }) {
  return (
    <h1 style={headerStyle}>
      {title}
    </h1>
  );
}

function StatusBox({ text }) {
  if (!text) return null;
  return (
    <div style={statusBoxStyle}>
      {text}
    </div>
  );
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
  maxWidth: "480px",
  margin: "0 auto",
};

const headerStyle = {
  fontSize: "1.1rem",
  fontWeight: 600,
  marginBottom: "1rem",
  textAlign: "center",
};

const statusBoxStyle = {
  background: "#1f1f29",
  border: "1px solid #3a3a55",
  borderRadius: "0.75rem",
  padding: "0.75rem",
  fontSize: "0.8rem",
  marginBottom: "1rem",
  textAlign: "center",
  lineHeight: 1.4,
};

const standingsCardStyle = {
  background: "#1a1a22",
  border: "1px solid #2f2f44",
  borderRadius: "0.75rem",
  overflow: "hidden",
};

const standingsHeaderStyle = {
  display: "flex",
  padding: "0.75rem 1rem",
  background: "#262636",
  fontWeight: 600,
  fontSize: "0.8rem",
  borderBottom: "1px solid #3a3a55",
  textTransform: "uppercase",
  opacity: 0.8,
};

const standingsRowStyle = {
  display: "flex",
  padding: "0.75rem 1rem",
  borderBottom: "1px solid #2a2a3a",
  fontSize: "0.9rem",
  alignItems: "center",
};

const rankColumnStyle = {
  width: "4rem",
  flexShrink: 0,
};

const nameColumnStyle = {
  flex: 1,
  fontWeight: 500,
};

const pointsColumnStyle = {
  width: "4.5rem",
  textAlign: "right",
  fontWeight: 600,
  color: "#ffd600",
};

const emptyStateStyle = {
  padding: "2rem 1rem",
  textAlign: "center",
  fontSize: "0.85rem",
  opacity: 0.7,
  lineHeight: 1.5,
};

const breakdownToggleStyle = {
  appearance: "none",
  border: "1px solid #3a3a55",
  borderRadius: "0.6rem",
  background: "#1a1a22",
  color: "#fff",
  padding: "0.75rem 1rem",
  fontSize: "0.85rem",
  fontWeight: 500,
  width: "100%",
  cursor: "pointer",
  textAlign: "center",
};

const breakdownCardStyle = {
  background: "#1a1a22",
  border: "1px solid #2f2f44",
  borderRadius: "0.6rem",
  padding: "0.75rem",
  marginBottom: "0.75rem",
};

const breakdownHeaderStyle = {
  fontSize: "0.85rem",
  fontWeight: 600,
  marginBottom: "0.5rem",
  paddingBottom: "0.5rem",
  borderBottom: "1px solid #3a3a55",
};

const breakdownRowStyle = {
  display: "flex",
  alignItems: "center",
  padding: "0.5rem 0",
  fontSize: "0.85rem",
};

const footerStyle = {
  fontSize: "0.7rem",
  textAlign: "center",
  opacity: 0.5,
  marginTop: "2rem",
  lineHeight: 1.4,
};
