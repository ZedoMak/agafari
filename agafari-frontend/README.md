# Agafari Frontend

One Next.js app serving three separate surfaces.

| Surface | Routes | Who it is for |
| --- | --- | --- |
| Marketing site | `/`, `/templates`, `/pricing`, `/docs`, `/partner` | Organizations evaluating Agafari |
| Tenant sites | `/sites/[slug]/…` (or `slug.agafari.com`) | The organization's own visitors |
| Admin panel | `/admin/…` | The organization's staff |

The split is deliberate. A tenant site carries only that organization's brand and
never mentions Agafari; it exists to serve their visitors. Their team manages it
from the admin panel we host, so nothing operational leaks onto their public
site.

## Tenant sites

Server-rendered from the organization's bootstrap record, so branding,
terminology, and enabled features come from configuration rather than code.

- Home, about, service directory and detail pages with procedure steps
- Public assistant answering only from approved public documents, with citations
- Updates page announcing policy, fee, and procedure changes
- Feedback and complaint intake

Styling lives in `src/app/sites/clarity.css`, scoped under `.clarity` with a
`c-` prefix so tenant pages never collide with the marketing stylesheet.

## Admin panel

Signed in with the organization slug plus an access code
(`POST /api/v1/access/session`); the token is held in `sessionStorage` under
`agafari.admin.session`.

- Overview with usage, grounded answer rate, knowledge health, pending changes
- Service management: create, edit, publish, delete, regenerate steps
- Documents: upload, approve, reject, and set public or internal visibility
- Updates: review detected policy changes and publish notices to visitors
- Staff assistant over internal documents
- Conversations, complaints, insights, and site settings

The panel reuses the same `c-*` design system as the tenant template and
re-skins the chrome in Agafari's colours (`src/app/admin/admin.css`).

## Run locally

The backend should be running on port `8000`.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Then open:

```text
http://localhost:3000/                     marketing site
http://localhost:3000/sites/hope-aid       a tenant site
http://localhost:3000/admin/login          the admin panel
```

Demo access codes are listed in `agafari-backend/README.md`.

## Environment

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
npm test
```
