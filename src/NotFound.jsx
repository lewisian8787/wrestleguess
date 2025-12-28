export default function NotFound() {
  return (
    <div style={{ padding: 32, textAlign: "center" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Page not found</h1>
      <p style={{ marginBottom: 16 }}>The page you’re looking for doesn’t exist.</p>
      <a href="/home" style={{ textDecoration: "underline" }}>Go to Home</a>
    </div>
  );
}
