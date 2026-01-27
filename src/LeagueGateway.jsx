import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import NavBar from "./NavBar";
import colors from "./theme";

export default function LeagueGateway() {
  const [user, setUser] = useState(null);
  const [userDisplayName, setUserDisplayName] = useState("");
  const [userLeagues, setUserLeagues] = useState([]);
  const [createName, setCreateName] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [status, setStatus] = useState("");

  // On mount, load user data and leagues
  useEffect(() => {
    (async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      setUser(currentUser);

      // load /users/{uid}
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserDisplayName(data.displayName || "User");
        const leagueIds = data.leagues || [];
        // fetch league docs
        const leaguesData = [];
        for (const leagueId of leagueIds) {
          const leagueRef = doc(db, "leagues", leagueId);
          const leagueSnap = await getDoc(leagueRef);
          if (leagueSnap.exists()) {
            leaguesData.push({
              id: leagueId,
              ...leagueSnap.data(),
            });
          }
        }
        setUserLeagues(leaguesData);
      }
    })();
  }, []);

  // Helper: create random short joinCode like ABC123
  function generateJoinCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < 6; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  }

  // CREATE LEAGUE
  async function handleCreateLeague(e) {
    e.preventDefault();
    if (!user) return;
    if (!createName.trim()) return;

    setStatus("Creating league...");

    // new league id = Firestore doc id we choose (use uid + timestamp for now)
    const leagueId = `${user.uid}-${Date.now()}`;
    const joinCode = generateJoinCode();

    // 1. create league doc
    const leagueRef = doc(db, "leagues", leagueId);
    await setDoc(leagueRef, {
      name: createName.trim(),
      joinCode,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    });

    // 2. add self to league members subcollection
    const memberRef = doc(db, "leagues", leagueId, "members", user.uid);
    await setDoc(memberRef, {
      displayName: userDisplayName || "User",
      totalPoints: 0,
      joinedAt: serverTimestamp(),
    });

    // 3. push leagueId into /users/{uid}.leagues (create doc if it doesn't exist)
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      leagues: arrayUnion(leagueId),
    }, { merge: true });

    setStatus(`League created! Join code: ${joinCode}`);

    // update local UI
    setUserLeagues((prev) => [
      ...prev,
      {
        id: leagueId,
        name: createName.trim(),
        joinCode,
        createdBy: user.uid,
      },
    ]);

    setCreateName("");
  }

  // JOIN LEAGUE by code
  async function handleJoinLeague(e) {
    e.preventDefault();
    if (!user) return;
    if (!joinCodeInput.trim()) return;

    setStatus("Joining league...");

    // lookup league by joinCode
    const q = query(
      collection(db, "leagues"),
      where("joinCode", "==", joinCodeInput.trim().toUpperCase())
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      setStatus("No league found with that code.");
      return;
    }

    // assume first match
    const leagueDoc = snap.docs[0];
    const leagueId = leagueDoc.id;

    // 1. add self to league members subcollection
    const memberRef = doc(db, "leagues", leagueId, "members", user.uid);
    await setDoc(memberRef, {
      displayName: userDisplayName || "User",
      totalPoints: 0,
      joinedAt: serverTimestamp(),
    });

    // 2. push leagueId into /users/{uid}.leagues (create doc if it doesn't exist)
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      leagues: arrayUnion(leagueId),
    }, { merge: true });

    setStatus("Joined!");

    // update local list
    setUserLeagues((prev) => [
      ...prev,
      { id: leagueId, ...leagueDoc.data() },
    ]);

    setJoinCodeInput("");
  }

  return (
    <>
      <NavBar />
      <div style={pageStyle}>
        <div style={containerStyle}>
          <h1 style={titleStyle}>My Leagues</h1>
          <p style={subtitleStyle}>Create, join, and manage your leagues</p>

          {/* Status / feedback */}
          {status && (
            <div style={statusStyle}>
              {status}
            </div>
          )}

          {/* Your leagues */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Your Leagues</h2>
            {userLeagues.length === 0 ? (
              <div style={emptyStateStyle}>
                You haven't joined any leagues yet. Create or join one below!
              </div>
            ) : (
              <div style={leaguesGridStyle}>
                {userLeagues.map((lg) => (
                  <div key={lg.id} style={leagueCardStyle}>
                    <div style={leagueHeaderStyle}>
                      <h3 style={leagueNameStyle}>{lg.name}</h3>
                      <div style={joinCodeBadgeStyle}>
                        Code: {lg.joinCode}
                      </div>
                    </div>
                    <a
                      href={`/league/${lg.id}/standings`}
                      style={viewStandingsButtonStyle}
                      onMouseEnter={(e) => {
                        e.target.style.background = colors.primary;
                        e.target.style.color = colors.buttonText;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.color = colors.primary;
                      }}
                    >
                      View Standings
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Action Cards Row */}
          <div style={actionsGridStyle}>
            {/* Create league */}
            <section style={actionCardStyle}>
              <h2 style={actionTitleStyle}>Create a League</h2>
              <p style={actionDescriptionStyle}>
                Start your own league and invite friends
              </p>
              <form onSubmit={handleCreateLeague} style={formStyle}>
                <input
                  style={inputStyle}
                  placeholder="League name (e.g. SmackTalk 2025)"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  required
                />
                <button style={buttonStyle}>
                  Create League
                </button>
              </form>
            </section>

            {/* Join league */}
            <section style={actionCardStyle}>
              <h2 style={actionTitleStyle}>Join a League</h2>
              <p style={actionDescriptionStyle}>
                Enter a join code to join an existing league
              </p>
              <form onSubmit={handleJoinLeague} style={formStyle}>
                <input
                  style={inputStyle}
                  placeholder="Enter join code (e.g. ABC123)"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  required
                />
                <button style={buttonStyle}>
                  Join League
                </button>
              </form>
            </section>
          </div>

          {/* View Events */}
          <section style={eventsCalloutStyle}>
            <div style={eventsContentStyle}>
              <h2 style={eventsCalloutTitleStyle}>Ready to Make Picks?</h2>
              <p style={eventsCalloutDescriptionStyle}>
                View available events and submit your predictions
              </p>
            </div>
            <a
              href="/events"
              style={eventsButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = `0 8px 20px ${colors.primary}60`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = `0 4px 12px ${colors.primary}40`;
              }}
            >
              View Events
            </a>
          </section>
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
  maxWidth: "1000px",
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
  marginBottom: "2.5rem",
};

const statusStyle = {
  background: colors.background,
  border: `2px solid ${colors.primary}`,
  borderRadius: "8px",
  padding: "1rem",
  fontSize: "0.95rem",
  marginBottom: "2rem",
  textAlign: "center",
  color: colors.textColor,
  fontWeight: 500,
};

const sectionStyle = {
  background: colors.background,
  borderRadius: "12px",
  border: `1px solid ${colors.borderColor}`,
  padding: "2rem",
  marginBottom: "2rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const sectionTitleStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "1.5rem",
  color: colors.textColor,
  margin: "0 0 1.5rem 0",
  letterSpacing: "0.03em",
};

const emptyStateStyle = {
  fontSize: "1rem",
  color: colors.textColor,
  opacity: 0.6,
  textAlign: "center",
  padding: "2rem",
  lineHeight: 1.6,
};

const leaguesGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "1rem",
};

const leagueCardStyle = {
  background: "#F8F8F8",
  border: `1px solid ${colors.borderColor}`,
  borderRadius: "8px",
  padding: "1.25rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  transition: "all 0.2s ease",
};

const leagueHeaderStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const leagueNameStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "1.3rem",
  color: colors.textColor,
  margin: 0,
  letterSpacing: "0.02em",
};

const joinCodeBadgeStyle = {
  display: "inline-block",
  fontSize: "0.8rem",
  color: colors.primary,
  background: `${colors.primary}15`,
  padding: "0.35rem 0.75rem",
  borderRadius: "4px",
  fontWeight: 600,
  alignSelf: "flex-start",
};

const viewStandingsButtonStyle = {
  appearance: "none",
  border: `2px solid ${colors.primary}`,
  borderRadius: "6px",
  padding: "0.75rem",
  background: "transparent",
  fontWeight: 600,
  fontSize: "0.95rem",
  color: colors.primary,
  textAlign: "center",
  textDecoration: "none",
  display: "block",
  transition: "all 0.2s ease",
  cursor: "pointer",
};

const actionsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "1.5rem",
  marginBottom: "2rem",
};

const actionCardStyle = {
  background: colors.background,
  borderRadius: "12px",
  border: `1px solid ${colors.borderColor}`,
  padding: "2rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const actionTitleStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "1.3rem",
  color: colors.textColor,
  margin: "0 0 0.5rem 0",
  letterSpacing: "0.03em",
};

const actionDescriptionStyle = {
  fontSize: "0.9rem",
  color: colors.textColor,
  opacity: 0.7,
  marginBottom: "1.25rem",
  lineHeight: 1.5,
};

const formStyle = {
  display: "grid",
  gap: "0.75rem",
};

const inputStyle = {
  width: "100%",
  background: colors.background,
  border: `2px solid ${colors.borderColor}`,
  borderRadius: "8px",
  padding: "0.9rem 1rem",
  fontSize: "0.95rem",
  color: colors.textColor,
  outline: "none",
  fontFamily: '"Roboto", sans-serif',
  boxSizing: "border-box",
  transition: "border-color 0.2s ease",
};

const buttonStyle = {
  appearance: "none",
  border: "none",
  borderRadius: "8px",
  padding: "0.9rem 1rem",
  background: `linear-gradient(135deg, ${colors.buttonGradientStart}, ${colors.buttonGradientEnd})`,
  fontWeight: 600,
  fontSize: "0.95rem",
  color: colors.buttonText,
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: `0 4px 12px ${colors.primary}40`,
  fontFamily: '"Roboto", sans-serif',
};

const eventsCalloutStyle = {
  background: colors.background,
  borderRadius: "12px",
  border: `2px solid ${colors.primary}`,
  padding: "2.5rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "2rem",
  flexWrap: "wrap",
};

const eventsContentStyle = {
  flex: 1,
  minWidth: "250px",
};

const eventsCalloutTitleStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "1.8rem",
  color: colors.textColor,
  margin: "0 0 0.5rem 0",
  letterSpacing: "0.03em",
};

const eventsCalloutDescriptionStyle = {
  fontSize: "1rem",
  color: colors.textColor,
  opacity: 0.7,
  margin: 0,
  lineHeight: 1.5,
};

const eventsButtonStyle = {
  display: "inline-block",
  textDecoration: "none",
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  background: `linear-gradient(135deg, ${colors.buttonGradientStart}, ${colors.buttonGradientEnd})`,
  color: colors.buttonText,
  fontWeight: 700,
  fontSize: "1.2rem",
  padding: "1rem 2rem",
  borderRadius: "8px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  transition: "all 0.3s ease",
  boxShadow: `0 4px 12px ${colors.primary}40`,
  cursor: "pointer",
};
