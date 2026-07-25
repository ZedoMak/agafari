export function HeroStack() {
  return (
    <div className="hero-stack" aria-label="Product preview">
      <div className="hero-stack-frame hero-stack-site reveal-up">
        <div className="browser-chrome">
          <span />
          <span />
          <span />
          <em>your-org.agafari.com</em>
        </div>
        <div className="hero-stack-site-body">
          <div className="hs-nav">
            <b>Northwind Services</b>
            <span>Programs</span>
            <span>Ask AI</span>
          </div>
          <div className="hs-hero">
            <small>Public website</small>
            <strong>Clear answers for every service</strong>
            <p>Browse programs and ask questions grounded in your docs.</p>
          </div>
          <div className="hs-grid">
            <div>
              <b>Livelihood Grant</b>
              <span>20 working days</span>
            </div>
            <div>
              <b>Training Access</b>
              <span>Open intake</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-stack-frame hero-stack-dash reveal-up delay-1">
        <div className="browser-chrome">
          <span />
          <span />
          <span />
          <em>Dashboard</em>
        </div>
        <div className="hero-stack-dash-body">
          <aside>
            <b>Overview</b>
            <span>Services</span>
            <span>Documents</span>
            <span>Insights</span>
          </aside>
          <main>
            <strong>Knowledge control</strong>
            <div className="hs-bars">
              <i style={{ width: "78%" }} />
              <i style={{ width: "54%" }} />
              <i style={{ width: "66%" }} />
            </div>
            <div className="hs-pill">PUBLIC · APPROVED</div>
          </main>
        </div>
      </div>

      <div className="hero-stack-frame hero-stack-chat reveal-up delay-2">
        <div className="browser-chrome">
          <span />
          <span />
          <span />
          <em>AI assistant</em>
        </div>
        <div className="hero-stack-chat-body">
          <div className="hs-bubble user">What documents do I need?</div>
          <div className="hs-bubble bot">
            A recognition letter, project plan, and budget.
            <small>↗ Public program guide</small>
          </div>
        </div>
      </div>
    </div>
  );
}
