import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, login } from "./api/auth.js";
import colors from "./theme";
import logo from "./assets/images/main_logo.png";

export default function UserLogin() {
  const navigate = useNavigate();
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
      await register({ email, password, displayName: displayName.trim() });
      setStatus("Account created! Redirecting...");
      setTimeout(() => {
        navigate("/home");
      }, 1000);
    } catch (err) {
      console.error(err);
      if (err.message.includes("already exists")) {
        setStatus("Email already in use. Try logging in instead.");
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
      await login({ email, password });
      setStatus("Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/home");
      }, 500);
    } catch (err) {
      console.error(err);
      if (err.message.includes("Invalid")) {
        setStatus("Invalid email or password");
      } else {
        setStatus("Error: " + err.message);
      }
      setLoading(false);
    }
  }

  return (
    <div style={screenStyle}>
      <div style={containerStyle}>
        {/* Logo */}
        <a href="/" style={{ textDecoration: "none", marginBottom: "2rem" }}>
          <img
            src={logo}
            alt="WrestleGuess"
            style={logoStyle}
          />
        </a>

        {/* Mode Toggle */}
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

        {/* Forms */}
        {mode === "signup" ? (
          <form onSubmit={handleSignup} style={formStyle}>
            <div style={fieldGroup}>
              <label style={labelStyle}>Display Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={inputStyle}
                disabled={loading}
                required
              />
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                disabled={loading}
                required
              />
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                disabled={loading}
                required
              />
            </div>
            <button style={buttonStyle} disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} style={formStyle}>
            <div style={fieldGroup}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                disabled={loading}
                required
              />
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                disabled={loading}
                required
              />
            </div>
            <button style={buttonStyle} disabled={loading}>
              {loading ? "Logging In..." : "Log In"}
            </button>
          </form>
        )}

        {status && (
          <div style={statusStyle}>
            {status}
          </div>
        )}

        {/* Footer */}
        <div style={footerStyle}>
          <p style={{ margin: "0.5rem 0", opacity: 0.6 }}>
            Free Forever • No Betting • Just For Fun
          </p>
          <p style={{ margin: "0.5rem 0", fontSize: "0.75rem", opacity: 0.5 }}>
            © 2024 WrestleGuess. All rights reserved.
          </p>
        </div>

        {/* Back to Landing */}
        <a href="/" style={backLinkStyle}>
          ← Back to Home
        </a>
      </div>
    </div>
  );
}

/* ----- Styles ----- */
const screenStyle = {
  minHeight: "100vh",
  background: "#F8F8F8",
  fontFamily: '"Roboto", sans-serif',
  padding: "2rem 1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const containerStyle = {
  width: "100%",
  maxWidth: "440px",
  background: colors.background,
  padding: "3rem 2.5rem",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  border: `1px solid ${colors.borderColor}`,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const logoStyle = {
  maxWidth: "280px",
  width: "100%",
  height: "auto",
  display: "block",
};

const modeToggleContainer = {
  display: "flex",
  gap: "0.5rem",
  marginBottom: "2rem",
  width: "100%",
  background: "#F8F8F8",
  padding: "0.35rem",
  borderRadius: "8px",
  border: `1px solid ${colors.borderColor}`,
};

const modeToggleButton = {
  flex: 1,
  padding: "0.75rem",
  border: "none",
  background: "transparent",
  color: colors.textColor,
  fontSize: "0.95rem",
  fontWeight: 500,
  borderRadius: "6px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  opacity: 0.6,
};

const modeToggleButtonActive = {
  background: colors.background,
  color: colors.primary,
  fontWeight: 600,
  opacity: 1,
  boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
};

const formStyle = {
  display: "grid",
  gap: "1.25rem",
  width: "100%",
  marginBottom: "1.5rem",
};

const fieldGroup = {
  display: "grid",
  gap: "0.5rem",
};

const labelStyle = {
  fontSize: "0.85rem",
  fontWeight: 600,
  color: colors.textColor,
  marginBottom: "0.25rem",
};

const inputStyle = {
  width: "100%",
  background: colors.background,
  border: `2px solid ${colors.borderColor}`,
  borderRadius: "8px",
  padding: "0.9rem 1rem",
  color: colors.textColor,
  fontSize: "0.95rem",
  outline: "none",
  transition: "all 0.2s ease",
  fontFamily: '"Roboto", sans-serif',
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  border: "none",
  borderRadius: "8px",
  padding: "1rem",
  background: `linear-gradient(135deg, ${colors.buttonGradientStart}, ${colors.buttonGradientEnd})`,
  color: colors.buttonText,
  fontWeight: 600,
  fontSize: "1rem",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: `0 4px 12px ${colors.primary}40`,
  fontFamily: '"Roboto", sans-serif',
};

const statusStyle = {
  width: "100%",
  textAlign: "center",
  fontSize: "0.9rem",
  padding: "0.85rem",
  background: "#F8F8F8",
  border: `1px solid ${colors.borderColor}`,
  borderRadius: "8px",
  lineHeight: 1.5,
  color: colors.textColor,
  marginBottom: "1rem",
};

const footerStyle = {
  textAlign: "center",
  color: colors.textColor,
  fontSize: "0.85rem",
  marginTop: "1.5rem",
  width: "100%",
  borderTop: `1px solid ${colors.borderColor}`,
  paddingTop: "1.5rem",
};

const backLinkStyle = {
  marginTop: "1rem",
  fontSize: "0.9rem",
  color: colors.textColor,
  textDecoration: "none",
  opacity: 0.6,
  transition: "all 0.2s ease",
  fontWeight: 500,
};
