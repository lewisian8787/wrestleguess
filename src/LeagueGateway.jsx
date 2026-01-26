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

    setStatus(`League created. Join code: ${joinCode}`);

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
      <div
        style={{
          minHeight: "calc(100vh - 60px)",
          backgroundColor: "#0b0b10",
          color: "white",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          padding: "1.5rem",
          maxWidth: "480px",
          margin: "0 auto",
        }}
      >

      {/* Status / feedback */}
      {status && (
        <div
          style={{
            background: "#1f1f29",
            border: "1px solid #3a3a55",
            borderRadius: "0.75rem",
            padding: "0.75rem",
            fontSize: "0.8rem",
            marginBottom: "1rem",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          {status}
        </div>
      )}

      {/* Your leagues */}
      <section
        style={{
          background: "#1a1a22",
          border: "1px solid #2f2f44",
          borderRadius: "0.75rem",
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
          Your Leagues
        </h2>
        {userLeagues.length === 0 ? (
          <div style={{ fontSize: "0.9rem", opacity: 0.7 }}>
            You haven't joined any leagues yet.
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {userLeagues.map((lg) => (
              <li
                key={lg.id}
                style={{
                  background: "#262636",
                  border: "1px solid #3d3d5c",
                  borderRadius: "0.5rem",
                  padding: "0.75rem",
                  fontSize: "0.9rem",
                  lineHeight: 1.4,
                  marginBottom: "0.5rem",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{lg.name}</div>
                <div style={{ fontSize: "0.75rem", opacity: 0.7, marginBottom: "0.75rem" }}>
                  Code: {lg.joinCode}
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <a
                    href={`/league/${lg.id}/standings`}
                    style={{
                      ...linkButtonStyle,
                      flex: 1,
                    }}
                  >
                    View Standings
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Create league */}
      <section
        style={{
          background: "#1a1a22",
          border: "1px solid #2f2f44",
          borderRadius: "0.75rem",
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
          Create a League
        </h2>
        <form onSubmit={handleCreateLeague} style={{ display: "grid", gap: "0.75rem" }}>
          <input
            style={inputStyle}
            placeholder="League name (e.g. SmackTalk 2025)"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
          />
          <button style={buttonStyle}>
            Create
          </button>
        </form>
      </section>

      {/* Join league */}
      <section
        style={{
          background: "#1a1a22",
          border: "1px solid #2f2f44",
          borderRadius: "0.75rem",
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
          Join a League
        </h2>
        <form onSubmit={handleJoinLeague} style={{ display: "grid", gap: "0.75rem" }}>
          <input
            style={inputStyle}
            placeholder="Enter join code (e.g. ABC123)"
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value)}
          />
          <button style={buttonStyle}>
            Join
          </button>
        </form>
      </section>

      {/* View Events */}
      <section
        style={{
          background: "#1a1a22",
          border: "1px solid #2f2f44",
          borderRadius: "0.75rem",
          padding: "1rem",
          marginBottom: "3rem",
        }}
      >
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
          Make Picks
        </h2>
        <p style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "0.75rem", lineHeight: 1.4 }}>
          View available events and submit your predictions
        </p>
        <a href="/events" style={{ ...buttonStyle, display: "block", textDecoration: "none" }}>
          View Events
        </a>
      </section>

      <footer
        style={{
          fontSize: "0.7rem",
          textAlign: "center",
          opacity: 0.5,
          marginTop: "2rem",
          lineHeight: 1.4,
        }}
      >
        prototype build • not for gambling • bragging rights only
      </footer>
    </div>
    </>
  );
}

const inputStyle = {
  width: "100%",
  background: "#0f0f16",
  border: "1px solid #3a3a55",
  borderRadius: "0.6rem",
  padding: "0.75rem 0.9rem",
  fontSize: "0.9rem",
  color: "#fff",
  outline: "none",
};

const buttonStyle = {
  appearance: "none",
  border: "0",
  borderRadius: "0.6rem",
  padding: "0.75rem 0.9rem",
  background:
    "radial-gradient(circle at 20% 20%, rgba(255,214,0,1) 0%, rgba(255,132,0,1) 60%, rgba(170,60,0,1) 100%)",
  fontWeight: 600,
  fontSize: "0.9rem",
  color: "#000",
  textAlign: "center",
};

const linkButtonStyle = {
  appearance: "none",
  border: "1px solid #3a3a55",
  borderRadius: "0.5rem",
  padding: "0.6rem 0.75rem",
  background: "#1a1a22",
  fontWeight: 500,
  fontSize: "0.85rem",
  color: "#fff",
  textAlign: "center",
  textDecoration: "none",
  display: "block",
};
