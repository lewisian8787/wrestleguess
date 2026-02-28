import { useAuth } from "./auth.jsx";
import NavBar from "./NavBar";
import PublicNav from "./PublicNav";
import colors from "./theme";

export default function Rules() {
  const { user } = useAuth();

  return (
    <div style={pageStyle}>
      {user ? <NavBar /> : <PublicNav />}

      <main style={mainStyle}>
        <div style={containerStyle}>
          <h1 style={titleStyle}>Official Rules</h1>
          <p style={subtitleStyle}>How WrestleGuess works — the official rules</p>

          <div style={contentStyle}>

            {/* Match Outcomes */}
            <div style={sectionStyle}>
              <h2 style={sectionTitleStyle}>Match Outcomes</h2>
              <p style={sectionIntroStyle}>
                A win is a win. The following are all valid winning outcomes for prediction purposes:
              </p>
              <ul style={listStyle}>
                <li style={listItemStyle}><strong>Pinfall</strong> — standard 3-count pin</li>
                <li style={listItemStyle}><strong>Submission</strong> — opponent taps out or passes out</li>
                <li style={listItemStyle}><strong>Disqualification (DQ)</strong> — opponent is disqualified; the other competitor is awarded the win</li>
                <li style={listItemStyle}><strong>Countout</strong> — opponent fails to return to the ring in time</li>
                <li style={listItemStyle}><strong>Referee stoppage</strong> — match stopped due to injury or inability to continue</li>
                <li style={listItemStyle}><strong>Any other declared winner</strong> — including special stipulation finishes</li>
              </ul>
              <p style={noteStyle}>
                If you predicted the correct competitor and they are declared the winner by any means, your pick is correct.
              </p>
            </div>

            {/* Title Matches & DQ */}
            <div style={sectionStyle}>
              <h2 style={sectionTitleStyle}>Title Matches & DQ Finishes</h2>
              <p style={sectionIntroStyle}>
                In professional wrestling, a championship typically cannot change hands via disqualification. WrestleGuess handles this as follows:
              </p>
              <ul style={listStyle}>
                <li style={listItemStyle}>
                  If a <strong>title match ends by DQ or countout</strong>, the champion retains the belt — but the competitor who won the match by DQ is still the <strong>match winner</strong> for scoring purposes.
                </li>
                <li style={listItemStyle}>
                  Example: Challenger wins by DQ → challenger did not win the title, but if you picked the challenger to win, <strong>your pick is correct</strong>.
                </li>
              </ul>
            </div>

            {/* No Contest / Double DQ */}
            <div style={highlightSectionStyle}>
              <h2 style={sectionTitleStyle}>No Contest & Double DQ</h2>
              <p style={sectionIntroStyle}>
                In rare cases a match may have no declared winner:
              </p>
              <ul style={listStyle}>
                <li style={listItemStyle}><strong>No Contest</strong> — match is called off with no result</li>
                <li style={listItemStyle}><strong>Double Disqualification</strong> — both competitors are disqualified simultaneously</li>
                <li style={listItemStyle}><strong>Double Countout</strong> — neither competitor returns to the ring in time</li>
              </ul>
              <p style={noteStyle}>
                If a match ends in No Contest or Double DQ, <strong>all participants score 0 points</strong> for that match regardless of who they picked. Your confidence points are simply not awarded.
              </p>
            </div>

            {/* Pick Deadlines */}
            <div style={sectionStyle}>
              <h2 style={sectionTitleStyle}>Pick Deadlines</h2>
              <ul style={listStyle}>
                <li style={listItemStyle}>Picks are open once an event is published and close when the event is <strong>locked</strong>.</li>
                <li style={listItemStyle}>Events are locked by admins ahead of the show — typically close to bell time.</li>
                <li style={listItemStyle}>Once an event is locked, your predictions <strong>cannot be changed</strong>.</li>
                <li style={listItemStyle}>If you have not submitted picks before lockdown, you will score <strong>0 points</strong> for that event.</li>
              </ul>
            </div>

            {/* Data Source */}
            <div style={sectionStyle}>
              <h2 style={sectionTitleStyle}>Data & Results</h2>
              <p style={sectionIntroStyle}>
                WrestleGuess is a fan-made prediction game. All event and match data is entered manually by site administrators.
              </p>
              <ul style={listStyle}>
                <li style={listItemStyle}>Match results are sourced from publicly available reports and entered by admins as quickly as possible after an event concludes.</li>
                <li style={listItemStyle}>In the event of a data entry error affecting scores, admins reserve the right to correct and re-score an event.</li>
                <li style={listItemStyle}>WrestleGuess is not affiliated with, endorsed by, or connected to any wrestling promotion.</li>
              </ul>
            </div>

            {/* Scoring reminder */}
            <div style={ctaSectionStyle}>
              <p style={ctaTextStyle}>
                Want to understand the confidence points and scoring system?
              </p>
              <a href="/how-to-play" style={ctaButtonStyle}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = `0 8px 20px ${colors.primary}60`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = `0 4px 12px ${colors.primary}40`;
                }}
              >
                How to Play
              </a>
            </div>

          </div>
        </div>
      </main>
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

const sectionStyle = {
  background: colors.background,
  padding: "2rem",
  borderRadius: "12px",
  border: `1px solid ${colors.borderColor}`,
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const highlightSectionStyle = {
  background: colors.background,
  padding: "2rem",
  borderRadius: "12px",
  border: `2px solid ${colors.primary}`,
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const sectionTitleStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "1.5rem",
  color: colors.textColor,
  margin: "0 0 1rem 0",
  letterSpacing: "0.03em",
};

const sectionIntroStyle = {
  fontSize: "1rem",
  color: colors.textColor,
  lineHeight: 1.7,
  opacity: 0.85,
  marginBottom: "1rem",
};

const listStyle = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const listItemStyle = {
  fontSize: "1rem",
  color: colors.textColor,
  lineHeight: 1.7,
  paddingLeft: "1.25rem",
  borderLeft: `3px solid ${colors.borderColor}`,
};

const noteStyle = {
  fontSize: "0.95rem",
  color: colors.primary,
  fontWeight: 600,
  marginTop: "1.25rem",
  lineHeight: 1.6,
};

const ctaSectionStyle = {
  textAlign: "center",
  padding: "2.5rem 2rem",
  background: colors.background,
  borderRadius: "12px",
  border: `1px solid ${colors.borderColor}`,
};

const ctaTextStyle = {
  fontSize: "1rem",
  color: colors.textColor,
  opacity: 0.8,
  marginBottom: "1.5rem",
};

const ctaButtonStyle = {
  display: "inline-block",
  textDecoration: "none",
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  background: `linear-gradient(135deg, ${colors.buttonGradientStart}, ${colors.buttonGradientEnd})`,
  color: colors.buttonText,
  fontWeight: 700,
  fontSize: "1.2rem",
  padding: "0.9rem 2.5rem",
  borderRadius: "8px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  transition: "all 0.3s ease",
  boxShadow: `0 4px 12px ${colors.primary}40`,
  cursor: "pointer",
};
