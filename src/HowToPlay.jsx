import { useState } from "react";
import colors from "./theme";
import small_logo from "./assets/images/small_logo.png";

export default function HowToPlay() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={pageStyle}>
      {/* Navigation */}
      <nav style={navStyle}>
        <div style={navContainerStyle}>
          <a href="/" style={logoLinkStyle}>
            <img src={small_logo} alt="WrestleGuess" style={smallLogoStyle} />
          </a>

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
            <a href="/login" style={signupButtonStyle}>Sign Up</a>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} style={burgerButtonStyle} className="burger-menu">
            <div style={burgerIconStyle}>
              <span style={burgerLineStyle} />
              <span style={burgerLineStyle} />
              <span style={burgerLineStyle} />
            </div>
          </button>

          {menuOpen && (
            <div style={mobileMenuStyle}>
              <a href="/how-to-play" style={mobileMenuLinkStyle}>How to Play</a>
              <a href="/leaderboard" style={mobileMenuLinkStyle}>Leaderboard</a>
              <a href="/login" style={mobileMenuLinkStyle}>Login</a>
              <a href="/login" style={mobileSignupButtonStyle}>Sign Up</a>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main style={mainStyle}>
        <div style={containerStyle}>
          <h1 style={titleStyle}>How to Play</h1>
          <p style={subtitleStyle}>Master the art of wrestling match predictions</p>

          <div style={contentStyle}>
            {/* Step Cards */}
            <div style={stepCardStyle}>
              <div style={stepNumberStyle}>1</div>
              <h2 style={stepTitleStyle}>Create or Join a League</h2>
              <p style={stepDescriptionStyle}>
                Start by creating your own league or join an existing one with friends. Share the league code to invite others and compete together.
              </p>
            </div>

            <div style={stepCardStyle}>
              <div style={stepNumberStyle}>2</div>
              <h2 style={stepTitleStyle}>Make Your Predictions</h2>
              <p style={stepDescriptionStyle}>
                Before each wrestling event, predict the winners of every match. You have exactly 100 confidence points to allocate across all matches. The more confident you are in a prediction, the more points you can bet on it.
              </p>
            </div>

            <div style={stepCardStyle}>
              <div style={stepNumberStyle}>3</div>
              <h2 style={stepTitleStyle}>Earn Points</h2>
              <p style={stepDescriptionStyle}>
                When your predictions are correct, you earn points based on your confidence allocation and the match multiplier. The formula is simple: <strong>Points = Confidence × Multiplier</strong>
              </p>
            </div>

            <div style={stepCardStyle}>
              <div style={stepNumberStyle}>4</div>
              <h2 style={stepTitleStyle}>Climb the Rankings</h2>
              <p style={stepDescriptionStyle}>
                Accumulate points across multiple events to rise in your league standings and the global leaderboard. Consistency and smart predictions are key to becoming champion!
              </p>
            </div>

            {/* Key Rules Section */}
            <div style={rulesSectionStyle}>
              <h2 style={rulesTitleStyle}>Key Rules</h2>
              <ul style={rulesListStyle}>
                <li style={ruleItemStyle}>
                  <strong>100 Point Budget:</strong> You must allocate exactly 100 confidence points across all matches in an event
                </li>
                <li style={ruleItemStyle}>
                  <strong>Match Multipliers:</strong> Title matches and main events often have higher multipliers (e.g., 1.5x or 2x)
                </li>
                <li style={ruleItemStyle}>
                  <strong>Wrong Predictions:</strong> If you predict incorrectly, you earn 0 points for that match
                </li>
                <li style={ruleItemStyle}>
                  <strong>Locked Picks:</strong> Once an event starts, your predictions are locked and cannot be changed
                </li>
              </ul>
            </div>

            {/* Example Section */}
            <div style={exampleSectionStyle}>
              <h2 style={exampleTitleStyle}>Example</h2>
              <p style={exampleTextStyle}>
                You have 100 points to allocate across 5 matches:
              </p>
              <div style={exampleTableStyle}>
                <div style={exampleRowStyle}>
                  <span style={exampleMatchStyle}>Match 1</span>
                  <span style={exampleConfidenceStyle}>30 points</span>
                  <span style={exampleMultiplierStyle}>1.0x</span>
                  <span style={exampleResultStyle}>✓ Correct = 30 points</span>
                </div>
                <div style={exampleRowStyle}>
                  <span style={exampleMatchStyle}>Match 2 (Title)</span>
                  <span style={exampleConfidenceStyle}>25 points</span>
                  <span style={exampleMultiplierStyle}>1.5x</span>
                  <span style={exampleResultStyle}>✓ Correct = 37.5 points</span>
                </div>
                <div style={exampleRowStyle}>
                  <span style={exampleMatchStyle}>Match 3</span>
                  <span style={exampleConfidenceStyle}>20 points</span>
                  <span style={exampleMultiplierStyle}>1.0x</span>
                  <span style={exampleResultStyle}>✗ Wrong = 0 points</span>
                </div>
                <div style={exampleRowStyle}>
                  <span style={exampleMatchStyle}>Match 4</span>
                  <span style={exampleConfidenceStyle}>15 points</span>
                  <span style={exampleMultiplierStyle}>1.0x</span>
                  <span style={exampleResultStyle}>✓ Correct = 15 points</span>
                </div>
                <div style={exampleRowStyle}>
                  <span style={exampleMatchStyle}>Match 5</span>
                  <span style={exampleConfidenceStyle}>10 points</span>
                  <span style={exampleMultiplierStyle}>1.0x</span>
                  <span style={exampleResultStyle}>✓ Correct = 10 points</span>
                </div>
              </div>
              <div style={exampleTotalStyle}>
                <strong>Total Earned:</strong> 92.5 points
              </div>
            </div>

            {/* CTA */}
            <div style={ctaSectionStyle}>
              <h2 style={ctaTitleStyle}>Ready to Start?</h2>
              <a href="/login" style={ctaButtonStyle} onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = `0 8px 20px ${colors.primary}60`;
              }} onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = `0 4px 12px ${colors.primary}40`;
              }}>
                Sign Up Now
              </a>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .burger-menu { display: flex !important; }
        }
        @media (min-width: 769px) {
          .burger-menu { display: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ---------- STYLES ---------- */

const pageStyle = {
  minHeight: "100vh",
  background: "#F8F8F8",
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
  fontSize: "1rem",
  color: colors.textColor,
  textDecoration: "none",
  padding: "0.5rem",
};

const mobileSignupButtonStyle = {
  fontSize: "1rem",
  color: colors.buttonText,
  textDecoration: "none",
  background: colors.primary,
  padding: "0.6rem 1rem",
  borderRadius: "6px",
  textAlign: "center",
};

const mainStyle = {
  padding: "3rem 2rem",
  maxWidth: "900px",
  margin: "0 auto",
};

const containerStyle = {
  width: "100%",
};

const titleStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "2.5rem",
  color: colors.primary,
  textAlign: "center",
  margin: "0 0 0.5rem 0",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const subtitleStyle = {
  fontSize: "1.1rem",
  color: colors.textColor,
  textAlign: "center",
  opacity: 0.7,
  marginBottom: "3rem",
};

const contentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
};

const stepCardStyle = {
  background: colors.background,
  padding: "2rem",
  borderRadius: "12px",
  border: `1px solid ${colors.borderColor}`,
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const stepNumberStyle = {
  width: "50px",
  height: "50px",
  borderRadius: "50%",
  background: colors.primary,
  color: colors.buttonText,
  fontSize: "1.5rem",
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "1rem",
};

const stepTitleStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "1.5rem",
  color: colors.textColor,
  margin: "0 0 0.75rem 0",
  letterSpacing: "0.03em",
};

const stepDescriptionStyle = {
  fontSize: "1rem",
  color: colors.textColor,
  lineHeight: 1.7,
  opacity: 0.85,
};

const rulesSectionStyle = {
  background: colors.background,
  padding: "2rem",
  borderRadius: "12px",
  border: `2px solid ${colors.primary}`,
  marginTop: "1rem",
};

const rulesTitleStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "1.5rem",
  color: colors.primary,
  margin: "0 0 1.5rem 0",
  letterSpacing: "0.03em",
};

