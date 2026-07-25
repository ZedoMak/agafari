import { SiteHeader } from "@/components/site-header";

export default function OrganizationsLoading() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero">
          <div className="container">
            <div className="skeleton" style={{ width: 170, height: 16 }} />
            <div
              className="skeleton"
              style={{ width: "min(680px, 100%)", height: 62, marginTop: 20 }}
            />
            <div
              className="skeleton"
              style={{ width: "min(520px, 90%)", height: 24, marginTop: 18 }}
            />
          </div>
        </section>
        <section className="section">
          <div className="container organization-grid">
            {[1, 2, 3].map((item) => (
              <div
                className="skeleton"
                style={{ height: 310, borderRadius: 18 }}
                key={item}
              />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
