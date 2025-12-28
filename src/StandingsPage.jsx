import { useParams } from "react-router-dom";

export default function StandingsPage() {
  const { leagueId } = useParams();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0b0b10",
        color: "white",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "1.5rem",
        maxWidth: "480px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: "1.1rem",
          fontWeight: 600,
          marginBottom: "1rem",
          textAlign: "center",
        }}
      >
        League Standings
      </h1>

      <div
        style={{
          background: "#1a1a22",
          border: "1px solid #2f2f44",
          borderRadius: "0.75rem",
          padding: "1rem",
          fontSize: "0.9rem",
          lineHeight: 1.4,
        }}
      >
        Standings for league:
        <div
          style={{
            fontWeight: 600,
            marginTop: "0.5rem",
            fontSize: "0.8rem",
            color: "#ffd600",
          }}
        >
          {leagueId}
        </div>

        <div style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "0.75rem" }}>
          (this will show point totals once we implement scoring)
        </div>
      </div>
    </div>
  );
}
