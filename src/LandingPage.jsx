import { useState } from 'react';
import colors from './theme';
import logo from './assets/images/main_logo.png';
import small_logo from './assets/images/small_logo.png';

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={pageStyle}>
      {/* Navigation */}
      <nav style={navStyle}>
        <div style={navContainerStyle}>
          {/* Small Logo */}
          <a href="/" style={logoLinkStyle}>
            <img src={small_logo} alt="WrestleGuess" style={smallLogoStyle} />
          </a>

          {/* Desktop Navigation */}
          <div style={navLinksStyle} className="desktop-menu">
            <a href="/how-to-play" style={navLinkStyle} onMouseEnter={(e) => e.target.style.color = colors.primary} onMouseLeave={(e) => e.target.style.color = colors.textColor}>
              How to Play
            </a>
            <a href="/leaderboard" style={navLinkStyle} onMouseEnter={(e) => e.target.style.color = colors.primary} onMouseLeave={(e) => e.target.style.color = colors.textColor}>
              Leaderboard
            </a>
            <a href="/login" style={navLinkStyle} onMouseEnter={(e) => e.target.style.color = colors.primary} onMouseLeave={(e) => e.target.style.color = colors.textColor}>
              Login
            </a>
            <a href="/login" style={signupButtonStyle} onMouseEnter={(e) => {
              e.target.style.background = colors.buttonGradientEnd;
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = `0 6px 16px ${colors.primary}60`;
            }} onMouseLeave={(e) => {
              e.target.style.background = colors.primary;
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}>
              Sign Up
            </a>
          </div>

          {/* Mobile Burger Menu */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={burgerButtonStyle} className="burger-menu">
            <div style={burgerIconStyle}>
              <span style={burgerLineStyle} />
              <span style={burgerLineStyle} />
              <span style={burgerLineStyle} />
            </div>
          </button>

          {/* Mobile Menu Dropdown */}
          {menuOpen && (
            <div style={mobileMenuStyle} className="mobile-menu">
              <a href="/how-to-play" style={mobileMenuLinkStyle}>How to Play</a>
              <a href="/leaderboard" style={mobileMenuLinkStyle}>Leaderboard</a>
              <a href="/login" style={mobileMenuLinkStyle}>Login</a>
              <a href="/login" style={mobileSignupButtonStyle}>Sign Up</a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main style={heroStyle}>
        <div style={heroContentStyle}>
          {/* Main Logo */}
          <img src={logo} alt="WrestleGuess" style={mainLogoStyle} />

          {/* Tagline */}
          <p style={taglineStyle}>
            Predict wrestling match outcomes. Compete with fans worldwide.
          </p>

          {/* CTA Button */}
          <a href="/login" style={ctaButtonStyle} onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px) scale(1.02)";
            e.target.style.boxShadow = `0 12px 32px ${colors.primary}70`;
          }} onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0) scale(1)";
            e.target.style.boxShadow = `0 8px 24px ${colors.primary}50`;
          }}>
            Start Guessing
          </a>

          {/* Trust Indicators */}
          <div style={trustIndicatorsStyle}>
            <span style={trustItemStyle}>
              <span style={dotStyle} />
              Free Forever
            </span>
            <span style={trustItemStyle}>
              <span style={dotStyle} />
              No Betting
            </span>
            <span style={trustItemStyle}>
              <span style={dotStyle} />
              Just For Fun
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={footerStyle}>
        <div style={footerContainerStyle}>
          <p style={copyrightStyle}>© 2024 WrestleGuess. All rights reserved.</p>
          <div style={footerLinksStyle}>
            <a href="/privacy" style={footerLinkStyle} onMouseEnter={(e) => e.target.style.opacity = "1"} onMouseLeave={(e) => e.target.style.opacity = "0.6"}>
              Privacy Policy
            </a>
            <a href="/terms" style={footerLinkStyle} onMouseEnter={(e) => e.target.style.opacity = "1"} onMouseLeave={(e) => e.target.style.opacity = "0.6"}>
              Terms of Service
            </a>
            <a href="/contact" style={footerLinkStyle} onMouseEnter={(e) => e.target.style.opacity = "1"} onMouseLeave={(e) => e.target.style.opacity = "0.6"}>
              Contact
            </a>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .burger-menu {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .burger-menu {
            display: none !important;
          }
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ---------- STYLES ---------- */

const pageStyle = {
  minHeight: "100vh",
  background: colors.background,
  display: "flex",
  flexDirection: "column",
  fontFamily: '"Roboto", sans-serif',
};

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

const smallLogoStyle = {
  height: "40px",
  width: "auto",
};

const navLinksStyle = {
  display: "flex",
  alignItems: "center",
  gap: "2rem",
};

const navLinkStyle = {
  fontFamily: '"Roboto", sans-serif',
  fontSize: "1rem",
  fontWeight: 500,
  color: colors.textColor,
  textDecoration: "none",
  transition: "color 0.2s ease",
};

const signupButtonStyle = {
  fontFamily: '"Roboto", sans-serif',
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
  transition: "all 0.3s ease",
};

const mobileMenuStyle = {
  position: "absolute",
  top: "100%",
  right: "1rem",
  background: colors.background,
  border: `2px solid ${colors.borderColor}`,
  borderRadius: "8px",
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  minWidth: "200px",
  marginTop: "0.5rem",
};

const mobileMenuLinkStyle = {
  fontFamily: '"Roboto", sans-serif',
  fontSize: "1rem",
  color: colors.textColor,
  textDecoration: "none",
  padding: "0.5rem",
};

const mobileSignupButtonStyle = {
  fontFamily: '"Roboto", sans-serif',
  fontSize: "1rem",
  color: colors.buttonText,
  textDecoration: "none",
  background: colors.primary,
  padding: "0.6rem 1rem",
  borderRadius: "6px",
  textAlign: "center",
};

const heroStyle = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4rem 2rem",
  minHeight: "70vh",
};

