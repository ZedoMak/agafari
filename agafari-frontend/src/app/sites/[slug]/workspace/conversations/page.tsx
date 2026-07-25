"use client";

import { useState } from "react";
import { useWorkspace } from "@/components/clarity/workspace-shell";
import {
  EmptyPanel,
  ErrorPanel,
  LoadingRows,
  PageIntro,
  StatusBadge,
  relativeTime,
} from "@/components/clarity/workspace-ui";
import { listConversations } from "@/lib/clarity/client";
import { useAsync } from "@/lib/clarity/use-async";

type Scope = "ALL" | "PUBLIC" | "INTERNAL";

export default function ConversationsPage() {
  const { token } = useWorkspace();
  const [scope, setScope] = useState<Scope>("ALL");
  const conversations = useAsync(
    () => listConversations(token, scope === "ALL" ? undefined : scope),
    [token, scope],
  );

  return (
    <>
      <PageIntro
        title="Conversations"
        description="The most recent exchanges with the assistant, on the public site and inside the workspace. Read these to see where the wording of your documents is letting people down."
        actions={
          <div className="c-tabs" role="tablist" aria-label="Conversation scope">
            {(["ALL", "PUBLIC", "INTERNAL"] as const).map((value) => (
              <button
                key={value}
                role="tab"
                aria-selected={scope === value}
                onClick={() => setScope(value)}
              >
                {value === "ALL" ? "All" : value.toLowerCase()}
              </button>
            ))}
          </div>
        }
      />

      {conversations.loading && !conversations.data ? (
        <LoadingRows count={4} />
      ) : conversations.error ? (
        <ErrorPanel message={conversations.error} onRetry={conversations.reload} />
      ) : (conversations.data ?? []).length === 0 ? (
        <EmptyPanel
          title="No conversations yet"
          body="Every question asked on your site or in this workspace is recorded here."
        />
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {(conversations.data ?? []).map((conversation) => (
            <article className="c-panel" key={conversation.id}>
              <div className="c-panel-head">
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  <StatusBadge value={conversation.scope} />
                  {conversation.department && (
                    <span className="c-badge">{conversation.department}</span>
                  )}
                </div>
                <span className="c-small c-muted">
                  {relativeTime(conversation.updated_at)}
                </span>
              </div>
              <div className="c-list">
                {conversation.messages.length === 0 ? (
                  <div className="c-list-item">
                    <span className="c-small c-muted">No messages recorded.</span>
                  </div>
                ) : (
                  conversation.messages.map((message) => (
                    <div className="c-list-item" key={message.id}>
                      <div className="c-list-item-main">
                        <strong style={{ fontSize: "0.75rem", color: "var(--c-muted)" }}>
                          {message.role === "user" ? "Question" : "Assistant"}
                        </strong>
                        <p className="c-clamp-3" style={{ color: "var(--c-ink-soft)" }}>
                          {message.content}
                        </p>
                        {message.citations?.length > 0 && (
                          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                            {message.citations.map((citation, index) => (
                              <span
                                className="c-badge"
                                key={`${citation.source_id ?? "source"}-${index}`}
                              >
                                {citation.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="c-list-actions">
                        {message.answer_status && (
                          <StatusBadge value={message.answer_status} />
                        )}
                        {message.feedback && (
                          <span className="c-badge">
                            {message.feedback === "HELPFUL" ? "Marked helpful" : "Not helpful"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
