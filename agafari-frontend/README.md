# Agafari Public Frontend

Next.js public experience for the Agafari hosted knowledge platform.

## Included

- SaaS landing page
- Organization directory and sector filtering
- Configurable organization public pages
- Service detail pages
- Grounded public RAG chat with citations and answer feedback
- Structured complaint and feedback submission
- Responsive, accessible loading, empty, and error states

## Run locally

The backend should be running on port `8000`.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The seeded demo is available at:

```text
/organizations/hope-aid
```

## Environment

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Checks

```bash
npm run lint
npm run build
```
