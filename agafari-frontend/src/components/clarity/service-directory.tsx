"use client";

import { useMemo, useState } from "react";
import { ServiceCard } from "@/components/clarity/service-card";
import { useSite } from "@/components/clarity/site-context";
import type { Service } from "@/lib/types";

export function ServiceDirectory({ services }: { services: Service[] }) {
  const { href, terminology, organization } = useSite();
  const [category, setCategory] = useState("ALL");
  const [query, setQuery] = useState("");

  const categories = useMemo(
    () => ["ALL", ...Array.from(new Set(services.map((item) => item.category)))],
    [services],
  );

  const visible = services.filter((service) => {
    const matchesCategory = category === "ALL" || service.category === category;
    const needle = query.trim().toLowerCase();
    const matchesQuery =
      !needle ||
      service.title.toLowerCase().includes(needle) ||
      service.summary.toLowerCase().includes(needle);
    return matchesCategory && matchesQuery;
  });

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: "1.25rem",
        }}
      >
        <input
          className="c-input"
          style={{ maxWidth: "320px" }}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${terminology.pluralLower}`}
          aria-label={`Search ${terminology.pluralLower}`}
          type="search"
        />
        {categories.length > 2 && (
          <div className="c-filter-bar" style={{ marginBottom: 0 }}>
            {categories.map((item) => (
              <button
                type="button"
                key={item}
                className="c-chip"
                data-active={category === item}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item === "ALL" ? "All" : item}
              </button>
            ))}
          </div>
        )}
      </div>

      {visible.length > 0 ? (
        <div className="c-grid">
          {visible.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              href={href(`/services/${service.slug}`)}
            />
          ))}
        </div>
      ) : (
        <div className="c-empty">
          <h3>No matches</h3>
          <p>
            No {terminology.pluralLower} from {organization.name} match that
            search. Try a different word or clear the filters.
          </p>
          <button
            type="button"
            className="c-button c-button-secondary c-button-sm"
            onClick={() => {
              setQuery("");
              setCategory("ALL");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
