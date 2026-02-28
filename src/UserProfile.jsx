import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";
import { getPublicUserProfile, getPublicUserHistory, getFollowing, followUser, unfollowUser } from "./api/users.js";
import NavBar from "./NavBar";
import PublicNav from "./PublicNav";
import colors from "./theme";

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followHover, setFollowHover] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  async function loadProfile() {
    setLoading(true);
    setNotFound(false);
    try {
      const requests = [
        getPublicUserProfile(userId),
        getPublicUserHistory(userId),
      ];
      if (user && user.id !== userId) {
        requests.push(getFollowing());
      }
      const [profileData, historyData, followingData] = await Promise.all(requests);
      setProfile(profileData);
      setHistory(historyData || []);
      if (followingData) {
        const followedIds = new Set(followingData.map(f => f.userId));
        setIsFollowingUser(followedIds.has(userId));
      }
    } catch (err) {
      if (err.message === "Player not found") {
        setNotFound(true);
      } else {
        console.error("Error loading profile:", err);
      }
    }
    setLoading(false);
  }

  async function handleFollow() {
    setFollowLoading(true);
    const wasFollowing = isFollowingUser;
    setIsFollowingUser(!wasFollowing);
    try {
      if (wasFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
    } catch (err) {
      console.error("Follow error:", err);
      setIsFollowingUser(wasFollowing);
    }
    setFollowLoading(false);
  }

  return (
    <div style={pageStyle}>
      {user ? <NavBar /> : <PublicNav />}

      <main style={mainStyle}>
        {loading ? (
          <div style={loadingStyle}>Loading player profile...</div>
        ) : notFound ? (
          <div style={notFoundStyle}>
            <h2 style={notFoundTitleStyle}>Player Not Found</h2>
            <p style={{ opacity: 0.7 }}>This player profile doesn&apos;t exist.</p>
            <button
              onClick={() => navigate("/leaderboard")}
              style={backButtonStyle}
            >
              ← Back to Leaderboard
            </button>
          </div>
        ) : profile ? (
          <>
            {/* Profile Header */}
            <div style={profileHeaderStyle}>
              <div style={avatarStyle}>
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={playerNameStyle}>{profile.displayName}</h1>
                <p style={rankTagStyle}>#{profile.globalRank} globally</p>
              </div>
              {user && user.id !== userId && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  style={
                    isFollowingUser
                      ? (followHover ? unfollowButtonStyle : followingButtonStyle)
                      : followButtonStyle
                  }
                  onMouseEnter={() => setFollowHover(true)}
                  onMouseLeave={() => setFollowHover(false)}
                >
                  {isFollowingUser
                    ? (followHover ? "Unfollow" : "Following")
                    : "Follow"}
                </button>
              )}
            </div>

            {/* Stats Bar */}
            <div style={statsGridStyle}>
              <div style={statCardStyle}>
                <div style={statValueStyle}>#{profile.globalRank}</div>
                <div style={statLabelStyle}>Global Rank</div>
              </div>
              <div style={statCardStyle}>
                <div style={{ ...statValueStyle, color: colors.primary }}>
                  {Math.round(profile.totalScore)}
                </div>
                <div style={statLabelStyle}>Total Points</div>
              </div>
              <div style={statCardStyle}>
                <div style={statValueStyle}>{profile.eventsPlayed}</div>
                <div style={statLabelStyle}>Events Played</div>
              </div>
              <div style={statCardStyle}>
                <div style={statValueStyle}>
                  {profile.eventsPlayed > 0
                    ? parseFloat(profile.avgPerEvent).toFixed(1)
                    : "—"}
                </div>
                <div style={statLabelStyle}>Avg / Event</div>
              </div>
            </div>

            {/* Event History */}
            <section style={sectionStyle}>
              <h2 style={sectionTitleStyle}>Event History</h2>
              {history.length === 0 ? (
                <div style={emptyStateStyle}>No scored events yet.</div>
              ) : (
                <div style={tableContainerStyle}>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={tableHeaderRowStyle}>
                        <th style={tableHeaderCellStyle}>Event</th>
                        <th style={{ ...tableHeaderCellStyle, textAlign: "center" }}>Brand</th>
                        <th style={{ ...tableHeaderCellStyle, textAlign: "center" }}>Date</th>
                        <th style={{ ...tableHeaderCellStyle, textAlign: "center" }}>Correct</th>
                        <th style={{ ...tableHeaderCellStyle, textAlign: "right" }}>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map(row => (
                        <tr
                          key={row.eventId}
                          style={tableRowStyle}
                          onClick={() => navigate(`/event/${row.eventId}`)}
                          onMouseEnter={e => e.currentTarget.style.background = "#F8F8F8"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ ...tableCellStyle, fontWeight: 600, cursor: "pointer" }}>
                            {row.eventName}
                          </td>
                          <td style={{ ...tableCellStyle, textAlign: "center" }}>
                            <span style={brandBadgeStyle}>{row.brand}</span>
                          </td>
                          <td style={{ ...tableCellStyle, textAlign: "center", opacity: 0.7 }}>
                            {new Date(row.date).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric"
                            })}
                          </td>
                          <td style={{ ...tableCellStyle, textAlign: "center" }}>
                            {row.correctPicks}/{row.totalMatches}
                          </td>
                          <td style={{ ...tableCellStyle, textAlign: "right", fontWeight: 700, color: colors.primary }}>
                            {Math.round(row.pointsEarned)} pts
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : null}
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
  maxWidth: "1000px",
  margin: "0 auto",
  padding: "3rem 2rem 4rem",
};

const loadingStyle = {
  textAlign: "center",
  padding: "4rem 2rem",
  fontSize: "1.1rem",
  color: colors.textColor,
  opacity: 0.6,
};

const notFoundStyle = {
  textAlign: "center",
  padding: "4rem 2rem",
};

const notFoundTitleStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "2rem",
  color: colors.textColor,
  marginBottom: "0.5rem",
};

const backButtonStyle = {
  marginTop: "1.5rem",
  padding: "0.7rem 1.5rem",
  background: "transparent",
  border: `1px solid ${colors.borderColor}`,
  borderRadius: "8px",
  fontSize: "0.95rem",
  cursor: "pointer",
  color: colors.textColor,
};

const profileHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
  marginBottom: "2rem",
};

