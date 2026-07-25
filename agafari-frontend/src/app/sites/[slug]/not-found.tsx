export default function TenantNotFound() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "42ch", display: "grid", gap: "0.75rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>This site is not available</h1>
        <p style={{ color: "#5f706a", margin: 0 }}>
          The organization you are looking for is not published, or the address is
          misspelled. Check the link you were given and try again.
        </p>
      </div>
    </main>
  );
}
