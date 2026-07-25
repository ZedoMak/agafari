"use client";

import { SiteHeader } from "@/components/site-header";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <SiteHeader />
      <main className="section">
        <div className="narrow-container">
          <div className="error-panel" role="alert">
            <h2>This page could not be loaded</h2>
            <p>
              The problem may be temporary. Try again or return to the
              organization directory.
            </p>
            <button className="button button-primary" onClick={reset}>
              Try again
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