const avatarStyle = {
  width: "72px",
  height: "72px",
  borderRadius: "50%",
  background: colors.primary,
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "2rem",
  fontWeight: 700,
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  flexShrink: 0,
};

const playerNameStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "2.5rem",
  color: colors.highlight,
  margin: "0 0 0.2rem 0",
  letterSpacing: "0.03em",
};

const rankTagStyle = {
  fontSize: "0.95rem",
  color: colors.textColor,
  opacity: 0.6,
  margin: 0,
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "1rem",
  marginBottom: "3rem",
};

const statCardStyle = {
  background: colors.background,
  border: `1px solid ${colors.borderColor}`,
  borderRadius: "12px",
  padding: "1.5rem",
  textAlign: "center",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
};

const statValueStyle = {
  fontSize: "2rem",
  fontWeight: 700,
  color: colors.highlight,
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  letterSpacing: "0.02em",
};

const statLabelStyle = {
  fontSize: "0.78rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: colors.textColor,
  opacity: 0.55,
  marginTop: "0.4rem",
};

const sectionStyle = {
  marginTop: "1rem",
};

const sectionTitleStyle = {
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontSize: "1.5rem",
  color: colors.textColor,
  margin: "0 0 1.2rem 0",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

const emptyStateStyle = {
  textAlign: "center",
  padding: "3rem 2rem",
  fontSize: "1rem",
  color: colors.textColor,
  opacity: 0.6,
  background: colors.background,
  borderRadius: "12px",
  border: `1px solid ${colors.borderColor}`,
};

const tableContainerStyle = {
  background: colors.background,
  borderRadius: "12px",
  border: `1px solid ${colors.borderColor}`,
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "500px",
};

const tableHeaderRowStyle = {
  borderBottom: `2px solid ${colors.borderColor}`,
};

const tableHeaderCellStyle = {
  padding: "1rem 1.5rem",
  textAlign: "left",
  fontSize: "0.8rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: colors.textColor,
  opacity: 0.6,
};

const tableRowStyle = {
  borderBottom: `1px solid ${colors.borderColor}`,
  transition: "background 0.15s ease",
};

const tableCellStyle = {
  padding: "1rem 1.5rem",
  fontSize: "0.95rem",
  color: colors.textColor,
};

const brandBadgeStyle = {
  fontSize: "0.7rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  background: colors.highlight,
  color: "#fff",
  padding: "0.2rem 0.5rem",
  borderRadius: "4px",
};

const followButtonStyle = {
  padding: "0.6rem 1.4rem",
  background: colors.primary,
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "0.95rem",
  fontWeight: 600,
  cursor: "pointer",
  flexShrink: 0,
};

const followingButtonStyle = {
  padding: "0.6rem 1.4rem",
  background: "transparent",
  color: colors.textColor,
  border: `1px solid ${colors.borderColor}`,
  borderRadius: "8px",
  fontSize: "0.95rem",
  fontWeight: 600,
  cursor: "pointer",
  flexShrink: 0,
  opacity: 0.75,
};

const unfollowButtonStyle = {
  padding: "0.6rem 1.4rem",
  background: "transparent",
  color: "#c0392b",
  border: "1px solid #c0392b",
  borderRadius: "8px",
  fontSize: "0.95rem",
  fontWeight: 600,
  cursor: "pointer",
  flexShrink: 0,
};
