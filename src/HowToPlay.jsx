import { useAuth } from "./auth.jsx";
import NavBar from "./NavBar";
import PublicNav from "./PublicNav";
import colors from "./theme";

export default function HowToPlay() {
  const { user } = useAuth();

  return (
    <div style={pageStyle}>
      {user ? <NavBar /> : <PublicNav />}

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
                {[
                  { label: "100 Point Budget", desc: "Allocate exactly 100 confidence points across all matches in an event" },
                  { label: "Match Multipliers", desc: "Title matches and main events often have higher multipliers (e.g. 1.5x or 2x)" },
                  { label: "Wrong Predictions", desc: "If you predict incorrectly, you earn 0 points for that match" },
                  { label: "Locked Picks", desc: "Once an event starts, your predictions are locked and cannot be changed" },
                ].map(({ label, desc }) => (
                  <li key={label} style={ruleItemStyle}>
                    <span style={ruleDotStyle} />
                    <div>
                      <strong>{label}:</strong> {desc}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Example Section */}
            <div style={exampleSectionStyle}>
              <h2 style={exampleTitleStyle}>Example</h2>
              <p style={exampleTextStyle}>
                You have 100 points to allocate across 5 matches:
              </p>
              <div style={exampleTableStyle}>
                {[
                  { match: "Match 1",        confidence: 30, multiplier: 1.0, correct: true },
                  { match: "Match 2 (Title)", confidence: 25, multiplier: 1.5, correct: true },
                  { match: "Match 3",        confidence: 20, multiplier: 1.0, correct: false },
                  { match: "Match 4",        confidence: 15, multiplier: 1.0, correct: true },
                  { match: "Match 5",        confidence: 10, multiplier: 1.0, correct: true },
                ].map(({ match, confidence, multiplier, correct }) => {
                  const earned = correct ? confidence * multiplier : 0;
                  return (
                    <div key={match} className="example-row" style={exampleRowStyle}>
                      <span className="ex-match" style={exampleMatchStyle}>{match}</span>
                      <span className="ex-formula" style={exampleFormulaStyle}>
                        {confidence} pts × {multiplier}x
                      </span>
                      <span
                        className="ex-result"
                        style={correct ? exampleCorrectStyle : exampleWrongStyle}
                      >
                        {correct ? `✓ ${earned} pts` : "✗ 0 pts"}
                      </span>
                    </div>
                  );
                })}
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
        @media (max-width: 600px) {
          .example-row {
            grid-template-columns: 1fr auto !important;
            gap: 0.4rem 0.75rem !important;
          }
          .ex-formula {
            grid-column: 1 / -1;
            font-size: 0.8rem !important;
            opacity: 0.65;
          }
          .ex-result {
            text-align: right;
          }
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
  display: "flex",
  gap: "0.75rem",
  alignItems: "flex-start",
};

const ruleDotStyle = {
  flexShrink: 0,
  marginTop: "0.55rem",
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: colors.primary,
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
  gridTemplateColumns: "2fr 1.5fr 1.5fr",
  gap: "0.5rem 1rem",
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

const exampleFormulaStyle = {
  color: colors.textColor,
  opacity: 0.75,
  fontSize: "0.85rem",
};

const exampleCorrectStyle = {
  fontWeight: 700,
  color: "#22a05a",
};

const exampleWrongStyle = {
  fontWeight: 700,
  color: "#e03535",
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
