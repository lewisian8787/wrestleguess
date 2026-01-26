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
import NavBar from "./NavBar";

export default function PickEventPage() {
  const { eventId } = useParams();

  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState(null);
  const [choices, setChoices] = useState({});     // { [matchId]: { winner: "Name", confidence: 20 } }
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [isLegacyPick, setIsLegacyPick] = useState(false);

  // Load event, matches, and existing picks
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setStatus("");

        // 1) get authenticated user
        const u = auth.currentUser;
        if (!u) {
          setStatus("Not authenticated");
          setLoading(false);
          return;
        }
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

        // 4) existing picks - handle both v1 (string) and v2 (object with confidence)
        const pickRef = doc(db, "events", eventId, "picks", u.uid);
        const pickSnap = await getDoc(pickRef);
        let existingChoices = {};
        let isLegacy = false;

        if (pickSnap.exists()) {
          const pd = pickSnap.data();
          if (pd?.choices && typeof pd.choices === "object") {
            // Check if it's v1 (string values) or v2 (object values)
            const firstValue = Object.values(pd.choices)[0];
            if (typeof firstValue === "string") {
              // v1 format - convert to read-only display format
              isLegacy = true;
              Object.keys(pd.choices).forEach(matchId => {
                existingChoices[matchId] = {
                  winner: pd.choices[matchId],
                  confidence: 0
                };
              });
            } else {
              // v2 format - use as-is
              existingChoices = pd.choices;
            }
          }
        }

        setIsLegacyPick(isLegacy);
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

  // Calculate total confidence allocated
  const totalConfidence = useMemo(() => {
    return Object.values(choices).reduce((sum, choice) => {
      return sum + (choice?.confidence || 0);
    }, 0);
  }, [choices]);

  const remainingConfidence = 100 - totalConfidence;

  function setPick(matchId, wrestlerName) {
    setChoices((prev) => ({
      ...prev,
      [matchId]: {
        winner: wrestlerName,
        confidence: prev[matchId]?.confidence || 0
      }
    }));
  }

  function setConfidence(matchId, value) {
    const numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    setChoices((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        confidence: numValue
      }
    }));
  }

  async function handleSavePicks() {
    try {
      if (!user || !eventData) return;

      // Validation: Check all matches have picks
      const allMatchesPicked = eventData.matches.every(m =>
        choices[m.matchId]?.winner
      );

      if (!allMatchesPicked) {
        setStatus("Please make a pick for every match before saving.");
        return;
      }

      // Validation: Check exactly 100 confidence points allocated
      if (totalConfidence !== 100) {
        setStatus(`You must allocate exactly 100 confidence points. Currently: ${totalConfidence}`);
        return;
      }

      setSaving(true);
      setStatus("Saving picks…");

      const pickRef = doc(db, "events", eventId, "picks", user.uid);
      await setDoc(pickRef, {
        userId: user.uid,
        leagueId: null,
        choices,
        totalConfidence,
        version: 2,
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
      <>
        <NavBar />
        <ScreenWrapper>
          <Header title="Loading…" />
          <StatusBox text="Fetching event…" />
        </ScreenWrapper>
      </>
    );
  }

  if (!eventData) {
    return (
      <>
        <NavBar />
        <ScreenWrapper>
          <Header title="Make Your Picks" />
          <StatusBox text={status || "Event not found."} />
        </ScreenWrapper>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <ScreenWrapper>
        <Header title={eventData.name || "Make Your Picks"} />

      {status && <StatusBox text={status} />}
      {locked && <StatusBox text="This event is locked. Picks are closed." />}
      {isLegacyPick && (
        <StatusBox text="These are old-format picks. To update them with confidence points, please make new picks." />
      )}

      {!locked && !isLegacyPick && (
        <div style={budgetTrackerStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: 600 }}>Confidence Budget:</span>
            <span style={{
              fontWeight: 600,
              color: remainingConfidence === 0 ? "#4ade80" : (remainingConfidence < 0 ? "#f87171" : "#ffd600")
            }}>
              {remainingConfidence} / 100 remaining
            </span>
          </div>
          <div style={progressBarStyle}>
            <div style={{
              ...progressFillStyle,
              width: `${Math.min(100, totalConfidence)}%`,
              background: totalConfidence === 100 ? "#4ade80" : (totalConfidence > 100 ? "#f87171" : "#ffd600")
            }} />
          </div>
          <div style={{ fontSize: "0.7rem", opacity: 0.7, marginTop: "0.5rem", textAlign: "center" }}>
            Allocate exactly 100 points across all matches
          </div>
        </div>
      )}

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
            const currentChoice = choices[m.matchId] || null;
            const currentWinner = currentChoice?.winner || null;
            const currentConfidence = currentChoice?.confidence || 0;
            const competitors = Array.isArray(m.competitors) ? m.competitors : [];
            const multiplier = m.multiplier || 1.0;

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
                  {multiplier !== 1.0 && ` • ${multiplier}x multiplier`}
                </div>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {competitors.map((name) => (
                    <button
                      key={name}
                      onClick={() => {
                        if (!locked && !isLegacyPick) setPick(m.matchId, name);
                      }}
                      style={{
                        ...pickButtonStyle,
                        ...(currentWinner === name ? pickButtonSelectedStyle : {}),
                        ...(locked || isLegacyPick ? pickButtonLockedStyle : {}),
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{name}</div>
                      {currentWinner === name && (
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

                {/* Confidence allocation - only show if winner selected and not locked/legacy */}
                {currentWinner && !locked && !isLegacyPick && (
                  <div style={confidenceInputContainerStyle}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                      Confidence Points:
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      <input
                        type="range"
                        min="0"
                        max={Math.min(100, remainingConfidence + currentConfidence)}
                        value={currentConfidence}
                        onChange={(e) => setConfidence(m.matchId, e.target.value)}
                        style={rangeInputStyle}
                      />
                      <input
                        type="number"
                        min="0"
                        max={Math.min(100, remainingConfidence + currentConfidence)}
                        value={currentConfidence}
                        onChange={(e) => setConfidence(m.matchId, e.target.value)}
                        style={numberInputStyle}
                      />
                    </div>
                    {currentConfidence > 0 && multiplier !== 1.0 && (
                      <div style={{ fontSize: "0.7rem", opacity: 0.6, marginTop: "0.25rem" }}>
                        Potential points: {currentConfidence} × {multiplier} = {(currentConfidence * multiplier).toFixed(1)}
                      </div>
                    )}
                  </div>
                )}
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
    </>
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

const budgetTrackerStyle = {
  background: "#1a1a22",
  border: "1px solid #2f2f44",
  borderRadius: "0.75rem",
  padding: "1rem",
  marginBottom: "1rem",
  fontSize: "0.9rem",
};

const progressBarStyle = {
  width: "100%",
  height: "0.5rem",
  background: "#0f0f16",
  borderRadius: "0.25rem",
  overflow: "hidden",
};

const progressFillStyle = {
  height: "100%",
  transition: "width 0.3s ease, background 0.3s ease",
  borderRadius: "0.25rem",
};

const confidenceInputContainerStyle = {
  marginTop: "0.75rem",
  paddingTop: "0.75rem",
  borderTop: "1px solid #3a3a55",
};

const rangeInputStyle = {
  flex: 1,
  height: "0.5rem",
  appearance: "none",
  background: "#3a3a55",
  borderRadius: "0.25rem",
  outline: "none",
};

const numberInputStyle = {
  width: "4rem",
  background: "#0f0f16",
  border: "1px solid #3a3a55",
  borderRadius: "0.4rem",
  padding: "0.5rem",
  fontSize: "0.85rem",
  color: "#fff",
  textAlign: "center",
  outline: "none",
};
