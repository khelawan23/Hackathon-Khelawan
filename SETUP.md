# Quick Setup Guide (Local Backend + Frontend)

## 1. Backend / API

```bash
cd backend
npm install
cp env.sample .env          # tweak PORT/JWT_SECRET/DATABASE_URL if desired
npx prisma generate
npx prisma migrate dev --name init
npm run dev                 # starts http://localhost:4000 by default
```

### Environment variables

| Key           | Default            | Description                                  |
| ------------- | ------------------ | -------------------------------------------- |
| `PORT`        | `4000`             | API listening port                           |
| `DATABASE_URL`| `file:./dev.db`    | SQLite location (Prisma)                     |
| `JWT_SECRET`  | `super-secret...`  | Used to sign auth tokens (change for prod)   |

To reset the DB, delete `backend/dev.db` and rerun the migrate command.

## 2. Frontend / Next.js

```bash
cd frontend
npm install
```

Create `.env.local` (or edit existing env):

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Start the dev server:

```bash
npm run dev    # runs on http://localhost:9002 per package.json
```

## 3. Testing the Flow

1. Visit the frontend URL (default `http://localhost:9002`).
2. Sign up with name/email/password (min 6 chars).
3. The UI stores the returned token + user profile in localStorage.
4. Create a post. The feed re-fetches automatically.

## 4. Useful Commands

| Location | Command                        | Purpose                       |
| -------- | ------------------------------ | ----------------------------- |
| backend  | `npm run dev`                  | API server with hot reload    |
| backend  | `npm run prisma:migrate`       | Create/apply migration        |
| backend  | `npm run prisma:generate`      | Regenerate Prisma client      |
| frontend | `npm run dev`                  | Next.js dev server            |
| frontend | `npm run build && npm start`   | Production build + serve      |

## 5. Troubleshooting

- **Cannot connect / 404**: Make sure both servers are running and the frontend
  `NEXT_PUBLIC_API_BASE_URL` matches the backend port.
- **401 errors creating posts**: You must be signed in. Check localStorage for
  the stored token or clear it and log in again.
- **Prisma errors**: Remove `backend/dev.db`, rerun `npx prisma migrate dev`.
- **Port conflicts**: Update `PORT` in backend `.env` or pass `-p` to
  `npm run dev` on the frontend.

## 6. Next Steps

- Customize JWT expiry or password policies in `backend/src/routes/auth.ts`.
- Add moderation/admin roles by extending the Prisma schema.
- Deploy the backend anywhere Node runs; swap SQLite for Postgres by updating
  `DATABASE_URL` and running a new migration.

