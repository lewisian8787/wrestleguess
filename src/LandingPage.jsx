import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getGlobalLeaderboard } from "./api/users.js";
import colors from './theme';
import PublicNav from './PublicNav';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function brandColor(brand) {
  if (brand === "WWE") return colors.accent;
  if (brand === "AEW") return colors.primary;
  return colors.textColor;
}

const steps = [
  {
    title: "Pick Your Winners",
    desc: "Before each event locks, submit your predictions for every match on the card.",
  },
  {
    title: "Watch It Play Out",
    desc: "Tune in and see how your picks hold up as the action unfolds live.",
  },
  {
    title: "Earn Points & Climb",
    desc: "Score points for every correct pick and rise through the global leaderboard.",
  },
];

const medalColors = [
  { background: "#FFD700", color: "#7A5C00" },
  { background: "#C0C0C0", color: "#444" },
  { background: "#CD7F32", color: "#fff" },
];

export default function LandingPage() {
  const [topPlayers, setTopPlayers] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    getGlobalLeaderboard()
      .then(({ leaderboard, season }) => {
        setTopPlayers(leaderboard.slice(0, 5));
        setUpcomingEvents(season?.upcoming || []);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={pageStyle}>
      <PublicNav />

      {/* ── Hero ── */}
      <section style={heroStyle}>
        <div style={heroContentStyle}>
          <h1 style={heroHeadlineStyle}>
            Think you know wrestling?<br />Prove it.
          </h1>
          <p style={heroSublineStyle}>
            Pick winners before every event. Earn points. Compete on the global leaderboard.
          </p>
          <div style={heroCTARowStyle}>
            <a href="/login" style={primaryCTAStyle}>Join the Competition</a>
            <Link to="/leaderboard" style={secondaryCTAStyle}>View Leaderboard →</Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={howItWorksStyle}>
        <div style={sectionContainerStyle}>
          <h2 style={sectionHeadingStyle}>How It Works</h2>
          <div style={stepsRowStyle}>
            {steps.map((step, i) => (
              <div key={i} style={stepCardStyle}>
                <div style={stepNumberStyle}>{i + 1}</div>
                <h3 style={stepTitleStyle}>{step.title}</h3>
                <p style={stepDescStyle}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upcoming Events ── */}
      {upcomingEvents.length > 0 && (
        <section style={upcomingStyle}>
          <div style={sectionContainerStyle}>
            <h2 style={sectionHeadingStyle}>What's Coming Up</h2>
            <p style={sectionSubStyle}>Sign up and get your picks in before they lock.</p>
            <div style={eventsRowStyle}>
              {upcomingEvents.map(evt => (
                <Link key={evt.id} to={`/event/${evt.id}`} style={eventCardStyle(evt.brand)}>
                  <span style={{ ...brandTagStyle, color: brandColor(evt.brand) }}>{evt.brand}</span>
                  <span style={eventNameStyle}>{evt.name}</span>
                  <span style={eventDateStyle}>{formatDate(evt.date)}</span>
                  <span style={picksCTAStyle}>Make your picks →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Leaderboard Preview ── */}
      {topPlayers.length > 0 && (
        <section style={leaderboardSectionStyle}>
          <div style={sectionContainerStyle}>
            <h2 style={{ ...sectionHeadingStyle, color: "#fff" }}>Global Rankings</h2>
            <p style={{ ...sectionSubStyle, color: "rgba(255,255,255,0.55)" }}>
              Season 1 is live. Where will you finish?
            </p>
            <div style={previewTableStyle}>
              {topPlayers.map((player, i) => (
                <div key={player.userId} style={previewRowStyle}>
                  <span style={i < 3
                    ? { ...rankBadgeBase, ...medalColors[i] }
                    : plainRankStyle
                  }>
                    #{i + 1}
                  </span>
                  <span style={previewNameStyle}>{player.displayName}</span>
                  <span style={previewPointsStyle}>{Math.round(player.totalScore)} pts</span>
                </div>
              ))}
            </div>
            <Link to="/leaderboard" style={viewAllLinkStyle}>See the full leaderboard →</Link>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer style={footerStyle}>
        <div style={footerContainerStyle}>
          <p style={copyrightStyle}>© 2026 WrestleGuess. All rights reserved.</p>
          <div style={footerLinksStyle}>
            <Link to="/leaderboard" style={footerLinkStyle}>Leaderboard</Link>
            <Link to="/how-to-play" style={footerLinkStyle}>How to Play</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────── STYLES ─────────── */

const pageStyle = {
  minHeight: "100vh",
  background: colors.background,
  display: "flex",
  flexDirection: "column",
  fontFamily: '"Roboto", sans-serif',
};

/* Hero */

const heroStyle = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4rem 1.5rem 5rem",
  background: colors.background,
};

const heroContentStyle = {
  textAlign: "center",
  maxWidth: "680px",
  width: "100%",
};


const heroHeadlineStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "clamp(2.4rem, 7vw, 4rem)",
  color: colors.textColor,
  lineHeight: 1.1,
  margin: "0 0 1.25rem",
  letterSpacing: "0.02em",
};

const heroSublineStyle = {
  fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
  color: colors.textColor,
  opacity: 0.7,
  lineHeight: 1.6,
  margin: "0 auto 2.5rem",
  maxWidth: "520px",
};

const heroCTARowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: "1.25rem",
};

const primaryCTAStyle = {
  display: "inline-block",
  textDecoration: "none",
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  background: `linear-gradient(135deg, ${colors.buttonGradientStart}, ${colors.buttonGradientEnd})`,
  color: colors.buttonText,
  fontSize: "1.4rem",
  padding: "1rem 2.75rem",
  borderRadius: "8px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  boxShadow: `0 8px 24px ${colors.primary}45`,
};

const secondaryCTAStyle = {
  fontSize: "1rem",
  fontWeight: 600,
  color: colors.accent,
  textDecoration: "none",
  opacity: 0.85,
};

/* How It Works */

const howItWorksStyle = {
  background: "#F4F4F4",
  padding: "4rem 1.5rem",
};

const sectionContainerStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
};

const sectionHeadingStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
  color: colors.textColor,
  textAlign: "center",
  margin: "0 0 0.5rem",
  letterSpacing: "0.04em",
};

const sectionSubStyle = {
  textAlign: "center",
  fontSize: "1rem",
  color: colors.textColor,
  opacity: 0.6,
  margin: "0 0 2.5rem",
};

const stepsRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "1.25rem",
  justifyContent: "center",
};

const stepCardStyle = {
  flex: "1 1 220px",
  maxWidth: "320px",
  background: "#fff",
  borderRadius: "12px",
  border: `1px solid ${colors.borderColor}`,
  padding: "2rem 1.75rem",
  textAlign: "center",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const stepNumberStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  background: colors.primary,
  color: "#fff",
  fontFamily: '"Bebas Neue", sans-serif',
  fontSize: "1.4rem",
  marginBottom: "1rem",
};

const stepTitleStyle = {
  fontFamily: '"Bebas Neue", sans-serif',
  fontSize: "1.25rem",
  color: colors.textColor,
  letterSpacing: "0.05em",
  margin: "0 0 0.6rem",
};

const stepDescStyle = {
  fontSize: "0.95rem",
  color: colors.textColor,
  opacity: 0.65,
  lineHeight: 1.6,
  margin: 0,
};

/* Upcoming Events */

const upcomingStyle = {
  background: colors.background,
  padding: "4rem 1.5rem",
};

const eventsRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "1.25rem",
  justifyContent: "center",
  marginTop: "2.5rem",
};

function eventCardStyle(brand) {
  return {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    padding: "1.5rem 1.75rem",
    background: "#fff",
    borderRadius: "12px",
    border: `1px solid ${colors.borderColor}`,
    borderTop: `3px solid ${brandColor(brand)}`,
    textDecoration: "none",
    flex: "1 1 240px",
    maxWidth: "360px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  };
}

const brandTagStyle = {
  fontSize: "0.7rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
};

const eventNameStyle = {
  fontFamily: '"Bebas Neue", sans-serif',
  fontSize: "1.4rem",
  color: colors.textColor,
  letterSpacing: "0.04em",
  lineHeight: 1.2,
};

const eventDateStyle = {
  fontSize: "0.85rem",
  color: colors.textColor,
  opacity: 0.5,
};

const picksCTAStyle = {
  fontSize: "0.85rem",
  fontWeight: 600,
  color: colors.primary,
  marginTop: "0.5rem",
};

/* Leaderboard Preview */

const leaderboardSectionStyle = {
  background: colors.highlight,
  padding: "4rem 1.5rem",
};

const previewTableStyle = {
  maxWidth: "560px",
  margin: "2.5rem auto 0",
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem",
};

const previewRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  background: "rgba(255,255,255,0.06)",
  borderRadius: "10px",
  padding: "0.9rem 1.25rem",
  border: "1px solid rgba(255,255,255,0.08)",
};

const rankBadgeBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  fontSize: "0.72rem",
  fontWeight: 800,
  flexShrink: 0,
};

const plainRankStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
  flexShrink: 0,
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "rgba(255,255,255,0.35)",
};

const previewNameStyle = {
  flex: 1,
  fontSize: "1rem",
  fontWeight: 600,
  color: "#fff",
};

const previewPointsStyle = {
  fontSize: "0.95rem",
  fontWeight: 700,
  color: colors.primary,
  whiteSpace: "nowrap",
};

const viewAllLinkStyle = {
  display: "block",
  textAlign: "center",
  marginTop: "1.75rem",
  fontSize: "0.95rem",
  fontWeight: 600,
  color: colors.primary,
  textDecoration: "none",
  opacity: 0.9,
};

/* Footer */

const footerStyle = {
  borderTop: `1px solid ${colors.borderColor}`,
  background: colors.background,
  padding: "2rem 1.5rem",
};

const footerContainerStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "1rem",
};

const copyrightStyle = {
  fontSize: "0.85rem",
  color: colors.textColor,
  opacity: 0.5,
  margin: 0,
};

const footerLinksStyle = {
  display: "flex",
  gap: "1.5rem",
};

const footerLinkStyle = {
  fontSize: "0.85rem",
  color: colors.textColor,
  opacity: 0.55,
  textDecoration: "none",
};
