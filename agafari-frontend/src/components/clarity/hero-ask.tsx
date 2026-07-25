"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSite } from "@/components/clarity/site-context";

export function HeroAsk({ suggestions }: { suggestions: string[] }) {
  const { href, organization } = useSite();
  const router = useRouter();
  const [question, setQuestion] = useState("");

  function goToAssistant(value: string) {
    const query = value.trim();
    router.push(href(`/ask${query ? `?q=${encodeURIComponent(query)}` : ""}`));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    goToAssistant(question);
  }

  return (
    <>
      <form className="c-hero-ask" onSubmit={handleSubmit} role="search">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={`Ask ${organization.name} a question…`}
          aria-label={`Ask ${organization.name} a question`}
          maxLength={4000}
        />
        <button className="c-button c-button-primary c-button-lg" type="submit">
          Ask
        </button>
      </form>
      {suggestions.length > 0 && (
        <div className="c-hero-suggestions">
          {suggestions.map((suggestion) => (
            <button
              type="button"
              className="c-chip"
              key={suggestion}
              onClick={() => goToAssistant(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
