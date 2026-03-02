import { useState } from "react";
import { forgotPassword } from "./api/auth.js";
import PublicNav from "./PublicNav";
import colors from "./theme";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) {
      setStatusType("error");
      setStatus("Please enter your email address");
      return;
    }

    setLoading(true);
    setStatus("Sending reset link...");
    setStatusType("info");

    try {
      const data = await forgotPassword(email);
      setSent(true);
      setStatusType("success");
      setStatus(data.message);
    } catch (err) {
      setStatusType("error");
      setStatus(err.message || "Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div style={pageStyle}>
      <PublicNav showLoginButton={false} />

      <div style={screenStyle}>
        <div style={containerStyle}>
          <h1 style={titleStyle}>Reset Password</h1>
          <p style={subtitleStyle}>
            Enter your email and we'll send you a link to reset your password.
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} style={formStyle}>
              <div style={fieldGroup}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle}
                  disabled={loading}
                  required
                />
              </div>
              <button style={buttonStyle} disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          ) : null}

          {status && (
            <div style={statusStyle(statusType)}>{status}</div>
          )}

          <a href="/login" style={backLinkStyle}>← Back to Login</a>
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
  lineHeight: 1.5,
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
