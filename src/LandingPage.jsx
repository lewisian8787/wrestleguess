import colors from './theme';
import logo from './assets/images/main_logo.png';
import PublicNav from './PublicNav';

export default function LandingPage() {
  return (
    <div style={pageStyle}>
      <PublicNav />


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
