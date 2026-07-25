"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { OrganizationCard } from "@/components/organization-card";
import type { Organization } from "@/lib/types";

export function DirectoryClient({
  organizations,
  unavailable = false,
}: {
  organizations: Organization[];
  unavailable?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [sector, setSector] = useState(searchParams.get("sector") ?? "All");
  const sectors = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(organizations.map((organization) => organization.sector)),
      ).sort(),
    ],
    [organizations],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return organizations.filter((organization) => {
      const matchesQuery =
        !normalized ||
        organization.name.toLowerCase().includes(normalized) ||
        organization.description?.toLowerCase().includes(normalized) ||
        organization.sector.toLowerCase().includes(normalized);
      const matchesSector = sector === "All" || organization.sector === sector;
      return matchesQuery && matchesSector;
    });
  }, [organizations, query, sector]);

  function updateUrl(nextQuery: string, nextSector: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    else params.delete("q");
    if (nextSector !== "All") params.set("sector", nextSector);
    else params.delete("sector");
    const suffix = params.toString();
    router.replace(suffix ? `${pathname}?${suffix}` : pathname, {
      scroll: false,
    });
  }

  if (unavailable) {
    return (
      <div className="error-panel" role="alert">
        <h2>Live demos could not be loaded</h2>
        <p>
          Demo previews are temporarily unavailable. Check that the Agafari API
          is running, then try again.
        </p>
        <button
          className="button button-secondary"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="directory-controls">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              updateUrl(event.target.value, sector);
            }}
            placeholder="Search demos or sectors"
            aria-label="Search live demos"
          />
        </label>
        <select
          className="filter-select"
          value={sector}
          aria-label="Filter demos by sector"
          onChange={(event) => {
            setSector(event.target.value);
            updateUrl(query, event.target.value);
          }}
        >
          {sectors.map((item) => (
            <option value={item} key={item}>
              {item === "All" ? "All sectors" : item}
            </option>
          ))}
        </select>
      </div>

      <p className="result-count" aria-live="polite">
        {filtered.length}{" "}
        {filtered.length === 1 ? "live demo" : "live demos"}
      </p>

      {filtered.length ? (
        <div className="organization-grid">
          {filtered.map((organization) => (
            <OrganizationCard
              organization={organization}
              key={organization.id}
            />
          ))}
        </div>
      ) : (
        <div className="empty-panel">
          <h2>No matching demo</h2>
          <p>Try a different name, keyword, or sector.</p>
          <button
            className="button button-secondary"
            onClick={() => {
              setQuery("");
              setSector("All");
              updateUrl("", "All");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
