# Database Rules & Access Policy

The local database is powered by SQLite (via Prisma). These are the access
constraints that mirror the earlier Firebase security rules:

1. **Users Table**
   - Users can only read or mutate their own profile details.
   - Passwords are stored as bcrypt hashes. Never store or log plain-text
     passwords.
   - Profiles keep `id`, `name`, `email`, timestamps. Emails are unique.

2. **Posts Table**
   - All authenticated users can read every post (global feed).
   - Only the authenticated author can create a post. Updates/deletes are not
     exposed yet to match the MVP requirements.
   - Each post stores the author's `id`, the text content (max 500 chars), and
     timestamps.

3. **Authentication**
   - JSON Web Tokens (JWT) are issued during login/signup.
   - Clients must send `Authorization: Bearer <token>` to create posts or read
     the `/api/auth/me` endpoint.

4. **Future Extensions**
   - Add role-based access or moderation by extending the `User` model with a
     `role` field.
   - Add soft-delete columns (`deletedAt`) if post removal is needed later.

Keep this document updated whenever the Prisma schema or access expectations
change so frontend and backend remain aligned.

