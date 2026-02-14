# Wishscroll API Guide for Frontend Developers

## Base URL
- Development: `http://localhost:8000`
- Production: `https://wishscroll-backend.railway.app`

---

## Authentication

### Register New User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "User Name"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "created_at": "2026-02-14T00:00:00Z"
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Store token and use in all subsequent requests:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Content Endpoints

### Get Content Feed
```http
GET /api/v1/content/feed?limit=20&offset=0&category=aww
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "posts": [
    {
      "id": "uuid",
      "external_id": "reddit_abc123",
      "source": "reddit",
      "title": "Cute puppy playing",
      "content_url": "https://...",
      "content_type": "image",
      "tags": ["aww", "reddit"],
      "post_metadata": {"subreddit": "aww"},
      "sentiment_score": 0.8,
      "created_at": "2026-02-14T00:00:00Z"
    }
  ],
  "total": 116,
  "has_more": true
}
```

### Get New Content
```http
GET /api/v1/content/new?limit=20
Authorization: Bearer TOKEN
```

Returns latest posts, same format as feed.

### Get Trending Content
```http
GET /api/v1/content/trending?limit=20
Authorization: Bearer TOKEN
```

Returns most-interacted posts.

### Interact with Post
```http
POST /api/v1/content/{post_id}/interact
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "interaction_type": "like",
  "dwell_time_seconds": 15
}
```

**Interaction Types:** `like`, `dislike`, `save`, `share`

**Response:**
```json
{
  "id": "uuid",
  "post_id": "uuid",
  "interaction_type": "like",
  "created_at": "2026-02-14T00:00:00Z"
}
```

### Get Favorites
```http
GET /api/v1/content/favorites
Authorization: Bearer TOKEN
```

Returns user's saved posts.

---

## TypeScript Types
```typescript
// User types
interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

// Content types
interface Post {
  id: string;
  external_id: string;
  source: 'youtube' | 'reddit';
  title: string;
  content_url: string;
  content_type: 'image' | 'video';
  tags: string[];
  post_metadata: Record<string, any>;
  sentiment_score: number | null;
  created_at: string;
}

interface ContentFeedResponse {
  posts: Post[];
  total: number;
  has_more: boolean;
}

interface InteractionRequest {
  interaction_type: 'like' | 'dislike' | 'save' | 'share';
  dwell_time_seconds?: number;
}
```

---

## Example React Usage
```typescript
// API client setup
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1'
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', response.data.access_token);
  return response.data;
};

// Get feed
const getFeed = async (limit = 20, offset = 0) => {
  const response = await api.get('/content/feed', {
    params: { limit, offset }
  });
  return response.data;
};

// Like post
const likePost = async (postId: string, dwellTime: number) => {
  const response = await api.post(`/content/${postId}/interact`, {
    interaction_type: 'like',
    dwell_time_seconds: dwellTime
  });
  return response.data;
};
```

---

## Error Handling

### Status Codes
- 200: Success
- 201: Created (registration)
- 401: Unauthorized (invalid token)
- 404: Not found
- 409: Conflict (duplicate email)
- 422: Validation error
- 500: Server error

### Error Response Format
```json
{
  "detail": "Error message",
  "message": "User-friendly description"
}
```

---

## Testing Endpoints

### Swagger UI
Visit: `http://localhost:8000/docs`
- Interactive API testing
- Try all endpoints
- See request/response schemas

### Health Check
```http
GET /health
```
Returns: `{"status": "healthy", "env": "development"}`

---

## Rate Limiting (Future)

Currently no rate limiting. For production, implement:
- 100 requests/minute per user
- Handled at API gateway level

---

## Questions?

- Backend developer: @donaldirebo
- API documentation: http://localhost:8000/docs
- Issues: GitHub Issues

---

*Last updated: Feb 14, 2026*
