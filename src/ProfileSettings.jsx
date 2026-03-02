import { useState } from "react";
import { useAuth } from "./auth.jsx";
import { updateProfile, changePassword } from "./api/users.js";
import NavBar from "./NavBar";
import colors from "./theme";

export default function ProfileSettings() {
  const { user, setUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [nameStatus, setNameStatus] = useState("");
  const [nameStatusType, setNameStatusType] = useState("info");
  const [nameSaving, setNameSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwStatus, setPwStatus] = useState("");
  const [pwStatusType, setPwStatusType] = useState("info");
  const [pwSaving, setPwSaving] = useState(false);

  async function handleNameSave(e) {
    e.preventDefault();
    if (!displayName.trim()) {
      setNameStatusType("error");
      setNameStatus("Display name cannot be empty");
      return;
    }
    if (displayName.trim().length < 2 || displayName.trim().length > 50) {
      setNameStatusType("error");
      setNameStatus("Display name must be 2–50 characters");
      return;
    }

    setNameSaving(true);
    setNameStatus("Saving...");
    setNameStatusType("info");

    try {
      const data = await updateProfile(displayName.trim());
      setUser(data.user);
      setNameStatusType("success");
      setNameStatus("Display name updated!");
    } catch (err) {
      setNameStatusType("error");
      setNameStatus(err.message || "Failed to update display name");
    }
    setNameSaving(false);
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    if (!currentPassword) {
      setPwStatusType("error");
      setPwStatus("Current password is required");
      return;
    }
    if (newPassword.length < 6) {
      setPwStatusType("error");
      setPwStatus("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwStatusType("error");
      setPwStatus("New passwords do not match");
      return;
    }

    setPwSaving(true);
    setPwStatus("Updating...");
    setPwStatusType("info");

    try {
      await changePassword(currentPassword, newPassword);
      setPwStatusType("success");
      setPwStatus("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwStatusType("error");
      setPwStatus(err.message || "Failed to update password");
    }
    setPwSaving(false);
  }

  return (
    <div style={pageStyle}>
      <NavBar />

      <main style={mainStyle}>
        <h1 style={titleStyle}>Account Settings</h1>

        <div style={sectionsGridStyle}>
          {/* Display Name */}
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>Display Name</h2>
            <p style={cardDescStyle}>This is how other players see you on the leaderboard.</p>
            <form onSubmit={handleNameSave} style={formStyle}>
              <div style={fieldGroup}>
                <label style={labelStyle}>Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  style={inputStyle}
                  disabled={nameSaving}
                  maxLength={50}
                  required
                />
              </div>
              {nameStatus && <div style={statusStyle(nameStatusType)}>{nameStatus}</div>}
              <button style={saveButtonStyle} disabled={nameSaving}>
                {nameSaving ? "Saving..." : "Save Name"}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>Change Password</h2>
            <p style={cardDescStyle}>Choose a strong password at least 6 characters long.</p>
            <form onSubmit={handlePasswordSave} style={formStyle}>
              <div style={fieldGroup}>
                <label style={labelStyle}>Current Password</label>
                <input
                  type="password"
                  placeholder="Your current password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  style={inputStyle}
                  disabled={pwSaving}
                  required
                />
              </div>
              <div style={fieldGroup}>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={inputStyle}
                  disabled={pwSaving}
                  required
                />
              </div>
              <div style={fieldGroup}>
                <label style={labelStyle}>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                  disabled={pwSaving}
                  required
                />
              </div>
              {pwStatus && <div style={statusStyle(pwStatusType)}>{pwStatus}</div>}
              <button style={saveButtonStyle} disabled={pwSaving}>
                {pwSaving ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ----- Styles ----- */
const pageStyle = {
  minHeight: "100vh",
  background: "#F8F8F8",
  fontFamily: '"Roboto", sans-serif',
};

const mainStyle = {
  maxWidth: "900px",
  margin: "0 auto",
  padding: "3rem 1.5rem 4rem",
};

const titleStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "2.2rem",
  color: colors.highlight,
  margin: "0 0 2rem 0",
  letterSpacing: "0.03em",
};

const sectionsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "1.5rem",
  alignItems: "start",
};

const cardStyle = {
  background: colors.background,
  border: `1px solid ${colors.borderColor}`,
  borderRadius: "12px",
  padding: "2rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const cardTitleStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "1.4rem",
  color: colors.textColor,
  margin: "0 0 0.35rem 0",
  letterSpacing: "0.04em",
};

const cardDescStyle = {
  fontSize: "0.88rem",
  color: colors.textColor,
  opacity: 0.6,
  margin: "0 0 1.5rem 0",
  lineHeight: 1.5,
};

const formStyle = {
  display: "grid",
  gap: "1rem",
};

const fieldGroup = {
  display: "grid",
  gap: "0.4rem",
};

const labelStyle = {
  fontSize: "0.83rem",
  fontWeight: 600,
  color: colors.textColor,
};

const inputStyle = {
  width: "100%",
  background: colors.background,
  border: `1.5px solid ${colors.borderColor}`,
  borderRadius: "8px",
  padding: "0.8rem 1rem",
  color: colors.textColor,
  fontSize: "0.95rem",
  outline: "none",
  fontFamily: '"Roboto", sans-serif',
  boxSizing: "border-box",
};

const saveButtonStyle = {
  width: "100%",
  border: "none",
  borderRadius: "8px",
  padding: "0.85rem",
  background: `linear-gradient(135deg, ${colors.buttonGradientStart}, ${colors.buttonGradientEnd})`,
  color: colors.buttonText,
  fontWeight: 600,
  fontSize: "0.95rem",
  cursor: "pointer",
  fontFamily: '"Roboto", sans-serif',
  marginTop: "0.25rem",
};

function statusStyle(type) {
  const variants = {
    error:   { background: "#FFF0F0", border: "1px solid #F5C6C6", color: "#C0392B" },
    success: { background: "#F0FFF4", border: "1px solid #A8E6BC", color: "#1E7E34" },
    info:    { background: "#F8F8F8", border: `1px solid ${colors.borderColor}`, color: colors.textColor },
  };
  return {
    fontSize: "0.87rem",
    padding: "0.75rem",
    borderRadius: "8px",
    lineHeight: 1.5,
    ...variants[type] ?? variants.info,
  };
}
