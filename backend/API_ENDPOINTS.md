# API Endpoints Documentation

## Base URL
`http://localhost:4000/api`

## Authentication Endpoints
- `POST /auth/signup` - Create a new user account
- `POST /auth/login` - Login with email and password
- `GET /auth/me` - Get current authenticated user info (requires auth)

## Posts Endpoints
- `GET /posts` - Get all posts (newest first)
- `GET /posts/me` - Get posts by current authenticated user (requires auth)
- `GET /posts/user/:userId` - Get posts by specific user ID
- `POST /posts` - Create a new post (requires auth)

## Users Endpoints
- `GET /users/me` - Get current user profile with stats (requires auth)
  - Returns: user info + stats (posts count, following, followers)
- `GET /users/:userId` - Get user profile by ID with stats
  - Returns: user info + stats (posts count, following, followers)

## Frontend Integration Examples

### Profile Page - Get Current User Stats
```typescript
const response = await apiRequest('/users/me', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`
  }
});
// Returns: { id, displayName, email, createdAt, stats: { posts, following, followers } }
```

### Profile Page - Get User's Posts
```typescript
const response = await apiRequest('/posts/me', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`
  }
});
// Returns: { posts: [...] }
```

### View Another User's Profile
```typescript
const response = await apiRequest(`/users/${userId}`, {
  method: 'GET'
});
// Returns: { id, displayName, email, createdAt, stats: { posts, following, followers } }
```

### View Another User's Posts
```typescript
const response = await apiRequest(`/posts/user/${userId}`, {
  method: 'GET'
});
// Returns: { posts: [...] }
```
