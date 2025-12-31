import { useState } from 'react';
import colors from './theme';
import logo from './assets/images/main_logo.png';
import small_logo from './assets/images/small_logo.png';

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#FFFFFF",
        overflow: "auto",
        margin: 0,
      }}
    >
      {/* Navigation */}
      <nav
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "1.5rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 100,
        }}
      >
        {/* Small Logo - Top Left */}
        <a href="/" style={{ display: "flex", alignItems: "center" }}>
          <img
            src={small_logo}
            alt="WrestleGuess"
            style={{
              height: "40px",
              width: "auto",
            }}
          />
        </a>

        {/* Desktop Menu */}
        <div
          style={{
            display: "flex",
            gap: "2rem",
            alignItems: "center",
          }}
          className="desktop-menu"
        >
          <a
            href="/how-to-play"
            style={{
              fontFamily: '"Roboto", sans-serif',
              fontSize: "1rem",
              fontWeight: 500,
              color: colors.textColor,
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => e.target.style.color = colors.primary}
            onMouseLeave={(e) => e.target.style.color = colors.textColor}
          >
            How to Play
          </a>
          <a
            href="/leaderboard"
            style={{
              fontFamily: '"Roboto", sans-serif',
              fontSize: "1rem",
              fontWeight: 500,
              color: colors.textColor,
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => e.target.style.color = colors.primary}
            onMouseLeave={(e) => e.target.style.color = colors.textColor}
          >
            Global Leaderboard
          </a>
          <a
            href="/login"
            style={{
              fontFamily: '"Roboto", sans-serif',
              fontSize: "1rem",
              fontWeight: 500,
              color: colors.textColor,
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => e.target.style.color = colors.primary}
            onMouseLeave={(e) => e.target.style.color = colors.textColor}
          >
            Login
          </a>
          <a
            href="/signup"
            style={{
              fontFamily: '"Roboto", sans-serif',
              fontSize: "1rem",
              fontWeight: 600,
              color: colors.buttonText,
              textDecoration: "none",
              background: colors.primary,
              padding: "0.6rem 1.5rem",
              borderRadius: "6px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = colors.buttonGradientStart;
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = colors.primary;
              e.target.style.transform = "translateY(0)";
            }}
          >
            Sign Up
          </a>
        </div>

        {/* Mobile Burger Menu */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
          }}
          className="burger-menu"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <span style={{ width: "25px", height: "3px", background: colors.textColor, borderRadius: "2px", transition: "all 0.3s ease" }} />
            <span style={{ width: "25px", height: "3px", background: colors.textColor, borderRadius: "2px", transition: "all 0.3s ease" }} />
            <span style={{ width: "25px", height: "3px", background: colors.textColor, borderRadius: "2px", transition: "all 0.3s ease" }} />
          </div>
        </button>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div
            style={{
              position: "fixed",
              top: "80px",
              right: "1rem",
              background: "#FFFFFF",
              border: `2px solid ${colors.borderColor}`,
              borderRadius: "8px",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              zIndex: 99,
            }}
            className="mobile-menu-dropdown"
          >
            <a href="/how-to-play" style={{ fontFamily: '"Roboto", sans-serif', fontSize: "1rem", color: colors.textColor, textDecoration: "none", padding: "0.5rem" }}>How to Play</a>
            <a href="/leaderboard" style={{ fontFamily: '"Roboto", sans-serif', fontSize: "1rem", color: colors.textColor, textDecoration: "none", padding: "0.5rem" }}>Global Leaderboard</a>
            <a href="/login" style={{ fontFamily: '"Roboto", sans-serif', fontSize: "1rem", color: colors.textColor, textDecoration: "none", padding: "0.5rem" }}>Login</a>
            <a href="/signup" style={{ fontFamily: '"Roboto", sans-serif', fontSize: "1rem", color: colors.buttonText, textDecoration: "none", background: colors.primary, padding: "0.6rem 1rem", borderRadius: "6px", textAlign: "center" }}>Sign Up</a>
          </div>
        )}
      </nav>

      <style>
        {`
          @media (max-width: 768px) {
            .desktop-menu {
              display: none !important;
            }
            .burger-menu {
              display: block !important;
            }
          }
        `}
      </style>

      {/* Main Content */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "2rem",
          paddingTop: "10rem",
          paddingBottom: "4rem",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: "900px",
            width: "100%",
          }}
        >
          {/* Logo */}
          <img
            src={logo}
            alt="WrestleGuess"
            style={{
              maxWidth: "500px",
              width: "100%",
              height: "auto",
              marginBottom: "1.5rem",
            }}
          />

          {/* Tagline */}
          <p
            style={{
              fontFamily: '"Roboto", "Helvetica Neue", sans-serif',
              fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
              color: colors.textColor,
              opacity: 0.8,
              maxWidth: "650px",
              margin: "0 auto 1rem",
              lineHeight: 1.6,
            }}
          >
            Predict wrestling match outcomes. Compete with fans worldwide.
          </p>

          {/* Social Proof */}
          <p
            style={{
              fontFamily: '"Roboto", sans-serif',
              fontSize: "0.95rem",
              color: colors.primary,
              fontWeight: 600,
              marginBottom: "3rem",
            }}
          >
            Join thousands of wrestling fans
          </p>

          {/* Feature Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              marginBottom: "3rem",
              maxWidth: "800px",
              margin: "0 auto 3rem",
            }}
          >
            {[
              { title: "Live Scoring", description: "Real-time points as matches unfold" },
              { title: "Global Leaderboards", description: "Compete with fans worldwide" },
              { title: "Every PPV Event", description: "WWE, AEW, and more" },
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  background: "#FFFFFF",
                  border: `2px solid ${colors.borderColor}`,
                  borderRadius: "10px",
                  padding: "1.5rem 1rem",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.borderColor;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <h3
                  style={{
                    fontFamily: '"Bebas Neue", "Impact", sans-serif',
                    fontSize: "1.3rem",
                    color: colors.primary,
                    margin: "0 0 0.5rem 0",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontFamily: '"Roboto", sans-serif',
                    fontSize: "0.9rem",
                    color: colors.textColor,
                    opacity: 0.7,
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <a
            href="/home"
            style={{
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
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px) scale(1.05)";
              e.target.style.boxShadow = `0 12px 32px ${colors.primary}70`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = `0 8px 24px ${colors.primary}50`;
            }}
          >
            Start Guessing
          </a>

          {/* Trust Indicators */}
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "2rem",
              flexWrap: "wrap",
            }}
          >
            {["Free Forever", "No Betting", "Just For Fun"].map((text, i) => (
              <span
                key={i}
                style={{
                  fontFamily: '"Roboto", sans-serif',
                  fontSize: "0.9rem",
                  color: colors.textColor,
                  opacity: 0.6,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: colors.accent,
                  }}
                />
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "2rem",
          borderTop: `1px solid ${colors.borderColor}`,
          background: "#FFFFFF",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <p
            style={{
              fontFamily: '"Roboto", sans-serif',
              fontSize: "0.85rem",
              color: colors.textColor,
              opacity: 0.6,
              margin: 0,
            }}
          >
            © 2024 WrestleGuess. All rights reserved.
          </p>
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
            }}
          >
            <a
              href="/privacy"
              style={{
                fontFamily: '"Roboto", sans-serif',
                fontSize: "0.85rem",
                color: colors.textColor,
                opacity: 0.6,
                textDecoration: "none",
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => e.target.style.opacity = "1"}
              onMouseLeave={(e) => e.target.style.opacity = "0.6"}
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              style={{
                fontFamily: '"Roboto", sans-serif',
                fontSize: "0.85rem",
                color: colors.textColor,
                opacity: 0.6,
                textDecoration: "none",
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => e.target.style.opacity = "1"}
              onMouseLeave={(e) => e.target.style.opacity = "0.6"}
            >
              Terms of Service
            </a>
            <a
              href="/contact"
              style={{
                fontFamily: '"Roboto", sans-serif',
                fontSize: "0.85rem",
                color: colors.textColor,
                opacity: 0.6,
                textDecoration: "none",
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => e.target.style.opacity = "1"}
              onMouseLeave={(e) => e.target.style.opacity = "0.6"}
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}