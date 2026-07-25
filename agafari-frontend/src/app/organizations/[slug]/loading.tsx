import { SiteHeader } from "@/components/site-header";

export default function OrganizationLoading() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="organization-hero">
          <div className="container org-hero-grid">
            <div className="org-identity">
              <div
                className="skeleton"
                style={{ width: 74, height: 74, borderRadius: 18 }}
              />
              <div>
                <div className="skeleton" style={{ width: 90, height: 18 }} />
                <div
                  className="skeleton"
                  style={{ width: 320, height: 50, marginTop: 12 }}
                />
                <div
                  className="skeleton"
                  style={{ width: 440, maxWidth: "70vw", height: 20, marginTop: 12 }}
                />
              </div>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container service-grid">
            {[1, 2].map((item) => (
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
