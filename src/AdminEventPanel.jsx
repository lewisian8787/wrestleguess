import { useEffect, useState } from "react";
import { getCurrentUserOrNull } from "./authSignIn";
import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function AdminEventPanel() {
  // ---------- ADMIN GATE STATE ----------
  const [checked, setChecked] = useState(false); // have we finished checking access?
  const [isAdmin, setIsAdmin] = useState(false); // are they allowed?

  // ---------- FORM STATE ----------
  const [eventId, setEventId] = useState("AEW_FullGear_2025");
  const [name, setName] = useState("AEW Full Gear");
  const [brand, setBrand] = useState("AEW");
  const [date, setDate] = useState("2025-11-23T01:00:00Z");

  const [matchesJson, setMatchesJson] = useState(
    JSON.stringify(
      [
        {
          matchId: "m1",
          type: "Singles",
          titleMatch: false,
          competitors: ["Swerve Strickland", "Hangman Page"],
          winner: null,
        },
        {
          matchId: "m2",
          type: "World Title",
          titleMatch: true,
          competitors: ["MJF", "Will Ospreay"],
          winner: null,
        },
      ],
      null,
      2
    )
  );

  const [status, setStatus] = useState("");

  // ---------- ACCESS CHECK ----------
  useEffect(() => {
    (async () => {
      const user = await getCurrentUserOrNull();

      if (user) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists() && snap.data().isAdmin === true) {
          setIsAdmin(true);
        }
      }

      setChecked(true);
    })();
  }, []);

  // ---------- EVENT SAVE HANDLER ----------
  async function handleSaveEvent(e) {
    e.preventDefault();
    setStatus("Saving...");

    let matches;
    try {
      matches = JSON.parse(matchesJson);
      if (!Array.isArray(matches)) {
        throw new Error("matchesJson must be an array");
      }
    } catch (err) {
      setStatus("Bad matches JSON: " + err.message);
      return;
    }

    try {
      const ref = doc(db, "events", eventId);
      await setDoc(ref, {
        name,
        brand,
        date,
        locked: false,
        scored: false,
        matches,
        createdAt: serverTimestamp(),
      });

      setStatus("Event saved ✔");
    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message);
    }
  }

  // ---------- RENDER GUARD STATES ----------
  if (!checked) {
    // still checking if you're admin
    return (
      <div style={screenStyle}>
        <p style={{ textAlign: "center" }}>Checking access…</p>
      </div>
    );
  }

  if (!isAdmin) {
    // checked, and you are NOT admin
    return (
      <div style={screenStyle}>
        <p
          style={{
            color: "red",
            textAlign: "center",
            lineHeight: 1.4,
            fontSize: "0.9rem",
          }}
        >
          Access denied.
          <br />
          <a
            href="/admin/login"
            style={{
              color: "#ffd600",
              textDecoration: "underline",
              fontWeight: 600,
            }}
          >
            Log in as admin
          </a>
          .
        </p>
      </div>
    );
  }

  // ---------- MAIN ADMIN PANEL UI ----------
  return (
    <div style={screenStyle}>
      <h1
        style={{
          fontSize: "1.1rem",
          fontWeight: 600,
          marginBottom: "1rem",
          textAlign: "center",
        }}
      >
        Admin: Create / Edit Event
      </h1>

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

      <form
        onSubmit={handleSaveEvent}
        style={{ display: "grid", gap: "0.75rem" }}
      >
        <label style={labelStyle}>
          <div style={labelTextStyle}>Event ID (document key)</div>
          <input
            style={inputStyle}
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          <div style={labelTextStyle}>Display Name</div>
          <input
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          <div style={labelTextStyle}>Brand</div>
          <input
            style={inputStyle}
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          <div style={labelTextStyle}>Lock Time (ISO)</div>
          <input
            style={inputStyle}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          <div style={labelTextStyle}>Matches (JSON array)</div>
          <textarea
            style={{
              ...inputStyle,
              minHeight: "8rem",
              fontFamily: "monospace",
              fontSize: "0.8rem",
              lineHeight: 1.4,
            }}
            value={matchesJson}
            onChange={(e) => setMatchesJson(e.target.value)}
          />
        </label>

        <button style={buttonStyle}>Save / Overwrite Event</button>
      </form>

      <p
        style={{
          fontSize: "0.7rem",
          textAlign: "center",
          opacity: 0.5,
          marginTop: "2rem",
          lineHeight: 1.4,
        }}
      >
        You’ll only ever see this page because you’re admin.
      </p>
    </div>
  );
}

/* ---------- styles (OUTSIDE the component!) ---------- */

const screenStyle = {
  minHeight: "100vh",
  backgroundColor: "#0b0b10",
  color: "white",
  fontFamily:
    "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  padding: "1.5rem",
  maxWidth: "480px",
  margin: "0 auto",
};

const labelStyle = {
  display: "grid",
  gap: "0.4rem",
};

const labelTextStyle = {
  fontSize: "0.8rem",
  fontWeight: 500,
  opacity: 0.8,
};

const inputStyle = {
  width: "100%",
  background: "#0f0f16",
  border: "1px solid #3a3a55",
  borderRadius: "0.6rem",
  padding: "0.75rem 0.9rem",
  fontSize: "0.9rem",
  lineHeight: 1.4,
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
