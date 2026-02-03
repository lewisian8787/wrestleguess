import { useEffect, useState, useMemo } from "react";
import { getCurrentUserOrNull } from "./authSignIn";
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent, scoreEvent } from "./api/events.js";
import { api } from "./api/client.js";

//test line for commit

export default function AdminEventPanel() {
  // ---------- ADMIN GATE STATE ----------
  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // ---------- TAB STATE ----------
  const [activeTab, setActiveTab] = useState("events"); // events, create, scoring, stats

  // ---------- EVENTS MANAGEMENT STATE ----------
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsFilter, setEventsFilter] = useState("all"); // all, upcoming, past, locked
  const [deleteConfirm, setDeleteConfirm] = useState(null); // eventId to confirm deletion

  // ---------- CREATE EVENT STATE ----------
  const [eventId, setEventId] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [date, setDate] = useState("");
  const [matches, setMatches] = useState([
    {
      matchId: "m1",
      type: "Singles",
      titleMatch: false,
      competitors: ["", ""],
      winner: null,
      multiplier: 1.0,
    },
  ]);
  const [createStatus, setCreateStatus] = useState("");

  // ---------- SCORING STATE ----------
  const [scoringEventId, setScoringEventId] = useState("");
  const [scoringEvent, setScoringEvent] = useState(null);
  const [winners, setWinners] = useState({});
  const [scoringStatus, setScoringStatus] = useState("");

  // ---------- STATISTICS STATE ----------
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLeagues: 0,
    totalEvents: 0,
    totalPicks: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // ---------- ACCESS CHECK ----------
  useEffect(() => {
    (async () => {
      const user = await getCurrentUserOrNull();

      if (user && user.isAdmin === true) {
        setIsAdmin(true);
      }

      setChecked(true);
    })();
  }, []);

  // ---------- LOAD EVENTS ----------
  async function loadEvents() {
    setEventsLoading(true);
    try {
      const eventsList = await getEvents();

      // Sort by date (most recent first)
      eventsList.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });

      setEvents(eventsList);
    } catch (err) {
      console.error("Error loading events:", err);
    }
    setEventsLoading(false);
  }

  // Load events when tab switches to events management
  useEffect(() => {
    if (activeTab === "events" && isAdmin) {
      loadEvents();
    }
  }, [activeTab, isAdmin]);

  // ---------- LOAD STATISTICS ----------
  async function loadStats() {
    setStatsLoading(true);
    try {
      // Get stats from API - uses data we already have access to
      const eventsList = await getEvents();
      const leaderboard = await api.get('/api/users/leaderboard');
      const userLeagues = await api.get('/api/leagues');

      setStats({
        totalUsers: leaderboard.leaderboard?.length || 0,
        totalLeagues: userLeagues.leagues?.length || 0,
        totalEvents: eventsList.length,
        totalPicks: 0, // Would need a dedicated stats endpoint for accurate count
      });
    } catch (err) {
      console.error("Error loading stats:", err);
    }
    setStatsLoading(false);
  }

  // Load stats when tab switches to statistics
  useEffect(() => {
    if (activeTab === "stats" && isAdmin) {
      loadStats();
    }
  }, [activeTab, isAdmin]);

  // ---------- FILTER EVENTS ----------
  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events.filter((event) => {
      if (eventsFilter === "all") return true;

      const eventDate = event.date?.toDate
        ? event.date.toDate()
        : new Date(event.date);

      if (eventsFilter === "upcoming") return eventDate > now;
      if (eventsFilter === "past") return eventDate <= now;
      if (eventsFilter === "locked") return event.locked === true;

      return true;
    });
  }, [events, eventsFilter]);

  // ---------- TOGGLE LOCK ----------
  async function handleToggleLock(eventId, currentlyLocked) {
    try {
      await updateEvent(eventId, { locked: !currentlyLocked });
      // Reload events
      await loadEvents();
    } catch (err) {
      console.error("Error toggling lock:", err);
      alert("Error toggling lock: " + err.message);
    }
  }

  // ---------- DELETE EVENT ----------
  async function handleDeleteEvent(eventId) {
    try {
      await deleteEvent(eventId);
      // Reload events
      await loadEvents();
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Error deleting event: " + err.message);
    }
  }

  // ---------- MATCH MANAGEMENT ----------
  function addMatch() {
    const newMatchId = `m${matches.length + 1}`;
    setMatches([
      ...matches,
      {
        matchId: newMatchId,
        type: "Singles",
        titleMatch: false,
        competitors: ["", ""],
        winner: null,
        multiplier: 1.0,
      },
    ]);
  }

  function removeMatch(index) {
    setMatches(matches.filter((_, i) => i !== index));
  }

  function updateMatch(index, field, value) {
    const updated = [...matches];
    if (field === "competitor1") {
      updated[index].competitors[0] = value;
    } else if (field === "competitor2") {
      updated[index].competitors[1] = value;
    } else {
      updated[index][field] = value;
    }
    setMatches(updated);
  }

  // ---------- CREATE EVENT HANDLER ----------
  async function handleSaveEvent(e) {
    e.preventDefault();
    setCreateStatus("Saving...");

    if (!name.trim() || !brand.trim() || !date.trim()) {
      setCreateStatus("Please fill in all fields");
      return;
    }

    // Validate matches
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      if (!match.competitors[0] || !match.competitors[1]) {
        setCreateStatus(`Match ${i + 1}: Please fill in both competitors`);
        return;
      }
    }

    try {
      // Check if editing existing event or creating new
      if (eventId) {
        // Update existing event
        await updateEvent(eventId, { name, brand, date, matches });
        setCreateStatus("Event updated ✔");
      } else {
        // Create new event
        await createEvent({ name, brand, date, matches });
        setCreateStatus("Event created ✔");
      }

      // Clear form
      setEventId("");
      setName("");
      setBrand("");
      setDate("");
      setMatches([
        {
          matchId: "m1",
          type: "Singles",
          titleMatch: false,
          competitors: ["", ""],
          winner: null,
          multiplier: 1.0,
        },
      ]);
    } catch (err) {
      console.error(err);
      setCreateStatus("Error: " + err.message);
    }
  }

  // ---------- LOAD EVENT FOR SCORING ----------
  async function handleLoadEventForScoring() {
    setScoringStatus("Loading event...");
    try {
      const data = await getEvent(scoringEventId);

      if (!data) {
        setScoringStatus("Event not found!");
        return;
      }

      setScoringEvent(data);

      // Pre-populate existing winners if any
      const existingWinners = {};
      (data.matches || []).forEach((m) => {
        if (m.winner) existingWinners[m.matchId] = m.winner;
      });
      setWinners(existingWinners);

      setScoringStatus("Event loaded. Select winners below.");
    } catch (err) {
      console.error(err);
      setScoringStatus("Error loading event: " + err.message);
    }
  }

  // ---------- SCORE EVENT & UPDATE WINNERS ----------
  async function handleScoreEvent() {
    setScoringStatus("Updating winners and scoring...");

    try {
      // 1. Update event document with winners
      const updatedMatches = scoringEvent.matches.map((m) => ({
        ...m,
        winner: winners[m.matchId] || null,
      }));

      await updateEvent(scoringEventId, { matches: updatedMatches });

      // 2. Score the event via API (calculates and updates all scores server-side)
      const result = await scoreEvent(scoringEventId);

      setScoringStatus(
        `Scoring complete! Updated ${result.usersScored || 0} users.`
      );

      // Clear scoring form
      setScoringEventId("");
      setScoringEvent(null);
      setWinners({});
    } catch (err) {
      console.error("Scoring error:", err);
      setScoringStatus("Error: " + err.message);
    }
  }

  // ---------- LOAD EVENT FOR EDITING ----------
  function handleEditEvent(event) {
    setActiveTab("create");
    setEventId(event.id);
    setName(event.name);
    setBrand(event.brand);
    setDate(event.date);
    setMatches(event.matches || []);
    setCreateStatus("");
  }

  // ---------- RENDER GUARD STATES ----------
  if (!checked) {
    return (
      <div style={screenStyle}>
        <p style={{ textAlign: "center" }}>Checking access…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={screenStyle}>
        <p
          style={{
            color: "red",
            textAlign: "center",
            lineHeight: 1.4,
            fontSize: "0.9rem",
          }}
        >
          Access denied.
          <br />
          <a
            href="/admin/login"
            style={{
              color: "#ffd600",
              textDecoration: "underline",
              fontWeight: 600,
            }}
          >
            Log in as admin
          </a>
          .
        </p>
      </div>
    );
  }

  // ---------- MAIN ADMIN PANEL UI ----------
  return (
    <div style={fullScreenStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <h1 style={headerTitleStyle}>WrestleGuess Admin Panel</h1>
        <a href="/home" style={backLinkStyle}>
          ← Back to Home
        </a>
      </header>

      {/* Tab Navigation */}
      <nav style={tabNavStyle}>
        <button
          onClick={() => setActiveTab("events")}
          style={{
            ...tabButtonStyle,
            ...(activeTab === "events" ? tabButtonActiveStyle : {}),
          }}
        >
          Events Management
        </button>
        <button
          onClick={() => setActiveTab("create")}
          style={{
            ...tabButtonStyle,
            ...(activeTab === "create" ? tabButtonActiveStyle : {}),
          }}
        >
          Create Event
        </button>
        <button
          onClick={() => setActiveTab("scoring")}
          style={{
            ...tabButtonStyle,
            ...(activeTab === "scoring" ? tabButtonActiveStyle : {}),
          }}
        >
          Scoring
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          style={{
            ...tabButtonStyle,
            ...(activeTab === "stats" ? tabButtonActiveStyle : {}),
          }}
        >
          Statistics
        </button>
      </nav>

      {/* Content Area */}
      <main style={contentAreaStyle}>
        {/* EVENTS MANAGEMENT TAB */}
        {activeTab === "events" && (
          <div style={{ width: "100%" }}>
            <div style={sectionHeaderStyle}>
              <h2 style={sectionTitleStyle}>All Events</h2>
              <div style={filterGroupStyle}>
                <button
                  onClick={() => setEventsFilter("all")}
                  style={{
                    ...filterButtonStyle,
                    ...(eventsFilter === "all" ? filterButtonActiveStyle : {}),
                  }}
                >
                  All Events ({events.length})
                </button>
                <button
                  onClick={() => setEventsFilter("upcoming")}
                  style={{
                    ...filterButtonStyle,
                    ...(eventsFilter === "upcoming"
                      ? filterButtonActiveStyle
                      : {}),
                  }}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setEventsFilter("past")}
                  style={{
                    ...filterButtonStyle,
                    ...(eventsFilter === "past" ? filterButtonActiveStyle : {}),
                  }}
                >
                  Past
                </button>
                <button
                  onClick={() => setEventsFilter("locked")}
                  style={{
                    ...filterButtonStyle,
                    ...(eventsFilter === "locked"
                      ? filterButtonActiveStyle
                      : {}),
                  }}
                >
                  Locked
                </button>
              </div>
            </div>

            {eventsLoading ? (
              <p style={{ textAlign: "center", opacity: 0.7 }}>
                Loading events...
              </p>
            ) : filteredEvents.length === 0 ? (
              <div style={emptyStateStyle}>
                No events found. Create one using the "Create Event" tab.
              </div>
            ) : (
              <div style={tableContainerStyle}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={tableHeaderCellStyle}>Event Name</th>
                      <th style={tableHeaderCellStyle}>Brand</th>
                      <th style={tableHeaderCellStyle}>Date</th>
                      <th style={tableHeaderCellStyle}>Status</th>
                      <th style={tableHeaderCellStyle}>Locked</th>
                      <th style={tableHeaderCellStyle}>Scored</th>
                      <th style={tableHeaderCellStyle}># Picks</th>
                      <th style={tableHeaderCellStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((event) => {
                      const eventDate = event.date?.toDate
                        ? event.date.toDate()
                        : new Date(event.date);
                      const isPast = eventDate <= new Date();

                      return (
                        <tr key={event.id} style={tableRowStyle}>
                          <td style={tableCellStyle}>
                            <div style={{ fontWeight: 600 }}>{event.name}</div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                opacity: 0.6,
                                marginTop: "0.25rem",
                              }}
                            >
                              ID: {event.id}
                            </div>
                          </td>
                          <td style={tableCellStyle}>{event.brand}</td>
                          <td style={tableCellStyle}>
                            {isNaN(eventDate)
                              ? "Invalid Date"
                              : eventDate.toLocaleDateString()}
                          </td>
                          <td style={tableCellStyle}>
                            <span
                              style={{
                                ...statusBadgeStyle,
                                background: isPast ? "#4a4a5a" : "#4ade80",
                                color: isPast ? "#fff" : "#000",
                              }}
                            >
                              {isPast ? "Past" : "Upcoming"}
                            </span>
                          </td>
                          <td style={tableCellStyle}>
                            <span
                              style={{
                                ...statusBadgeStyle,
                                background: event.locked ? "#f87171" : "#4ade80",
                                color: "#000",
                              }}
                            >
                              {event.locked ? "Yes" : "No"}
                            </span>
                          </td>
                          <td style={tableCellStyle}>
                            <span
                              style={{
                                ...statusBadgeStyle,
                                background: event.scored ? "#4ade80" : "#4a4a5a",
                                color: event.scored ? "#000" : "#fff",
                              }}
                            >
                              {event.scored ? "Yes" : "No"}
                            </span>
                          </td>
                          <td style={tableCellStyle}>{event.picksCount}</td>
                          <td style={tableCellStyle}>
                            <div style={actionsGroupStyle}>
                              <button
                                onClick={() =>
                                  handleToggleLock(event.id, event.locked)
                                }
                                style={{
                                  ...actionButtonStyle,
                                  background: event.locked
                                    ? "#4ade80"
                                    : "#f87171",
                                }}
                                title={
                                  event.locked ? "Unlock event" : "Lock event"
                                }
                              >
                                {event.locked ? "🔓" : "🔒"}
                              </button>
                              <button
                                onClick={() => handleEditEvent(event)}
                                style={{
                                  ...actionButtonStyle,
                                  background: "#3a3a55",
                                }}
                                title="Edit event"
                              >
                                ✏️
                              </button>
                              {deleteConfirm === event.id ? (
                                <div style={confirmDeleteStyle}>
                                  <button
                                    onClick={() => handleDeleteEvent(event.id)}
                                    style={{
                                      ...actionButtonStyle,
                                      background: "#f87171",
                                      fontSize: "0.7rem",
                                      padding: "0.4rem 0.6rem",
                                    }}
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    style={{
                                      ...actionButtonStyle,
                                      background: "#4a4a5a",
                                      fontSize: "0.7rem",
                                      padding: "0.4rem 0.6rem",
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirm(event.id)}
                                  style={{
                                    ...actionButtonStyle,
                                    background: "#aa0000",
                                  }}
                                  title="Delete event"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CREATE EVENT TAB */}
        {activeTab === "create" && (
          <div style={{ width: "100%" }}>
            <h2 style={sectionTitleStyle}>Create / Edit Event</h2>

            {createStatus && (
              <div style={statusBoxStyle}>{createStatus}</div>
            )}

            <form
              onSubmit={handleSaveEvent}
              style={{ display: "grid", gap: "1rem", maxWidth: "100%", width: "100%" }}
            >
              <label style={labelStyle}>
                <div style={labelTextStyle}>Event ID (document key)</div>
                <input
                  style={inputStyle}
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  placeholder="e.g., AEW_FullGear_2025"
                  required
                />
              </label>

              <label style={labelStyle}>
                <div style={labelTextStyle}>Display Name</div>
                <input
                  style={inputStyle}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., AEW Full Gear"
                  required
                />
              </label>

              <label style={labelStyle}>
                <div style={labelTextStyle}>Brand</div>
                <input
                  style={inputStyle}
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g., AEW"
                  required
                />
              </label>

              <label style={labelStyle}>
                <div style={labelTextStyle}>Event Date & Time</div>
                <input
                  type="datetime-local"
                  style={inputStyle}
                  value={
                    date
                      ? new Date(date).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) => {
                    // Convert from datetime-local to ISO string
                    const dateObj = new Date(e.target.value);
                    setDate(dateObj.toISOString());
                  }}
                  required
                />
                <div style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: "0.25rem" }}>
                  Picks lock at this date/time
                </div>
              </label>

              <div style={labelStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={labelTextStyle}>Matches</div>
                  <button
                    type="button"
                    onClick={addMatch}
                    style={{
                      ...secondaryButtonStyle,
                      padding: "0.5rem 1rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    + Add Match
                  </button>
                </div>

                {matches.map((match, index) => (
                  <div key={index} style={matchBuilderCardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 600, opacity: 0.9 }}>
                        Match {index + 1}
                      </div>
                      {matches.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMatch(index)}
                          style={{
                            ...actionButtonStyle,
                            background: "#aa0000",
                            padding: "0.35rem 0.6rem",
                            fontSize: "0.75rem",
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div style={{ display: "grid", gap: "0.75rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
                        <label style={labelStyle}>
                          <div style={{ ...labelTextStyle, fontSize: "0.8rem" }}>Match Type</div>
                          <input
                            style={inputStyle}
                            value={match.type}
                            onChange={(e) => updateMatch(index, "type", e.target.value)}
                            placeholder="e.g., Singles, Tag Team"
                            required
                          />
                        </label>

                        <label style={labelStyle}>
                          <div style={{ ...labelTextStyle, fontSize: "0.8rem" }}>Multiplier</div>
                          <input
                            type="number"
                            step="0.1"
                            min="1.0"
                            style={inputStyle}
                            value={match.multiplier}
                            onChange={(e) => updateMatch(index, "multiplier", parseFloat(e.target.value))}
                            required
                          />
                        </label>
                      </div>

                      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={match.titleMatch}
                          onChange={(e) => updateMatch(index, "titleMatch", e.target.checked)}
                          style={{ cursor: "pointer" }}
                        />
                        <span style={{ fontSize: "0.85rem" }}>Title Match</span>
                      </label>

                      <label style={labelStyle}>
                        <div style={{ ...labelTextStyle, fontSize: "0.8rem" }}>Competitor 1</div>
                        <input
                          style={inputStyle}
                          value={match.competitors[0]}
                          onChange={(e) => updateMatch(index, "competitor1", e.target.value)}
                          placeholder="Wrestler name"
                          required
                        />
                      </label>

                      <label style={labelStyle}>
                        <div style={{ ...labelTextStyle, fontSize: "0.8rem" }}>Competitor 2</div>
                        <input
                          style={inputStyle}
                          value={match.competitors[1]}
                          onChange={(e) => updateMatch(index, "competitor2", e.target.value)}
                          placeholder="Wrestler name"
                          required
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <button style={primaryButtonStyle}>Save / Overwrite Event</button>
            </form>
          </div>
        )}

        {/* SCORING TAB */}
        {activeTab === "scoring" && (
          <div style={{ width: "100%" }}>
            <h2 style={sectionTitleStyle}>Score Event & Enter Winners</h2>

            {scoringStatus && (
              <div style={statusBoxStyle}>{scoringStatus}</div>
            )}

            <div style={{ display: "grid", gap: "1rem", maxWidth: "100%", width: "100%" }}>
              <label style={labelStyle}>
                <div style={labelTextStyle}>Event ID to Score</div>
                <input
                  style={inputStyle}
                  placeholder="e.g., AEW_FullGear_2025"
                  value={scoringEventId}
                  onChange={(e) => setScoringEventId(e.target.value)}
                />
              </label>

              <button
                onClick={handleLoadEventForScoring}
                style={secondaryButtonStyle}
              >
                Load Event
              </button>

              {scoringEvent && (
                <div style={{ marginTop: "1.5rem" }}>
                  <h3
                    style={{
                      fontSize: "1rem",
                      marginBottom: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    {scoringEvent.name} - Select Winners
                  </h3>

                  <div style={{ display: "grid", gap: "0.75rem" }}>
                    {scoringEvent.matches.map((m) => (
                      <div key={m.matchId} style={matchCardStyle}>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            marginBottom: "0.5rem",
                            opacity: 0.8,
                            fontWeight: 600,
                          }}
                        >
                          {m.type} {m.multiplier && `(${m.multiplier}x multiplier)`}
                        </div>
                        <select
                          style={{
                            ...inputStyle,
                            cursor: "pointer",
                          }}
                          value={winners[m.matchId] || ""}
                          onChange={(e) =>
                            setWinners({ ...winners, [m.matchId]: e.target.value })
                          }
                        >
                          <option value="">Select Winner...</option>
                          {m.competitors.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleScoreEvent}
                    style={{ ...primaryButtonStyle, marginTop: "1.5rem" }}
                  >
                    Save Winners & Calculate Scores
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STATISTICS TAB */}
        {activeTab === "stats" && (
          <div style={{ width: "100%" }}>
            <h2 style={sectionTitleStyle}>Platform Statistics</h2>

            {statsLoading ? (
              <p style={{ textAlign: "center", opacity: 0.7 }}>
                Loading statistics...
              </p>
            ) : (
              <div style={statsGridStyle}>
                <div style={statCardStyle}>
                  <div style={statValueStyle}>{stats.totalUsers}</div>
                  <div style={statLabelStyle}>Total Users</div>
                </div>
                <div style={statCardStyle}>
                  <div style={statValueStyle}>{stats.totalLeagues}</div>
                  <div style={statLabelStyle}>Total Leagues</div>
                </div>
                <div style={statCardStyle}>
                  <div style={statValueStyle}>{stats.totalEvents}</div>
                  <div style={statLabelStyle}>Total Events</div>
                </div>
                <div style={statCardStyle}>
                  <div style={statValueStyle}>{stats.totalPicks}</div>
                  <div style={statLabelStyle}>Total Picks Submitted</div>
                </div>
              </div>
            )}

            <div style={{ marginTop: "2rem", opacity: 0.6, fontSize: "0.85rem" }}>
              <p>Statistics are calculated from the PostgreSQL database.</p>
              <p style={{ marginTop: "0.5rem" }}>
                To refresh, switch to another tab and back to Statistics.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer style={footerStyle}>
        <p style={{ opacity: 0.5, fontSize: "0.75rem" }}>
          Admin panel • WrestleGuess prototype
        </p>
      </footer>

      {/* Mobile Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          * {
            box-sizing: border-box;
          }
        }
      `}</style>
    </div>
  );
}

/* ---------- STYLES ---------- */

const fullScreenStyle = {
  minHeight: "100vh",
  height: "100%",
  width: "100%",
  margin: 0,
  padding: 0,
  backgroundColor: "#0b0b10",
  color: "white",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
};

const screenStyle = {
  minHeight: "100vh",
  backgroundColor: "#0b0b10",
  color: "white",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  padding: "2rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const headerStyle = {
  width: "100%",
  background: "#1a1a22",
  borderBottom: "2px solid #2f2f44",
  padding: "1rem 1.5rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "0.75rem",
};

const headerTitleStyle = {
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#ffd600",
  margin: 0,
  "@media (max-width: 640px)": {
    fontSize: "1.25rem",
  },
};

const backLinkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "0.9rem",
  opacity: 0.8,
  transition: "opacity 0.2s",
};

const tabNavStyle = {
  width: "100%",
  background: "#0f0f16",
  borderBottom: "1px solid #2f2f44",
  padding: "0 1.5rem",
  display: "flex",
  gap: "0.5rem",
  overflowX: "auto",
};

const tabButtonStyle = {
  appearance: "none",
  border: "none",
  background: "transparent",
  color: "white",
  padding: "1rem 1.5rem",
  fontSize: "0.9rem",
  fontWeight: 500,
  cursor: "pointer",
  opacity: 0.6,
  borderBottom: "3px solid transparent",
  transition: "all 0.2s",
  whiteSpace: "nowrap",
};

const tabButtonActiveStyle = {
  opacity: 1,
  borderBottomColor: "#ffd600",
};

const contentAreaStyle = {
  padding: "2rem 1.5rem",
  width: "100%",
  flex: 1,
  backgroundColor: "#0b0b10",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "1.5rem",
  flexWrap: "wrap",
  gap: "1rem",
};

const sectionTitleStyle = {
  fontSize: "1.25rem",
  fontWeight: 600,
  margin: "0 0 1.5rem 0",
};

const filterGroupStyle = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
};

const filterButtonStyle = {
  appearance: "none",
  border: "1px solid #3a3a55",
  borderRadius: "0.4rem",
  padding: "0.5rem 1rem",
  background: "#1a1a22",
  color: "white",
  fontSize: "0.85rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
};

const filterButtonActiveStyle = {
  background: "#ffd600",
  color: "#000",
  borderColor: "#ffd600",
};

const emptyStateStyle = {
  background: "#1a1a22",
  border: "1px solid #2f2f44",
  borderRadius: "0.75rem",
  padding: "3rem 2rem",
  textAlign: "center",
  fontSize: "0.95rem",
  opacity: 0.7,
};

const tableContainerStyle = {
  overflowX: "auto",
  width: "100%",
  background: "#1a1a22",
  borderRadius: "0.75rem",
  border: "1px solid #2f2f44",
};

const tableStyle = {
  width: "100%",
  minWidth: "800px",
  borderCollapse: "collapse",
};

const tableHeaderRowStyle = {
  borderBottom: "2px solid #2f2f44",
};

const tableHeaderCellStyle = {
  padding: "1rem",
  textAlign: "left",
  fontSize: "0.8rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  opacity: 0.8,
};

const tableRowStyle = {
  borderBottom: "1px solid #2f2f44",
  transition: "background 0.2s",
};

const tableCellStyle = {
  padding: "1rem",
  fontSize: "0.9rem",
};

const statusBadgeStyle = {
  fontSize: "0.7rem",
  padding: "0.25rem 0.5rem",
  borderRadius: "0.3rem",
  fontWeight: 600,
  display: "inline-block",
};

const actionsGroupStyle = {
  display: "flex",
  gap: "0.5rem",
  alignItems: "center",
};

const actionButtonStyle = {
  appearance: "none",
  border: "none",
  borderRadius: "0.4rem",
  padding: "0.5rem 0.75rem",
  fontSize: "0.9rem",
  cursor: "pointer",
  transition: "all 0.2s",
  color: "#000",
  fontWeight: 600,
};

const confirmDeleteStyle = {
  display: "flex",
  gap: "0.25rem",
};

const statusBoxStyle = {
  background: "#1f1f29",
  border: "1px solid #3a3a55",
  borderRadius: "0.75rem",
  padding: "1rem",
  fontSize: "0.9rem",
  marginBottom: "1.5rem",
  lineHeight: 1.5,
};

const labelStyle = {
  display: "grid",
  gap: "0.5rem",
};

const labelTextStyle = {
  fontSize: "0.85rem",
  fontWeight: 500,
  opacity: 0.9,
};

const inputStyle = {
  width: "100%",
  background: "#0f0f16",
  border: "1px solid #3a3a55",
  borderRadius: "0.6rem",
  padding: "0.75rem 1rem",
  fontSize: "0.9rem",
  lineHeight: 1.4,
  color: "#fff",
  outline: "none",
};

const primaryButtonStyle = {
  appearance: "none",
  border: "0",
  borderRadius: "0.6rem",
  padding: "0.85rem 1.5rem",
  background:
    "radial-gradient(circle at 20% 20%, rgba(255,214,0,1) 0%, rgba(255,132,0,1) 60%, rgba(170,60,0,1) 100%)",
  fontWeight: 600,
  fontSize: "0.95rem",
  color: "#000",
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.2s",
};

const secondaryButtonStyle = {
  appearance: "none",
  border: "1px solid #3a3a55",
  borderRadius: "0.6rem",
  padding: "0.85rem 1.5rem",
  background: "#3a3a55",
  fontWeight: 600,
  fontSize: "0.95rem",
  color: "#fff",
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.2s",
};

const matchCardStyle = {
  background: "#0f0f16",
  border: "1px solid #3a3a55",
  borderRadius: "0.6rem",
  padding: "1rem",
};

const matchBuilderCardStyle = {
  background: "#0f0f16",
  border: "1px solid #3a3a55",
  borderRadius: "0.6rem",
  padding: "1rem",
  marginTop: "0.75rem",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "1.5rem",
  marginTop: "1.5rem",
};

const statCardStyle = {
  background: "#1a1a22",
  border: "1px solid #2f2f44",
  borderRadius: "0.75rem",
  padding: "2rem",
  textAlign: "center",
};

const statValueStyle = {
  fontSize: "3rem",
  fontWeight: 700,
  color: "#ffd600",
  marginBottom: "0.5rem",
};

const statLabelStyle = {
  fontSize: "0.9rem",
  opacity: 0.7,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const footerStyle = {
  width: "100%",
  borderTop: "1px solid #2f2f44",
  padding: "1.5rem",
  textAlign: "center",
  backgroundColor: "#0b0b10",
  marginTop: "auto",
};
