import { useState, useEffect, useMemo, Fragment } from "react";
import { Link } from "react-router-dom";
import { getGlobalLeaderboard } from "./api/users.js";
import { useAuth } from "./auth.jsx";
import NavBar from "./NavBar";
import PublicNav from "./PublicNav";
import colors from "./theme";

function sortArrow(col, sortBy, sortDir) {
  if (col !== sortBy) return <span style={arrowInactiveStyle}>↕</span>;
  return <span style={arrowActiveStyle}>{sortDir === "desc" ? "↓" : "↑"}</span>;
}

function brandColor(brand) {
  if (brand === "WWE") return colors.accent;
  if (brand === "AEW") return colors.primary;
  return colors.textColor;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

const PAGE_SIZE = 20;

export default function GlobalLeaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [season, setSeason]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [sortBy, setSortBy]           = useState("total");
  const [sortDir, setSortDir]         = useState("desc");
  const [page, setPage]               = useState(1);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    setLoading(true);
    try {
      const { leaderboard: data, season: seasonData } = await getGlobalLeaderboard();
      setLeaderboard(data || []);
      setSeason(seasonData || null);
    } catch (err) {
      console.error("Error loading leaderboard:", err);
    }
    setLoading(false);
  }

  function handleSortClick(key) {
    if (key === sortBy) {
      setSortDir(d => d === "desc" ? "asc" : "desc");
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  }

  function getVal(player, key) {
    if (key === "avg")    return player.eventsPlayed > 0 ? player.totalScore / player.eventsPlayed : 0;
    if (key === "events") return player.eventsPlayed;
    return player.totalScore;
  }

  const displayed = useMemo(() => {
    const q = search.toLowerCase();
    return [...leaderboard]
      .filter(p => p.displayName.toLowerCase().includes(q))
      .sort((a, b) => {
        const diff = getVal(b, sortBy) - getVal(a, sortBy);
        return sortDir === "desc" ? diff : -diff;
      });
  }, [leaderboard, search, sortBy, sortDir]);

  useEffect(() => { setPage(1); }, [search, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(displayed.length / PAGE_SIZE));
  const pageItems  = displayed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={pageStyle}>
      {user ? <NavBar /> : <PublicNav />}

      <main style={mainStyle}>
        <div style={containerStyle}>
          <h1 style={titleStyle}>Global Leaderboard</h1>

          {/* Season Roadmap */}
          {season && (
            <div style={roadmapCardStyle}>

              {/* Top row: season metadata */}
              <div style={seasonMetaRowStyle}>
                <span style={seasonLabelStyle}>Season 1</span>
                <span style={metaDividerStyle}>·</span>
                <span style={metaTextStyle}>
                  {season.scoredEvents} of {season.totalEvents} events scored
                </span>
                <span style={metaDividerStyle}>·</span>
                <span style={season.remainingEvents === 0 ? seasonCompleteStyle : seasonRemainingStyle}>
                  {season.remainingEvents === 0
                    ? "Season complete"
                    : `${season.remainingEvents} event${season.remainingEvents !== 1 ? "s" : ""} remaining`}
                </span>
              </div>

              {/* Bottom section: upcoming event roadmap */}
              {season.upcoming?.length > 0 && (
                <>
                  <div style={roadmapDividerStyle} />
                  <div style={timelineWrapStyle}>
                    <div style={upcomingLabelStyle}>What's Next</div>
                    <div style={timelineTrackStyle}>
                      {season.upcoming.map((evt, i) => (
                        <Fragment key={evt.id}>
                          {i > 0 && (
                            <div style={connectorStyle}>
                              <div style={connectorLineStyle} />
                              <span style={connectorHeadStyle}>▶</span>
                            </div>
                          )}
                          <Link
                            to={`/event/${evt.id}`}
                            style={{ ...eventNodeStyle, borderTop: `3px solid ${brandColor(evt.brand)}`, textDecoration: "none" }}
                          >
                            <div style={{ ...brandTagStyle, color: brandColor(evt.brand) }}>{evt.brand}</div>
                            <div style={evtNameStyle}>{evt.name}</div>
                            <div style={evtDateStyle}>{formatDate(evt.date)}</div>
                            {evt.name === season.finalEvent && (
                              <div style={finaleTagStyle}>Season Finale</div>
                            )}
                          </Link>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </>
              )}

            </div>
          )}

          {loading ? (
            <div style={loadingStyle}>Loading leaderboard...</div>
          ) : leaderboard.length === 0 ? (
            <div style={emptyStateStyle}>
              <p>No players on the leaderboard yet.</p>
              <p style={{ marginTop: "1rem", opacity: 0.7 }}>Be the first to join and make predictions!</p>
            </div>
          ) : (
            <>
              <div style={controlsRowStyle}>
                <input
                  type="text"
                  placeholder="Search players..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={searchInputStyle}
                />
              </div>

              {displayed.length === 0 ? (
                <div style={emptyStateStyle}>No players match "{search}"</div>
              ) : (
                <div style={tableContainerStyle}>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={tableHeaderRowStyle}>
                        {/* Sticky player column header */}
                        <th style={stickyHeaderCellStyle}>Player</th>

                        {/* Scrollable stat column headers */}
                        <th
                          style={{ ...scrollHeaderCellStyle, ...sortableHeaderStyle }}
                          onClick={() => handleSortClick("events")}
                        >
                          Events {sortArrow("events", sortBy, sortDir)}
                        </th>
                        <th
                          style={{ ...scrollHeaderCellStyle, ...sortableHeaderStyle }}
                          onClick={() => handleSortClick("avg")}
                        >
                          Avg {sortArrow("avg", sortBy, sortDir)}
                        </th>
                        <th
                          style={{ ...scrollHeaderCellStyle, ...sortableHeaderStyle, paddingRight: "1.5rem" }}
                          onClick={() => handleSortClick("total")}
                        >
                          Points {sortArrow("total", sortBy, sortDir)}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((player, index) => {
                        const rank = (page - 1) * PAGE_SIZE + index;
                        return (
                          <tr key={player.userId} style={tableRowStyle}>
                            {/* Sticky combined rank + name cell */}
                            <td style={stickyPlayerCellStyle}>
                              <div style={stickyInnerStyle}>
                                <span style={
                                  rank === 0 ? goldRankStyle :
                                  rank === 1 ? silverRankStyle :
                                  rank === 2 ? bronzeRankStyle :
                                  rankNumStyle
                                }>
                                  #{rank + 1}
                                </span>
                                <Link
                                  to={`/user/${player.userId}`}
                                  style={playerLinkStyle}
                                  onMouseEnter={e => e.currentTarget.style.color = colors.primary}
                                  onMouseLeave={e => e.currentTarget.style.color = colors.textColor}
                                >
                                  {player.displayName}
                                </Link>
                              </div>
                            </td>

                            {/* Scrollable stat cells */}
                            <td style={scrollStatCellStyle}>{player.eventsPlayed}</td>
                            <td style={{ ...scrollStatCellStyle, opacity: 0.65 }}>
                              {player.eventsPlayed > 0
                                ? (player.totalScore / player.eventsPlayed).toFixed(1)
                                : "—"}
                            </td>
                            <td style={{ ...scrollStatCellStyle, ...pointsCellStyle, paddingRight: "1.5rem" }}>
                              {Math.round(player.totalScore)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Pagination bar */}
                  <div style={paginationBarStyle}>
                    <span style={paginationInfoStyle}>
                      {displayed.length === 0 ? "No players" :
                        `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, displayed.length)} of ${displayed.length}`}
                    </span>
                    <div style={paginationButtonsStyle}>
                      <button style={pgBtnStyle(page === 1)} disabled={page === 1} onClick={() => setPage(1)}>«</button>
                      <button style={pgBtnStyle(page === 1)} disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                      <span style={pageIndicatorStyle}>Page {page} of {totalPages}</span>
                      <button style={pgBtnStyle(page === totalPages)} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                      <button style={pgBtnStyle(page === totalPages)} disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
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
  padding: "3rem 1rem",
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
  margin: "0 0 1.5rem 0",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

/* ── Roadmap card ── */

const roadmapCardStyle = {
  background: colors.background,
  border: `1px solid ${colors.borderColor}`,
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  marginBottom: "2rem",
  overflow: "hidden",
};

const seasonMetaRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: "0.5rem",
  padding: "0.85rem 1.5rem",
  background: "#FAFAFA",
  fontSize: "0.9rem",
  color: colors.textColor,
};

const seasonLabelStyle = {
  fontWeight: 700,
  color: colors.primary,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  fontSize: "0.8rem",
};

const metaDividerStyle = {
  opacity: 0.3,
};

const metaTextStyle = {
  opacity: 0.8,
};

const seasonRemainingStyle = {
  fontWeight: 600,
  color: colors.accent,
};

const seasonCompleteStyle = {
  fontWeight: 600,
  color: "#22a05a",
};

const roadmapDividerStyle = {
  borderTop: `1px solid ${colors.borderColor}`,
};

const timelineWrapStyle = {
  padding: "1.5rem 1.5rem 1.75rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1rem",
};

const upcomingLabelStyle = {
  fontSize: "0.7rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: colors.textColor,
  opacity: 0.35,
};

const timelineTrackStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: "0.25rem",
};

const connectorStyle = {
  display: "flex",
  alignItems: "center",
  flexShrink: 0,
  padding: "0 0.25rem",
};

const connectorLineStyle = {
  width: "48px",
  height: "2px",
  background: colors.borderColor,
};

const connectorHeadStyle = {
  fontSize: "0.6rem",
  color: colors.textColor,
  opacity: 0.3,
  marginLeft: "-1px",
};

const eventNodeStyle = {
  width: "190px",
  background: "#fff",
  borderRadius: "10px",
  border: `1px solid ${colors.borderColor}`,
  padding: "1rem 1.2rem",
  textAlign: "center",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
};

const brandTagStyle = {
  display: "block",
  fontSize: "0.68rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  marginBottom: "0.4rem",
};

const evtNameStyle = {
  fontWeight: 700,
  fontSize: "0.95rem",
  color: colors.textColor,
  lineHeight: 1.3,
  marginBottom: "0.35rem",
};

const evtDateStyle = {
  fontSize: "0.8rem",
  color: colors.textColor,
  opacity: 0.5,
};

const finaleTagStyle = {
  display: "inline-block",
  marginTop: "0.55rem",
  fontSize: "0.65rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: colors.primary,
  background: "#fff8ee",
  border: `1px solid ${colors.primary}`,
  borderRadius: "4px",
  padding: "0.2rem 0.55rem",
};

/* ── Table ── */

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

const controlsRowStyle = {
  marginBottom: "1rem",
};

const searchInputStyle = {
  padding: "0.6rem 1rem",
  fontSize: "0.95rem",
  border: `1px solid ${colors.borderColor}`,
  borderRadius: "8px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  color: colors.textColor,
  background: colors.background,
};

const tableContainerStyle = {
  background: colors.background,
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  border: `1px solid ${colors.borderColor}`,
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const tableHeaderRowStyle = {
  borderBottom: `2px solid ${colors.borderColor}`,
};

/* Sticky player column — header */
const stickyHeaderCellStyle = {
  position: "sticky",
  left: 0,
  zIndex: 3,
  background: "#FAFAFA",
  padding: "1rem 0.75rem 1rem 1.25rem",
  textAlign: "left",
  fontSize: "0.8rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: colors.textColor,
  whiteSpace: "nowrap",
  boxShadow: "3px 0 8px -3px rgba(0,0,0,0.14)",
};

/* Scrollable stat column headers */
const scrollHeaderCellStyle = {
  padding: "1rem 0.75rem",
  textAlign: "right",
  fontSize: "0.8rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: colors.textColor,
  opacity: 0.7,
  whiteSpace: "nowrap",
};

const sortableHeaderStyle = {
  cursor: "pointer",
  userSelect: "none",
};

const tableRowStyle = {
  borderBottom: `1px solid ${colors.borderColor}`,
};

/* Sticky player column — body */
const stickyPlayerCellStyle = {
  position: "sticky",
  left: 0,
  zIndex: 2,
  background: colors.background,
  padding: "0.85rem 0.75rem 0.85rem 1.25rem",
  boxShadow: "3px 0 8px -3px rgba(0,0,0,0.14)",
};

const stickyInnerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
};

/* Rank badge styles — circular for medals, plain text for others */
const rankBadgeBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  fontSize: "0.72rem",
  fontWeight: 800,
  flexShrink: 0,
  whiteSpace: "nowrap",
};

const goldRankStyle   = { ...rankBadgeBase, background: "#FFD700", color: "#7A5C00" };
const silverRankStyle = { ...rankBadgeBase, background: "#C0C0C0", color: "#444" };
const bronzeRankStyle = { ...rankBadgeBase, background: "#CD7F32", color: "#fff" };

const rankNumStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "30px",
  height: "30px",
  flexShrink: 0,
  fontSize: "0.78rem",
  fontWeight: 600,
  color: colors.textColor,
  opacity: 0.45,
  whiteSpace: "nowrap",
};

/* Scrollable stat cells — body */
const scrollStatCellStyle = {
  padding: "0.85rem 0.75rem",
  fontSize: "0.95rem",
  textAlign: "right",
  color: colors.textColor,
  whiteSpace: "nowrap",
};

const pointsCellStyle = {
  fontWeight: 700,
  color: colors.primary,
};

const playerLinkStyle = {
  color: colors.textColor,
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "0.95rem",
  transition: "color 0.15s ease",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: "160px",
  display: "block",
};

/* Pagination */

const paginationBarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.85rem 1.25rem",
  borderTop: `1px solid ${colors.borderColor}`,
  flexWrap: "wrap",
  gap: "0.75rem",
};

const paginationInfoStyle = {
  fontSize: "0.85rem",
  color: colors.textColor,
  opacity: 0.5,
};

const paginationButtonsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
};

function pgBtnStyle(disabled) {
  return {
    padding: "0.35rem 0.7rem",
    fontSize: "0.85rem",
    fontWeight: 600,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: "6px",
    background: colors.background,
    color: disabled ? colors.borderColor : colors.textColor,
    cursor: disabled ? "default" : "pointer",
  };
}

const pageIndicatorStyle = {
  fontSize: "0.85rem",
  color: colors.textColor,
  opacity: 0.6,
  padding: "0 0.4rem",
};

const arrowInactiveStyle = {
  marginLeft: "0.3rem",
  opacity: 0.3,
  fontSize: "0.75rem",
};

const arrowActiveStyle = {
  marginLeft: "0.3rem",
  opacity: 0.8,
  fontSize: "0.75rem",
};
