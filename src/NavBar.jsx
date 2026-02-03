import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth";
import colors from "./theme";
import small_logo from "./assets/images/small_logo.png";

export default function NavBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = user?.displayName || "User";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav style={navStyle}>
      <div style={navContainerStyle}>
        {/* Logo */}
        <a href="/home" style={logoLinkStyle}>
          <img
            src={small_logo}
            alt="WrestleGuess"
            style={logoImageStyle}
          />
        </a>

        {/* Desktop Navigation */}
        <div style={navLinksStyle} className="nav-links-desktop">
          <a
            href="/home"
            style={navLinkStyle}
            onMouseEnter={(e) => e.target.style.color = colors.primary}
            onMouseLeave={(e) => e.target.style.color = colors.textColor}
          >
            Leagues
          </a>
          <a
            href="/events"
            style={navLinkStyle}
            onMouseEnter={(e) => e.target.style.color = colors.primary}
            onMouseLeave={(e) => e.target.style.color = colors.textColor}
          >
            Events
          </a>
          <div style={userMenuStyle}>
            <span style={userNameStyle}>{displayName}</span>
            <button
              onClick={handleLogout}
              style={logoutButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.background = colors.primary;
                e.target.style.color = colors.buttonText;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = colors.textColor;
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={mobileMenuButtonStyle}
          className="mobile-menu-button"
        >
          <div style={burgerIconStyle}>
            <span style={burgerLineStyle} />
            <span style={burgerLineStyle} />
            <span style={burgerLineStyle} />
          </div>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div style={mobileMenuStyle} className="mobile-menu">
          <a href="/home" style={mobileMenuLinkStyle}>
            Leagues
          </a>
          <a href="/events" style={mobileMenuLinkStyle}>
            Events
          </a>
          <div style={mobileUserInfoStyle}>
            <span style={{ opacity: 0.6 }}>Logged in as</span>
            <br />
            <strong>{displayName}</strong>
          </div>
          <button onClick={handleLogout} style={mobileLogoutButtonStyle}>
            Logout
          </button>
        </div>
      )}

      <style>
        {`
          @media (max-width: 768px) {
            .nav-links-desktop {
              display: none !important;
            }
            .mobile-menu-button {
              display: flex !important;
            }
          }
          @media (min-width: 769px) {
            .mobile-menu-button {
              display: none !important;
            }
          }
        `}
      </style>
    </nav>
  );
}

/* ----- Styles ----- */
const navStyle = {
  position: "sticky",
  top: 0,
  left: 0,
  right: 0,
  background: colors.background,
  borderBottom: `1px solid ${colors.borderColor}`,
  zIndex: 1000,
  fontFamily: '"Roboto", sans-serif',
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
};

const navContainerStyle = {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "1rem 2rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const logoLinkStyle = {
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
};

const logoImageStyle = {
  height: "40px",
  width: "auto",
};

const navLinksStyle = {
  display: "flex",
  alignItems: "center",
  gap: "2.5rem",
};

const navLinkStyle = {
  color: colors.textColor,
  textDecoration: "none",
  fontSize: "1rem",
  fontWeight: 500,
  transition: "color 0.2s ease",
};

const userMenuStyle = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  paddingLeft: "2rem",
  borderLeft: `1px solid ${colors.borderColor}`,
};

const userNameStyle = {
  fontSize: "0.95rem",
  color: colors.textColor,
  fontWeight: 500,
};

const logoutButtonStyle = {
  appearance: "none",
  border: `1px solid ${colors.borderColor}`,
  borderRadius: "6px",
  padding: "0.5rem 1.2rem",
  background: "transparent",
  color: colors.textColor,
  fontSize: "0.9rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const mobileMenuButtonStyle = {
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
  transition: "all 0.3s ease",
};

const mobileMenuStyle = {
  background: colors.background,
  borderTop: `1px solid ${colors.borderColor}`,
  padding: "1rem 1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
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
  transition: "all 0.2s ease",
  border: `1px solid ${colors.borderColor}`,
};

const mobileUserInfoStyle = {
  fontSize: "0.9rem",
  color: colors.textColor,
  textAlign: "center",
  padding: "0.75rem",
  lineHeight: 1.6,
};

const mobileLogoutButtonStyle = {
  appearance: "none",
  border: `2px solid ${colors.primary}`,
  borderRadius: "6px",
  padding: "0.85rem",
  background: "transparent",
  color: colors.primary,
  fontSize: "0.95rem",
  fontWeight: 600,
  cursor: "pointer",
  textAlign: "center",
  transition: "all 0.2s ease",
};
