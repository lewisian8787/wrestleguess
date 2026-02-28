import { useState } from "react";
import colors from "./theme";
import small_logo from "./assets/images/small_logo.png";

export default function PublicNav({ showLoginButton = true }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={navStyle}>
      <div style={navContainerStyle}>
        <a href="/" style={logoLinkStyle}>
          <img src={small_logo} alt="WrestleGuess" style={logoImgStyle} />
        </a>

        {/* Desktop links */}
        <div style={navLinksStyle} className="pub-nav-desktop">
          <a href="/how-to-play" style={navLinkStyle}
            onMouseEnter={(e) => e.target.style.color = colors.primary}
            onMouseLeave={(e) => e.target.style.color = colors.textColor}>
            How to Play
          </a>
          <a href="/rules" style={navLinkStyle}
            onMouseEnter={(e) => e.target.style.color = colors.primary}
            onMouseLeave={(e) => e.target.style.color = colors.textColor}>
            Rules
          </a>
          <a href="/leaderboard" style={navLinkStyle}
            onMouseEnter={(e) => e.target.style.color = colors.primary}
            onMouseLeave={(e) => e.target.style.color = colors.textColor}>
            Leaderboard
          </a>
          {showLoginButton && (
            <>
              <a href="/login" style={navLinkStyle}
                onMouseEnter={(e) => e.target.style.color = colors.primary}
                onMouseLeave={(e) => e.target.style.color = colors.textColor}>
                Login
              </a>
              <a href="/login" style={signupButtonStyle}
                onMouseEnter={(e) => {
                  e.target.style.background = colors.buttonGradientEnd;
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = `0 6px 16px ${colors.primary}60`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = colors.primary;
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}>
                Sign Up
              </a>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={burgerButtonStyle}
          className="pub-nav-burger"
        >
          <div style={burgerIconStyle}>
            <span style={burgerLineStyle} />
            <span style={burgerLineStyle} />
            <span style={burgerLineStyle} />
          </div>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={mobileMenuStyle}>
          <a href="/how-to-play" style={mobileMenuLinkStyle}>How to Play</a>
          <a href="/rules" style={mobileMenuLinkStyle}>Rules</a>
          <a href="/leaderboard" style={mobileMenuLinkStyle}>Leaderboard</a>
          {showLoginButton && (
            <>
              <a href="/login" style={mobileMenuLinkStyle}>Login</a>
              <a href="/login" style={mobileSignupButtonStyle}>Sign Up</a>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .pub-nav-desktop { display: none !important; }
          .pub-nav-burger  { display: flex !important; }
        }
        @media (min-width: 769px) {
          .pub-nav-burger  { display: none !important; }
        }
      `}</style>
    </nav>
  );
}

/* ---------- STYLES ---------- */

const navStyle = {
  background: colors.background,
  borderBottom: `1px solid ${colors.borderColor}`,
  position: "sticky",
  top: 0,
  zIndex: 1000,
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
};

const navContainerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "1rem 2rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  position: "relative",
};

const logoLinkStyle = {
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
};

const logoImgStyle = {
  height: "40px",
  width: "auto",
};

const navLinksStyle = {
  display: "flex",
  alignItems: "center",
  gap: "2rem",
};

const navLinkStyle = {
  fontSize: "1rem",
  fontWeight: 500,
  color: colors.textColor,
  textDecoration: "none",
  transition: "color 0.2s ease",
};

const signupButtonStyle = {
  fontSize: "0.95rem",
  fontWeight: 600,
  color: colors.buttonText,
  textDecoration: "none",
  background: colors.primary,
  padding: "0.6rem 1.5rem",
  borderRadius: "6px",
  transition: "all 0.2s ease",
};

const burgerButtonStyle = {
  display: "none",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "0.5rem",
};

const burgerIconStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
};

const burgerLineStyle = {
  width: "25px",
  height: "3px",
  background: colors.textColor,
  borderRadius: "2px",
};

const mobileMenuStyle = {
  background: colors.background,
  borderTop: `1px solid ${colors.borderColor}`,
  padding: "1rem 1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
};

const mobileMenuLinkStyle = {
  color: colors.textColor,
  textDecoration: "none",
  fontSize: "1rem",
  fontWeight: 500,
  padding: "0.85rem 1rem",
  borderRadius: "6px",
  background: "#F8F8F8",
  textAlign: "center",
  border: `1px solid ${colors.borderColor}`,
};

const mobileSignupButtonStyle = {
  fontSize: "1rem",
  color: colors.buttonText,
  textDecoration: "none",
  background: colors.primary,
  padding: "0.85rem 1rem",
  borderRadius: "6px",
  textAlign: "center",
  fontWeight: 600,
};
