// src/PickEventPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getCurrentUserOrNull } from "./authSignIn";
import { getEvent } from "./api/events.js";
import { getPicksForEvent, submitPicks } from "./api/picks.js";
import NavBar from "./NavBar";
import colors from "./theme";

export default function PickEventPage() {
  const { eventId } = useParams();

  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState(null);
  const [choices, setChoices] = useState({});     // { [matchId]: { winner: "Name", confidence: 20 } }
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [isLegacyPick, setIsLegacyPick] = useState(false);

  // Load event, matches, and existing picks
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setStatus("");

        // 1) get authenticated user
        const u = await getCurrentUserOrNull();
        if (!u) {
          setStatus("Not authenticated. Please log in.");
          setLoading(false);
          return;
        }
        setUser(u);

        // 2) event
        const ev = await getEvent(eventId);
        if (!ev) {
          setEventData(null);
          setStatus(`No such event: ${eventId}`);
          setLoading(false);
          return;
        }

        // 3) matches are embedded in event from API
        const matches = Array.isArray(ev.matches) ? ev.matches : [];

        // 4) existing picks
        let existingChoices = {};
        let isLegacy = false;

        try {
          const pickData = await getPicksForEvent(eventId);
          if (pickData?.choices) {
            // Convert array format to object format if needed
            if (Array.isArray(pickData.choices)) {
              pickData.choices.forEach(choice => {
                existingChoices[choice.matchId] = {
                  winner: choice.winner,
                  confidence: choice.confidence || 0
                };
              });
            } else if (typeof pickData.choices === "object") {
              // Check if it's v1 (string values) or v2 (object values)
              const firstValue = Object.values(pickData.choices)[0];
              if (typeof firstValue === "string") {
                // v1 format - convert to read-only display format
                isLegacy = true;
                Object.keys(pickData.choices).forEach(matchId => {
                  existingChoices[matchId] = {
                    winner: pickData.choices[matchId],
                    confidence: 0
                  };
                });
              } else {
                // v2 format - use as-is
                existingChoices = pickData.choices;
              }
            }
          }
        } catch {
          // No existing picks - that's fine
        }

        setIsLegacyPick(isLegacy);
        setChoices(existingChoices);
        setEventData({ ...ev, matches });
      } catch (e) {
        console.error(e);
        setStatus(e.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId]);

  const locked = eventData?.locked === true;
  const eventDate = useMemo(
    () =>
      eventData?.date?.toDate
        ? eventData.date.toDate()
        : new Date(eventData?.date || Date.now()),
    [eventData]
  );

  // Calculate total confidence allocated
  const totalConfidence = useMemo(() => {
    return Object.values(choices).reduce((sum, choice) => {
      return sum + (choice?.confidence || 0);
    }, 0);
  }, [choices]);

  const remainingConfidence = 100 - totalConfidence;

  function setPick(matchId, wrestlerName) {
    setChoices((prev) => ({
      ...prev,
      [matchId]: {
        winner: wrestlerName,
        confidence: prev[matchId]?.confidence || 0
      }
    }));
  }

  function setConfidence(matchId, value) {
    const numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    setChoices((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        confidence: numValue
      }
    }));
  }

  async function handleSavePicks() {
    try {
      if (!user || !eventData) return;

      // Validation: Check all matches have picks
      const allMatchesPicked = eventData.matches.every(m =>
        choices[m.matchId]?.winner
      );

      if (!allMatchesPicked) {
        setStatus("Please make a pick for every match before saving.");
        return;
      }

      // Validation: Check exactly 100 confidence points allocated
      if (totalConfidence !== 100) {
        setStatus(`You must allocate exactly 100 confidence points. Currently: ${totalConfidence}`);
        return;
      }

      setSaving(true);
      setStatus("Saving picks…");

      await submitPicks({
        eventId,
        choices,
        totalConfidence,
      });

      setStatus("Picks saved successfully!");
    } catch (e) {
      console.error(e);
      setStatus(`Error saving picks: ${e.message || e}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <NavBar />
        <div style={pageStyle}>
          <div style={containerStyle}>
            <div style={loadingStyle}>Loading event...</div>
          </div>
        </div>
      </>
    );
  }

  if (!eventData) {
    return (
      <>
        <NavBar />
        <div style={pageStyle}>
          <div style={containerStyle}>
            <h1 style={titleStyle}>Make Your Picks</h1>
            <div style={errorStyle}>{status || "Event not found."}</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div style={pageStyle}>
        <div style={containerStyle}>
          <h1 style={titleStyle}>{eventData.name || "Make Your Picks"}</h1>
          <p style={subtitleStyle}>
            {eventData.brand || "Wrestling"} • {isNaN(eventDate) ? "Date TBD" : eventDate.toLocaleDateString()}
          </p>

          {/* Status Messages */}
          {status && (
            <div style={statusStyle}>
              {status}
            </div>
          )}

          {locked && (
            <div style={warningStyle}>
              🔒 This event is locked. Picks are closed.
            </div>
          )}

          {isLegacyPick && (
            <div style={infoStyle}>
              These are old-format picks. To update them with confidence points, please make new picks.
            </div>
          )}

          {/* Budget Tracker */}
          {!locked && !isLegacyPick && (
            <div style={budgetTrackerStyle}>
              <div style={budgetHeaderStyle}>
                <span style={budgetLabelStyle}>Confidence Budget:</span>
                <span style={{
                  ...budgetValueStyle,
                  color: remainingConfidence === 0 ? "#22c55e" : (remainingConfidence < 0 ? "#ef4444" : colors.primary)
                }}>
                  {remainingConfidence} / 100 remaining
                </span>
              </div>
              <div style={progressBarContainerStyle}>
                <div style={{
                  ...progressBarFillStyle,
                  width: `${Math.min(100, totalConfidence)}%`,
                  background: totalConfidence === 100 ? "#22c55e" : (totalConfidence > 100 ? "#ef4444" : colors.primary)
                }} />
              </div>
              <div style={budgetHintStyle}>
                Allocate exactly 100 points across all matches
              </div>
            </div>
          )}

          {/* Matches */}
          <div style={matchesContainerStyle}>
            {Array.isArray(eventData.matches) && eventData.matches.length > 0 ? (
              eventData.matches.map((m, idx) => {
                const currentChoice = choices[m.matchId] || null;
                const currentWinner = currentChoice?.winner || null;
                const currentConfidence = currentChoice?.confidence || 0;
                const competitors = Array.isArray(m.competitors) ? m.competitors : [];
                const multiplier = m.multiplier || 1.0;

                return (
                  <div key={m.matchId || `m-${idx}`} style={matchCardStyle}>
                    {/* Match Header */}
                    <div style={matchHeaderStyle}>
                      <div style={matchTypeStyle}>
                        {m.type || "Match"}
                        {m.titleMatch && " • Title Match"}
                      </div>
                      {multiplier !== 1.0 && (
                        <div style={multiplierBadgeStyle}>
                          {multiplier}x
                        </div>
                      )}
                    </div>

                    {/* Competitor Buttons */}
                    <div style={competitorsGridStyle}>
                      {competitors.map((name) => (
                        <button
                          key={name}
                          onClick={() => {
                            if (!locked && !isLegacyPick) setPick(m.matchId, name);
                          }}
                          style={{
                            ...pickButtonStyle,
                            ...(currentWinner === name ? pickButtonSelectedStyle : {}),
                            ...(locked || isLegacyPick ? pickButtonLockedStyle : {}),
                          }}
                          onMouseEnter={(e) => {
                            if (!locked && !isLegacyPick && currentWinner !== name) {
                              e.target.style.borderColor = colors.primary;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentWinner !== name) {
                              e.target.style.borderColor = colors.borderColor;
                            }
                          }}
                        >
                          <div style={competitorNameStyle}>{name}</div>
                          {currentWinner === name && (
                            <div style={selectedIndicatorStyle}>
                              ✓ Your Pick
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Confidence allocation - only show if winner selected and not locked/legacy */}
                    {currentWinner && !locked && !isLegacyPick && (
                      <div style={confidenceContainerStyle}>
                        <div style={confidenceLabelStyle}>
                          Confidence Points:
                        </div>
                        <div style={confidenceInputsStyle}>
                          <input
                            type="range"
                            min="0"
                            max={Math.min(100, remainingConfidence + currentConfidence)}
                            value={currentConfidence}
                            onChange={(e) => setConfidence(m.matchId, e.target.value)}
                            style={rangeInputStyle}
                          />
                          <input
                            type="number"
                            min="0"
                            max={Math.min(100, remainingConfidence + currentConfidence)}
                            value={currentConfidence}
                            onChange={(e) => setConfidence(m.matchId, e.target.value)}
                            style={numberInputStyle}
                          />
                        </div>
                        {currentConfidence > 0 && multiplier !== 1.0 && (
                          <div style={potentialPointsStyle}>
                            Potential points: {currentConfidence} × {multiplier} = <strong>{(currentConfidence * multiplier).toFixed(1)}</strong>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={noMatchesStyle}>
                No matches found for this event.
              </div>
            )}
          </div>

          {/* Save Button */}
          {!locked && !isLegacyPick && (
            <button
              style={{
                ...saveButtonStyle,
                opacity: saving ? 0.7 : 1,
                cursor: saving ? "wait" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = `0 8px 20px ${colors.primary}60`;
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = `0 4px 12px ${colors.primary}40`;
              }}
              onClick={handleSavePicks}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save My Picks"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

/* ---------- STYLES ---------- */

const pageStyle = {
  minHeight: "calc(100vh - 60px)",
  background: "#F8F8F8",
  fontFamily: '"Roboto", sans-serif',
  padding: "3rem 2rem",
};

const containerStyle = {
  maxWidth: "800px",
  margin: "0 auto",
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
  marginBottom: "2rem",
};

const loadingStyle = {
  textAlign: "center",
  padding: "4rem 2rem",
  fontSize: "1.1rem",
  color: colors.textColor,
  opacity: 0.6,
};

const errorStyle = {
  background: "#fee2e2",
  border: "1px solid #ef4444",
  borderRadius: "8px",
  padding: "1rem",
  fontSize: "1rem",
  color: "#dc2626",
  textAlign: "center",
};

const statusStyle = {
  background: colors.background,
  border: `2px solid ${colors.primary}`,
  borderRadius: "8px",
  padding: "1rem",
  fontSize: "0.95rem",
  marginBottom: "1.5rem",
  textAlign: "center",
  color: colors.textColor,
  fontWeight: 500,
};

const warningStyle = {
  background: "#fee2e2",
  border: "1px solid #ef4444",
  borderRadius: "8px",
  padding: "1rem",
  fontSize: "0.95rem",
  marginBottom: "1.5rem",
  textAlign: "center",
  color: "#dc2626",
  fontWeight: 500,
};

const infoStyle = {
  background: "#dbeafe",
  border: "1px solid #3b82f6",
  borderRadius: "8px",
  padding: "1rem",
  fontSize: "0.95rem",
  marginBottom: "1.5rem",
  textAlign: "center",
  color: "#1e40af",
  fontWeight: 500,
};

const budgetTrackerStyle = {
  background: colors.background,
  border: `2px solid ${colors.primary}`,
  borderRadius: "12px",
  padding: "1.5rem",
  marginBottom: "2rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const budgetHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "0.75rem",
};

const budgetLabelStyle = {
  fontSize: "1rem",
  fontWeight: 600,
  color: colors.textColor,
};

const budgetValueStyle = {
  fontSize: "1.1rem",
  fontWeight: 700,
};

const progressBarContainerStyle = {
  width: "100%",
  height: "1rem",
  background: "#E5E5E5",
  borderRadius: "0.5rem",
  overflow: "hidden",
  marginBottom: "0.75rem",
};

const progressBarFillStyle = {
  height: "100%",
  transition: "width 0.3s ease, background 0.3s ease",
  borderRadius: "0.5rem",
};

const budgetHintStyle = {
  fontSize: "0.85rem",
  color: colors.textColor,
  opacity: 0.7,
  textAlign: "center",
  fontStyle: "italic",
};

const matchesContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  marginBottom: "2rem",
};

const matchCardStyle = {
  background: colors.background,
  border: `1px solid ${colors.borderColor}`,
  borderRadius: "12px",
  padding: "1.5rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const matchHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem",
  paddingBottom: "0.75rem",
  borderBottom: `1px solid ${colors.borderColor}`,
};

const matchTypeStyle = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: colors.textColor,
  opacity: 0.8,
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};

const multiplierBadgeStyle = {
  background: colors.primary,
  color: colors.buttonText,
  fontSize: "0.8rem",
  fontWeight: 700,
  padding: "0.35rem 0.75rem",
  borderRadius: "4px",
};

const competitorsGridStyle = {
  display: "grid",
  gap: "0.75rem",
  marginBottom: "0.5rem",
};

const pickButtonStyle = {
  appearance: "none",
  border: `2px solid ${colors.borderColor}`,
  borderRadius: "8px",
  background: colors.background,
  color: colors.textColor,
  textAlign: "left",
  padding: "1rem 1.25rem",
  fontSize: "1rem",
  lineHeight: 1.4,
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const pickButtonSelectedStyle = {
  border: `2px solid ${colors.primary}`,
  background: `${colors.primary}10`,
  boxShadow: `0 0 16px ${colors.primary}40`,
};

const pickButtonLockedStyle = {
  opacity: 0.5,
  cursor: "not-allowed",
};

const competitorNameStyle = {
  fontWeight: 600,
  fontSize: "1.05rem",
  color: colors.textColor,
};

const selectedIndicatorStyle = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: colors.primary,
};

const confidenceContainerStyle = {
  marginTop: "1rem",
  paddingTop: "1rem",
  borderTop: `1px solid ${colors.borderColor}`,
};

const confidenceLabelStyle = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: colors.textColor,
  marginBottom: "0.75rem",
};

const confidenceInputsStyle = {
  display: "flex",
  gap: "1rem",
  alignItems: "center",
};

const rangeInputStyle = {
  flex: 1,
  height: "0.5rem",
  appearance: "none",
  background: colors.borderColor,
  borderRadius: "0.25rem",
  outline: "none",
  cursor: "pointer",
};

const numberInputStyle = {
  width: "5rem",
  background: colors.background,
  border: `2px solid ${colors.borderColor}`,
  borderRadius: "6px",
  padding: "0.6rem",
  fontSize: "1rem",
  color: colors.textColor,
  textAlign: "center",
  outline: "none",
  fontWeight: 600,
};

const potentialPointsStyle = {
  fontSize: "0.85rem",
  color: colors.textColor,
  opacity: 0.7,
  marginTop: "0.5rem",
};

const noMatchesStyle = {
  background: colors.background,
  borderRadius: "12px",
  border: `1px solid ${colors.borderColor}`,
  padding: "3rem 2rem",
  textAlign: "center",
  color: colors.textColor,
  opacity: 0.6,
};

const saveButtonStyle = {
  appearance: "none",
  border: "none",
  width: "100%",
  borderRadius: "8px",
  padding: "1.2rem",
  background: `linear-gradient(135deg, ${colors.buttonGradientStart}, ${colors.buttonGradientEnd})`,
  fontFamily: '"Bebas Neue", "Impact", sans-serif',
  fontWeight: 700,
  fontSize: "1.3rem",
  color: colors.buttonText,
  textAlign: "center",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: `0 4px 12px ${colors.primary}40`,
};
