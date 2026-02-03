import { useState, useEffect } from "react";
import { getGlobalLeaderboard } from "./api/users.js";
import colors from "./theme";
import small_logo from "./assets/images/small_logo.png";

export default function GlobalLeaderboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    setLoading(true);
    try {
      const leaderboardData = await getGlobalLeaderboard();
      setLeaderboard(leaderboardData || []);
    } catch (err) {
      console.error("Error loading leaderboard:", err);
    }
    setLoading(false);
  }

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
          <h1 style={titleStyle}>Global Leaderboard</h1>
          <p style={subtitleStyle}>Top players across all leagues worldwide</p>

          {loading ? (
            <div style={loadingStyle}>Loading leaderboard...</div>
          ) : leaderboard.length === 0 ? (
            <div style={emptyStateStyle}>
              <p>No players on the leaderboard yet.</p>
              <p style={{ marginTop: "1rem", opacity: 0.7 }}>Be the first to join and make predictions!</p>
            </div>
          ) : (
            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeaderRowStyle}>
                    <th style={{ ...tableHeaderCellStyle, width: "80px" }}>Rank</th>
                    <th style={tableHeaderCellStyle}>Player</th>
                    <th style={{ ...tableHeaderCellStyle, textAlign: "center" }}>Leagues</th>
                    <th style={{ ...tableHeaderCellStyle, textAlign: "right" }}>Total Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((player, index) => (
                    <tr key={index} style={tableRowStyle}>
                      <td style={rankCellStyle}>
                        {index + 1 <= 3 ? (
                          <span style={{ ...medalStyle, ...(index === 0 ? goldMedalStyle : index === 1 ? silverMedalStyle : bronzeMedalStyle) }}>
                            #{index + 1}
                          </span>
                        ) : (
                          <span style={regularRankStyle}>#{index + 1}</span>
                        )}
                      </td>
                      <td style={nameCellStyle}>{player.displayName}</td>
                      <td style={{ ...tableCellStyle, textAlign: "center" }}>{player.leagues}</td>
                      <td style={{ ...pointsCellStyle, textAlign: "right" }}>
                        {Math.round(player.totalScore)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
  maxWidth: "1200px",
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

const loadingStyle = {
  textAlign: "center",
  padding: "4rem 2rem",
  fontSize: "1.1rem",
  color: colors.textColor,
  opacity: 0.6,
};

const emptyStateStyle = {
  textAlign: "center",
  padding: "4rem 2rem",
  fontSize: "1.1rem",
  color: colors.textColor,
  background: colors.background,
  borderRadius: "12px",
  border: `1px solid ${colors.borderColor}`,
};

const tableContainerStyle = {
  background: colors.background,
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  border: `1px solid ${colors.borderColor}`,
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "600px",
};

const tableHeaderRowStyle = {
  borderBottom: `2px solid ${colors.borderColor}`,
};

const tableHeaderCellStyle = {
  padding: "1.2rem 1.5rem",
  textAlign: "left",
  fontSize: "0.85rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: colors.textColor,
  opacity: 0.7,
};

const tableRowStyle = {
  borderBottom: `1px solid ${colors.borderColor}`,
  transition: "background 0.2s ease",
};

const tableCellStyle = {
  padding: "1.2rem 1.5rem",
  fontSize: "1rem",
  color: colors.textColor,
};

const rankCellStyle = {
  ...tableCellStyle,
  fontWeight: 700,
};

const medalStyle = {
  display: "inline-block",
  padding: "0.4rem 0.8rem",
  borderRadius: "6px",
  fontSize: "0.9rem",
  fontWeight: 700,
};

const goldMedalStyle = {
  background: "#FFD700",
  color: "#000",
};

const silverMedalStyle = {
  background: "#C0C0C0",
  color: "#000",
};

const bronzeMedalStyle = {
  background: "#CD7F32",
  color: "#fff",
};

const regularRankStyle = {
  opacity: 0.6,
};

const nameCellStyle = {
  ...tableCellStyle,
  fontWeight: 600,
};

const pointsCellStyle = {
  ...tableCellStyle,
  fontWeight: 700,
  color: colors.primary,
};
