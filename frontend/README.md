# Frontend (Next.js)

- Framework: Next 15 + React 18 + Tailwind
- Auth handled via the local Express API (`NEXT_PUBLIC_API_BASE_URL`)
- Key UI pieces live in `src/components/feed/*` and `src/app/login`

## Getting Started

```bash
cd frontend
npm install

# point the UI at the backend (default port 4000)
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:4000" > .env.local

npm run dev
```

## How it Works

- `src/lib/auth-context.tsx` wraps the app, keeps `{ user, token }` in
  `localStorage`, and exposes sign-in/out helpers.
- API utilities live under `src/lib/api/*`.
- Posting triggers a `posts:refresh` event so the feed re-fetches.

Update the UI as needed (e.g., add pagination, likes, comments) by extending the
API routes and reusing the shared context/hooks.
