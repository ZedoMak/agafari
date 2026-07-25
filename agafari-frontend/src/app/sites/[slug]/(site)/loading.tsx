export default function SiteLoading() {
  return (
    <section className="c-section" aria-busy="true" aria-label="Loading">
      <div className="c-container" style={{ display: "grid", gap: "1rem" }}>
        <div className="c-skeleton" style={{ height: 32, width: "38%" }} />
        <div className="c-skeleton" style={{ height: 16, width: "62%" }} />
        <div className="c-grid" style={{ marginTop: "1.5rem" }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="c-skeleton" style={{ height: 168 }} />
          ))}
        </div>
      </div>
    </section>
  );
}
