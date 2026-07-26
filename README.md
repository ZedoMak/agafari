# AGAFARI (አጋፋሪ)

Agafari sells organizations a hosted website with an AI assistant built in. An
organization picks a template, customizes it, uploads its documents, and gets a
site that serves its own visitors — while its team manages everything from an
admin panel we host.

```
agafari.com                    the product: templates, pricing, demos
agafari.com/admin              where an organization's staff manage their site
hope-aid.agafari.com           that organization's site, serving its own visitors
```

## What an organization's site does

It brings scattered information into one place that only ever speaks for that
organization:

- explains who they are and what they offer
- lists every service with its steps, required documents, fees, and timelines
- answers questions from their approved public documents, with citations
- announces changes to policies, rules, and fees as they happen
- collects feedback and complaints privately

## What their team gets

A separate admin panel on Agafari's domain, so nothing operational appears on
their public site:

- publish and edit services, and regenerate their procedure steps
- upload documents and approve what the assistant may quote
- review changes detected in new documents, then publish a public notice
- a staff assistant that also reads internal-only documents
- every conversation, complaint, and unanswered question

## Two assistants, one boundary

Both use the same retrieval pipeline over the organization's own content, and
the boundary between them is enforced in SQL, not in a prompt:

| | Reads | Used by |
| --- | --- | --- |
| Public assistant | documents marked `PUBLIC` and approved | visitors, on the organization's site |
| Staff assistant | `PUBLIC` plus `INTERNAL`, approved | staff, in the admin panel |

Retrieval is hybrid: pgvector cosine similarity fused with keyword matching
(reciprocal rank fusion), reranked, then answered by a language model that is
given only the retrieved text. Every answer carries the documents it came from,
and the assistant says it does not know rather than guessing. If the language
model is unreachable, answers are composed extractively from the same retrieved
text instead of failing.

## Repositories

| Directory | Stack | Notes |
| --- | --- | --- |
| `agafari-backend` | FastAPI, SQLAlchemy 2 async, PostgreSQL + pgvector, Alembic | API, RAG pipeline, seeds |
| `agafari-frontend` | Next.js 16 App Router, TypeScript | Marketing site, tenant sites, admin panel |

Each has its own README with setup steps, demo organizations, and access codes.

## Running the demo

```bash
# backend
cd agafari-backend
alembic upgrade head
python seed_saas_demo.py
python seed_demo_sites.py
python reindex.py
uvicorn app.main:app --reload

# frontend
cd agafari-frontend
npm install
npm run dev
```

The seeded demo organizations use mock data and are described in
`agafari-backend/README.md`.
