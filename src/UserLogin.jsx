import { useState } from "react";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function UserLogin() {
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    if (!email || !password || !displayName) {
      setStatus("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setStatus("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setStatus("Creating account...");

    try {
      // Create Firebase auth account
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        displayName: displayName.trim(),
        leagues: [],
        createdAt: new Date(),
      });

      setStatus("Account created! Redirecting...");
      setTimeout(() => {
        window.location.href = "/home";
      }, 1000);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setStatus("Email already in use. Try logging in instead.");
      } else if (err.code === "auth/invalid-email") {
        setStatus("Invalid email address");
      } else {
        setStatus("Error: " + err.message);
      }
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) {
      setStatus("Please enter email and password");
      return;
    }

    setLoading(true);
    setStatus("Logging in...");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setStatus("Login successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "/home";
      }, 500);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
        setStatus("Invalid email or password");
      } else {
        setStatus("Error: " + err.message);
      }
      setLoading(false);
    }
  }

  return (
    <div style={screenStyle}>
      <h1 style={titleStyle}>WrestleGuess</h1>

      <div style={modeToggleContainer}>
        <button
          onClick={() => setMode("login")}
          style={{
            ...modeToggleButton,
            ...(mode === "login" ? modeToggleButtonActive : {}),
          }}
        >
          Login
        </button>
        <button
          onClick={() => setMode("signup")}
          style={{
            ...modeToggleButton,
            ...(mode === "signup" ? modeToggleButtonActive : {}),
          }}
        >
          Sign Up
        </button>
      </div>

      {mode === "signup" ? (
        <form onSubmit={handleSignup} style={formStyle}>
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={inputStyle}
            disabled={loading}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            disabled={loading}
          />
          <button style={buttonStyle} disabled={loading}>
            Create Account
          </button>
        </form>
      ) : (
        <form onSubmit={handleLogin} style={formStyle}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            disabled={loading}
          />
          <button style={buttonStyle} disabled={loading}>
            Log In
          </button>
        </form>
      )}

      {status && <p style={statusStyle}>{status}</p>}

      <p style={footerStyle}>
        prototype build • not for gambling • bragging rights only
      </p>
    </div>
  );
}

const screenStyle = {
  minHeight: "100vh",
  backgroundColor: "#0b0b10",
  color: "white",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  padding: "2rem",
  maxWidth: "420px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const titleStyle = {
  textAlign: "center",
  marginBottom: "2rem",
  fontSize: "1.75rem",
  fontWeight: 700,
  background: "linear-gradient(135deg, #ffd600 0%, #ff8400 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const modeToggleContainer = {
  display: "flex",
  gap: "0.5rem",
  marginBottom: "1.5rem",
  background: "#1a1a22",
  padding: "0.25rem",
  borderRadius: "0.6rem",
  border: "1px solid #2f2f44",
};

const modeToggleButton = {
  flex: 1,
  padding: "0.75rem",
  border: "none",
  background: "transparent",
  color: "#999",
  fontSize: "0.9rem",
  fontWeight: 500,
  borderRadius: "0.4rem",
  cursor: "pointer",
  transition: "all 0.2s",
};

const modeToggleButtonActive = {
  background: "#262636",
  color: "white",
  fontWeight: 600,
};

const formStyle = {
  display: "grid",
  gap: "1rem",
  marginBottom: "1rem",
};

const inputStyle = {
  background: "#1a1a22",
  border: "1px solid #3a3a55",
  borderRadius: "0.6rem",
  padding: "0.9rem",
  color: "white",
  fontSize: "0.95rem",
  outline: "none",
};

const buttonStyle = {
  border: "none",
  borderRadius: "0.6rem",
  padding: "0.9rem",
  background:
    "radial-gradient(circle at 20% 20%, rgba(255,214,0,1) 0%, rgba(255,132,0,1) 60%, rgba(170,60,0,1) 100%)",
  color: "black",
  fontWeight: 600,
  fontSize: "1rem",
  cursor: "pointer",
};

const statusStyle = {
  textAlign: "center",
  fontSize: "0.85rem",
  marginTop: "1rem",
  padding: "0.75rem",
  background: "#1f1f29",
  border: "1px solid #3a3a55",
  borderRadius: "0.6rem",
  lineHeight: 1.4,
};

const footerStyle = {
  fontSize: "0.7rem",
  textAlign: "center",
  opacity: 0.5,
  marginTop: "2rem",
  lineHeight: 1.4,
};
