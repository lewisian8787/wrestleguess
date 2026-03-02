import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "./api/auth.js";
import PublicNav from "./PublicNav";
import colors from "./theme";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) {
      setStatusType("error");
      setStatus("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setStatusType("error");
      setStatus("Passwords do not match");
      return;
    }

    setLoading(true);
    setStatus("Updating password...");
    setStatusType("info");

    try {
      await resetPassword(token, password);
      setDone(true);
      setStatusType("success");
      setStatus("Password updated successfully!");
    } catch (err) {
      setStatusType("error");
      setStatus(err.message || "Invalid or expired reset link.");
    }
    setLoading(false);
  }

  return (
    <div style={pageStyle}>
      <PublicNav showLoginButton={false} />

      <div style={screenStyle}>
        <div style={containerStyle}>
          <h1 style={titleStyle}>Set New Password</h1>
          <p style={subtitleStyle}>Enter your new password below.</p>

          {!done ? (
            <form onSubmit={handleSubmit} style={formStyle}>
              <div style={fieldGroup}>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={inputStyle}
                  disabled={loading}
                  required
                />
              </div>
              <div style={fieldGroup}>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Repeat your new password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  style={inputStyle}
                  disabled={loading}
                  required
                />
              </div>
              <button style={buttonStyle} disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          ) : (
            <a href="/login" style={loginButtonStyle}>Go to Login →</a>
          )}

          {status && (
            <div style={statusStyle(statusType)}>{status}</div>
          )}

          {!done && (
            <a href="/login" style={backLinkStyle}>← Back to Login</a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----- Styles ----- */
const pageStyle = {
  minHeight: "100vh",
  background: "#F8F8F8",
  fontFamily: '"Roboto", sans-serif',
  display: "flex",
  flexDirection: "column",
};

const screenStyle = {
  flex: 1,
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

const titleStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "2rem",
  color: colors.highlight,
  margin: "0 0 0.5rem 0",
  letterSpacing: "0.04em",
};

const subtitleStyle = {
  fontSize: "0.9rem",
  color: colors.textColor,
  opacity: 0.65,
  textAlign: "center",
  marginBottom: "2rem",
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
  fontFamily: '"Roboto", sans-serif',
};

const loginButtonStyle = {
  display: "block",
  width: "100%",
  border: "none",
  borderRadius: "8px",
  padding: "1rem",
  background: `linear-gradient(135deg, ${colors.buttonGradientStart}, ${colors.buttonGradientEnd})`,
  color: colors.buttonText,
  fontWeight: 600,
  fontSize: "1rem",
  textDecoration: "none",
  textAlign: "center",
  marginBottom: "1.5rem",
  boxSizing: "border-box",
};

function statusStyle(type) {
  const variants = {
    error:   { background: "#FFF0F0", border: "1px solid #F5C6C6", color: "#C0392B" },
    success: { background: "#F0FFF4", border: "1px solid #A8E6BC", color: "#1E7E34" },
    info:    { background: "#F8F8F8", border: `1px solid ${colors.borderColor}`, color: colors.textColor },
  };
  return {
    width: "100%",
    textAlign: "center",
    fontSize: "0.9rem",
    padding: "0.85rem",
    borderRadius: "8px",
    lineHeight: 1.5,
    marginBottom: "1rem",
    ...variants[type] ?? variants.info,
  };
}

const backLinkStyle = {
  marginTop: "0.5rem",
  fontSize: "0.9rem",
  color: colors.textColor,
  textDecoration: "none",
  opacity: 0.6,
  fontWeight: 500,
};
