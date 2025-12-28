// src/PickEventPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { db, auth } from "./firebase";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";

export default function PickEventPage() {
  const { eventId } = useParams();

  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState(null);
  const [choices, setChoices] = useState({});     // { [matchId]: "Wrestler Name" }
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  // Ensure we have a user (anonymous ok)
  async function ensureUser() {
    if (auth.currentUser) return auth.currentUser;
    const { user } = await signInAnonymously(auth);
    return user;
  }

  // Load event, matches, and existing picks
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setStatus("");

        // 1) user
        const u = await ensureUser();
        setUser(u);

        // 2) event
        const eventRef = doc(db, "events", eventId);
        const snap = await getDoc(eventRef);
        if (!snap.exists()) {
          setEventData(null);
          setStatus(`No such event: ${eventId}`);
          setLoading(false);
          return;
        }

        const ev = snap.data();

        // 3) matches (embedded or subcollection)
        let matches = Array.isArray(ev.matches) ? ev.matches : [];
        if (!matches.length) {
          const mSnap = await getDocs(collection(db, "events", eventId, "matches"));
          matches = mSnap.docs.map(d => ({ matchId: d.id, ...d.data() }));
        }

        // 4) existing picks
        const pickRef = doc(db, "events", eventId, "picks", u.uid);
        const pickSnap = await getDoc(pickRef);
        let existingChoices = {};
        if (pickSnap.exists()) {
          const pd = pickSnap.data();
          if (pd?.choices && typeof pd.choices === "object") {
            existingChoices = pd.choices;
          }
        }

        setChoices(existingChoices);
        setEventData({ ...ev, matches });
      } catch (e) {
        console.error(e);
        setStatus(e.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId]);

  const locked = eventData?.locked === true;
  const eventDate = useMemo(
    () =>
      eventData?.date?.toDate
        ? eventData.date.toDate()
        : new Date(eventData?.date || Date.now()),
    [eventData]
  );

  function setPick(matchId, wrestlerName) {
    setChoices((prev) => ({ ...prev, [matchId]: wrestlerName }));
  }

  async function handleSavePicks() {
    try {
      if (!user || !eventData) return;
      setSaving(true);
      setStatus("Saving picks…");

      const pickRef = doc(db, "events", eventId, "picks", user.uid);
      await setDoc(pickRef, {
        userId: user.uid,
        leagueId: null, // future: fill with selected league
        choices,
        submittedAt: serverTimestamp(),
      });

      setStatus("Picks saved ✔");
    } catch (e) {
      console.error(e);
      setStatus(`Error saving picks: ${e.message || e}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ScreenWrapper>
        <Header title="Loading…" />
        <StatusBox text="Fetching event…" />
      </ScreenWrapper>
    );
  }

  if (!eventData) {
    return (
      <ScreenWrapper>
        <Header title="Make Your Picks" />
        <StatusBox text={status || "Event not found."} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Header title={eventData.name || "Make Your Picks"} />

      {status && <StatusBox text={status} />}
      {locked && <StatusBox text="This event is locked. Picks are closed." />}

      <section style={cardSectionStyle}>
        <div style={cardSectionHeaderStyle}>
          <div style={{ fontWeight: 600, fontSize: "1rem" }}>
            {(eventData.brand || "Event")} —{" "}
            {isNaN(eventDate) ? "Date TBD" : eventDate.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.7, lineHeight: 1.4 }}>
            Choose who you think will win each match.
          </div>
        </div>

        {Array.isArray(eventData.matches) && eventData.matches.length > 0 ? (
          eventData.matches.map((m, idx) => {
            const currentPick = choices[m.matchId] || null;
            const competitors = Array.isArray(m.competitors) ? m.competitors : [];
            return (
              <div key={m.matchId || `m-${idx}`} style={matchCardStyle}>
                <div
                  style={{
                    fontSize: "0.8rem",
                    opacity: 0.7,
                    marginBottom: "0.5rem",
                    lineHeight: 1.4,
                  }}
                >
                  {m.type || "Match"}
                  {m.titleMatch ? " • Title Match" : ""}
                </div>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {competitors.map((name) => (
                    <button
                      key={name}
                      onClick={() => {
                        if (!locked) setPick(m.matchId, name);
                      }}
                      style={{
                        ...pickButtonStyle,
                        ...(currentPick === name ? pickButtonSelectedStyle : {}),
                        ...(locked ? pickButtonLockedStyle : {}),
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{name}</div>
                      {currentPick === name && (
                        <div
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 500,
                            opacity: 0.8,
                          }}
                        >
                          ✔ your pick
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ opacity: 0.8, fontSize: "0.85rem" }}>
            No matches found for this event.
          </div>
        )}
      </section>

      {!locked && (
        <button
          style={{
            ...saveButtonStyle,
            opacity: saving ? 0.7 : 1,
            cursor: saving ? "wait" : "pointer",
          }}
          onClick={handleSavePicks}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save My Picks"}
        </button>
      )}

      <Footer />
    </ScreenWrapper>
  );
}

/* ----- presentational helpers (unchanged) ----- */
function ScreenWrapper({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0b0b10",
        color: "white",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "1.5rem",
        maxWidth: "480px",
        margin: "0 auto",
      }}
    >
      {children}
    </div>
  );
}
function Header({ title }) {
  return (
    <h1
      style={{
        fontSize: "1.1rem",
        fontWeight: 600,
        marginBottom: "1rem",
        textAlign: "center",
      }}
    >
      {title}
    </h1>
  );
}
function StatusBox({ text }) {
  if (!text) return null;
  return (
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
      {text}
    </div>
  );
}
function Footer() {
  return (
    <p
      style={{
        fontSize: "0.7rem",
        textAlign: "center",
        opacity: 0.5,
        marginTop: "2rem",
        lineHeight: 1.4,
      }}
    >
      prototype build • not for gambling • bragging rights only
    </p>
  );
}

/* ----- styles ----- */
const cardSectionStyle = {
  background: "#1a1a22",
  border: "1px solid #2f2f44",
  borderRadius: "0.75rem",
  padding: "1rem",
  marginBottom: "1.5rem",
};
const cardSectionHeaderStyle = { marginBottom: "1rem", lineHeight: 1.4 };
const matchCardStyle = {
  background: "#262636",
  border: "1px solid #3d3d5c",
  borderRadius: "0.6rem",
  padding: "0.75rem",
  fontSize: "0.9rem",
  lineHeight: 1.4,
  color: "#fff",
  marginBottom: "0.75rem",
};
const pickButtonStyle = {
  appearance: "none",
  border: "1px solid #3a3a55",
  borderRadius: "0.6rem",
  background: "#0f0f16",
  color: "#fff",
  textAlign: "left",
  padding: "0.75rem 0.9rem",
  fontSize: "0.9rem",
  lineHeight: 1.4,
  display: "flex",
  flexDirection: "column",
};
const pickButtonSelectedStyle = {
  border: "1px solid #ffd600",
  boxShadow: "0 0 12px rgba(255, 214, 0, 0.4)",
};
const pickButtonLockedStyle = { opacity: 0.4, cursor: "not-allowed" };
const saveButtonStyle = {
  appearance: "none",
  border: "0",
  width: "100%",
  borderRadius: "0.75rem",
  padding: "0.9rem 1rem",
  background:
    "radial-gradient(circle at 20% 20%, rgba(255,214,0,1) 0%, rgba(255,132,0,1) 60%, rgba(170,60,0,1) 100%)",
  fontWeight: 600,
  fontSize: "1rem",
  color: "#000",
  textAlign: "center",
};
