import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function NavBar() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setDisplayName(userSnap.data().displayName || "User");
        }
      }
    })();
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  return (
    <nav style={navStyle}>
      <div style={navContainerStyle}>
        {/* Logo/Title */}
        <a href="/home" style={logoStyle}>
          WrestleGuess
        </a>

        {/* Desktop Navigation */}
        <div style={navLinksStyle} className="nav-links-desktop">
          <a href="/home" style={navLinkStyle}>
            Leagues
          </a>
          <a href="/events" style={navLinkStyle}>
            Events
          </a>
          <div style={userMenuStyle}>
            <span style={userNameStyle}>{displayName}</span>
            <button onClick={handleLogout} style={logoutButtonStyle}>
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
          <div style={mobileUserInfoStyle}>{displayName}</div>
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
  background: "#0b0b10",
  borderBottom: "1px solid #2f2f44",
  zIndex: 1000,
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

const navContainerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0.75rem 1.5rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const logoStyle = {
  fontSize: "1.25rem",
  fontWeight: 700,
  color: "#ffd600",
  textDecoration: "none",
  letterSpacing: "0.02em",
};

const navLinksStyle = {
  display: "flex",
  alignItems: "center",
  gap: "2rem",
};

const navLinkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "0.95rem",
  fontWeight: 500,
  opacity: 0.8,
  transition: "opacity 0.2s",
};

const userMenuStyle = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  paddingLeft: "1rem",
  borderLeft: "1px solid #2f2f44",
};

const userNameStyle = {
  fontSize: "0.9rem",
  color: "white",
  opacity: 0.7,
};

const logoutButtonStyle = {
  appearance: "none",
  border: "1px solid #3a3a55",
  borderRadius: "0.4rem",
  padding: "0.5rem 1rem",
  background: "#1a1a22",
  color: "white",
  fontSize: "0.85rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
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
  gap: "4px",
};

const burgerLineStyle = {
  width: "24px",
  height: "2px",
  background: "white",
  borderRadius: "2px",
};

const mobileMenuStyle = {
  background: "#1a1a22",
  borderTop: "1px solid #2f2f44",
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const mobileMenuLinkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "0.95rem",
  fontWeight: 500,
  padding: "0.75rem",
  borderRadius: "0.4rem",
  background: "#0f0f16",
  textAlign: "center",
};

const mobileUserInfoStyle = {
  fontSize: "0.85rem",
  color: "white",
  opacity: 0.6,
  textAlign: "center",
  padding: "0.5rem",
};

const mobileLogoutButtonStyle = {
  appearance: "none",
  border: "1px solid #3a3a55",
  borderRadius: "0.4rem",
  padding: "0.75rem",
  background: "#262636",
  color: "white",
  fontSize: "0.9rem",
  fontWeight: 500,
  cursor: "pointer",
  textAlign: "center",
};
