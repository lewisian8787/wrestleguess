export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0b0b10",
        color: "white",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "2rem",
        maxWidth: "480px",
        margin: "0 auto",
        lineHeight: 1.4,
      }}
    >
      <h1 style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: "1rem" }}>
        WrestleGuess
      </h1>

      <p style={{ fontSize: "1rem", opacity: 0.9, marginBottom: "1rem" }}>
        Pick the winners of every wrestling PPV.
        Score points. Beat your friends. Talk trash.
      </p>

      <a
        href="/home"
        style={{
          display: "inline-block",
          textDecoration: "none",
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,214,0,1) 0%, rgba(255,132,0,1) 60%, rgba(170,60,0,1) 100%)",
          color: "#000",
          fontWeight: 600,
          fontSize: "1rem",
          padding: "0.9rem 1rem",
          borderRadius: "0.75rem",
          border: "0",
        }}
      >
        Play Now →
      </a>

      <p
        style={{
          fontSize: "0.7rem",
          opacity: 0.5,
          marginTop: "2rem",
        }}
      >
        Free to play. No betting. Bragging rights only.
      </p>
    </div>
  );
}
