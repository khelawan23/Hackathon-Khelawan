# Backend Services (Local Only)

This folder contains the self-hosted services that replace Firebase. It exposes
REST endpoints for authentication and posts, powered by Express + Prisma +
SQLite.

## Stack

- Node.js + TypeScript
- Express, Zod, JWT, Bcrypt
- Prisma ORM with SQLite (file-based DB stored in `backend/dev.db`)

## Available Endpoints

| Method | Path            | Description                          |
| ------ | --------------- | ------------------------------------ |
| POST   | `/api/auth/signup` | Create a user (`name`, `email`, `password`) |
| POST   | `/api/auth/login`  | Authenticate user                   |
| GET    | `/api/auth/me`     | Return current user (requires JWT)  |
| GET    | `/api/posts`       | List all posts (newest first)       |
| POST   | `/api/posts`       | Create a post (requires JWT)        |

## Local Setup (Step by Step)

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Create your environment file**
   ```bash
   cp env.sample .env
   ```
   You can keep the defaults for local development. Update `JWT_SECRET` if you
   want a custom signing secret.

3. **Generate the Prisma client and apply the schema**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
   This creates `dev.db` at the project root and applies the user/post tables.

4. **Start the API server**
   ```bash
   npm run dev
   ```
   The API will listen on `http://localhost:4000`. Adjust the `PORT` variable in
   `.env` if needed.

5. **Test with HTTP client**
   - Sign up: `POST http://localhost:4000/api/auth/signup`
   - Login: `POST http://localhost:4000/api/auth/login`
   - List posts: `GET http://localhost:4000/api/posts`
   - Create post (with `Authorization: Bearer <token>`): `POST /api/posts`

## Updating the Frontend

Point your frontend `.env` or config to the new base URL:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Then update the data-fetching hooks/components to call the REST endpoints
instead of Firebase SDK. (You can progressively migrate screens while running
the local API.)

## Database Rules Folder

See `../database-rules/README.md` for the human-readable data access policy
that mirrors the old Firebase security rules.

## Scripts

| Script            | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start API with hot reload             |
| `npm run build`   | Compile TypeScript to `dist/`         |
| `npm start`       | Run the compiled server               |
| `npm run prisma:generate` | Regenerate Prisma client      |
| `npm run prisma:migrate`  | Create/apply a new migration  |

## Tips

- Delete `dev.db` if you need a clean slate, then rerun the migrate command.
- Use tools like Insomnia/Postman or VS Code REST Client to interact quickly.
- JWT tokens currently expire after 7 days; adjust in `routes/auth.ts` if you
  need shorter sessions.