const heroContentStyle = {
  textAlign: "center",
  maxWidth: "700px",
  width: "100%",
};

const mainLogoStyle = {
  maxWidth: "500px",
  width: "100%",
  height: "auto",
  marginBottom: "2rem",
};

const taglineStyle = {
  fontFamily: '"Roboto", "Helvetica Neue", sans-serif',
  fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
  color: colors.textColor,
  opacity: 0.8,
  maxWidth: "600px",
  margin: "0 auto 3rem",
  lineHeight: 1.6,
};

const ctaButtonStyle = {
  display: "inline-block",
  textDecoration: "none",
  fontFamily: '"Bebas Neue", "Impact", "Arial Black", sans-serif',
  background: `linear-gradient(135deg, ${colors.buttonGradientStart}, ${colors.buttonGradientEnd})`,
  color: colors.buttonText,
  fontWeight: 700,
  fontSize: "1.5rem",
  padding: "1.2rem 3rem",
  borderRadius: "8px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  transition: "all 0.3s ease",
  boxShadow: `0 8px 24px ${colors.primary}50`,
  border: "none",
  cursor: "pointer",
};

const trustIndicatorsStyle = {
  marginTop: "2.5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "2rem",
  flexWrap: "wrap",
};

const trustItemStyle = {
  fontFamily: '"Roboto", sans-serif',
  fontSize: "0.9rem",
  color: colors.textColor,
  opacity: 0.6,
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const dotStyle = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  background: colors.accent,
};

const footerStyle = {
  borderTop: `1px solid ${colors.borderColor}`,
  background: colors.background,
  padding: "2rem",
};

const footerContainerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "1rem",
};

const copyrightStyle = {
  fontFamily: '"Roboto", sans-serif',
  fontSize: "0.85rem",
  color: colors.textColor,
  opacity: 0.6,
  margin: 0,
};

const footerLinksStyle = {
  display: "flex",
  gap: "1.5rem",
};

const footerLinkStyle = {
  fontFamily: '"Roboto", sans-serif',
  fontSize: "0.85rem",
  color: colors.textColor,
  opacity: 0.6,
  textDecoration: "none",
  transition: "opacity 0.2s ease",
};