const rulesListStyle = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const ruleItemStyle = {
  fontSize: "1rem",
  color: colors.textColor,
  lineHeight: 1.7,
  paddingLeft: "1.5rem",
  position: "relative",
};

const exampleSectionStyle = {
  background: colors.background,
  padding: "2rem",
  borderRadius: "12px",
  border: `1px solid ${colors.borderColor}`,
  marginTop: "1rem",
};

const exampleTitleStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "1.5rem",
  color: colors.textColor,
  margin: "0 0 1rem 0",
  letterSpacing: "0.03em",
};

const exampleTextStyle = {
  fontSize: "1rem",
  color: colors.textColor,
  marginBottom: "1.5rem",
};

const exampleTableStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  marginBottom: "1.5rem",
};

const exampleRowStyle = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr 2fr",
  gap: "1rem",
  padding: "0.75rem 1rem",
  background: "#F8F8F8",
  borderRadius: "6px",
  fontSize: "0.9rem",
  alignItems: "center",
};

const exampleMatchStyle = {
  fontWeight: 600,
  color: colors.textColor,
};

const exampleConfidenceStyle = {
  color: colors.primary,
  fontWeight: 600,
};

const exampleMultiplierStyle = {
  opacity: 0.7,
};

const exampleResultStyle = {
  fontWeight: 600,
};

const exampleTotalStyle = {
  fontSize: "1.2rem",
  color: colors.primary,
  fontWeight: 700,
  textAlign: "right",
  paddingTop: "1rem",
  borderTop: `2px solid ${colors.borderColor}`,
};

const ctaSectionStyle = {
  textAlign: "center",
  marginTop: "2rem",
  padding: "3rem 2rem",
  background: colors.background,
  borderRadius: "12px",
  border: `1px solid ${colors.borderColor}`,
};

const ctaTitleStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "2rem",
  color: colors.textColor,
  margin: "0 0 1.5rem 0",
  letterSpacing: "0.03em",
};

const ctaButtonStyle = {
  display: "inline-block",
  textDecoration: "none",
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  background: `linear-gradient(135deg, ${colors.buttonGradientStart}, ${colors.buttonGradientEnd})`,
  color: colors.buttonText,
  fontWeight: 700,
  fontSize: "1.3rem",
  padding: "1rem 2.5rem",
  borderRadius: "8px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  transition: "all 0.3s ease",
  boxShadow: `0 4px 12px ${colors.primary}40`,
  cursor: "pointer",
};
