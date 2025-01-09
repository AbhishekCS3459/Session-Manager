# Project Documentation

## Overview

This project provides a robust system to manage **user preferences** and **sessions** using modern tools like **Redis** and **MongoDB**. Key functionalities include session tracking, user authentication, and saving preferences in cookies or databases for persistence.

---

## Key Features

### 1. **User Preferences Management**
- **Preferences Schema**:
  - Preferences include `theme`, `notifications`, and `language`.
  - Guest users' preferences are stored in cookies.
  - Authenticated users' preferences are stored in MongoDB.
- **API Endpoints**:
  - **POST /preferences**: Saves user preferences.
    - For authenticated users: Saves preferences in MongoDB.
    - For guest users: Stores preferences in secure cookies.
  - **GET /preferences**: Retrieves stored preferences.
    - Authenticated users' preferences are fetched from MongoDB.
    - Guest users' preferences are fetched from cookies.

### 2. **Session Management**
- **Session Schema**:
  - Tracks:
    - `pagesVisited` (Array of visited page IDs).
    - `startTime` (Session start time).
    - `sessionDuration` (Session length in seconds).
- **Redis Custom Session Store**:
  - A custom Redis store (`CustomRedisStore`) was implemented to resolve issues with existing Redis packages.
  - Stores session data in Redis with a default TTL of 30 minutes.
- **API Endpoints**:
  - **POST /session**: Initializes a new session.
  - **GET /session**: Fetches session details like `startTime`, `pagesVisited`, and `sessionDuration`.
  - **POST /session/page**: Logs a page visit and updates session details.
  - **DELETE /session**: Ends the session and clears session data.

**Integration Example:**

To better understand the integration of **Redis** and **MongoDB**, consider the following example:

- **Redis**: During a session, temporary session data (e.g., `pagesVisited`) is stored in Redis for fast access and short-term use. For instance, when a user navigates through pages, the details are logged into Redis, enabling efficient session tracking.
- **MongoDB**: When the session ends or for authenticated users, the session details are saved to MongoDB for long-term persistence. Preferences such as `theme` and `language` for authenticated users are directly stored and retrieved from MongoDB.

A visual flow:
```
[User Interaction] --> [Session Middleware] --> [Redis: Session Tracking]
                                    --> [MongoDB: Authenticated Data]
```

---

## Routes

### Authentication Routes
- **POST /api/auth/register**: Registers a new user by hashing the password and saving it in MongoDB.
- **POST /api/auth/login**: Authenticates the user, creates a session, and issues a JWT token.

### Preferences Routes
- **POST /api/preferences**: Saves user preferences (MongoDB for authenticated users; cookies for guests).
- **GET /api/preferences**: Retrieves user preferences (MongoDB for authenticated users; cookies for guests).

### Session Routes
- **POST /api/session**: Starts a new session by initializing session properties.
- **GET /api/session**: Fetches active session details including `pagesVisited` and `sessionDuration`.
- **POST /api/session/page**: Logs a page visit and updates the session in Redis (or MongoDB for authenticated users).
- **DELETE /api/session**: Ends the session and clears data.

---

## Database Setup

### MongoDB
- **Purpose**: Stores user information, preferences, and session data for authenticated users.
- **Integration**:
  - Uses `mongoose` for MongoDB ORM.
  - Connection URL: `process.env.DB_URI` (defaults to `mongodb://localhost:27017/amplifyx`).

### Redis
- **Purpose**: Manages sessions efficiently for both guests and authenticated users.
- **Custom Redis Store**:
  - `CustomRedisStore` handles session storage in Redis with robust error handling.
  - Connection URL: `process.env.UPSTASH_URL` (defaults to `redis://localhost:6379`).

---

## Middlewares

### Authentication Middleware
- Verifies JWT tokens and attaches decoded user information to the request object.
- Blocks access to protected routes if the token is missing or invalid.

### Session Middleware
- Configures `express-session` with:
  - Custom Redis store (`CustomRedisStore`).
  - Secure cookies (`HttpOnly`, `SameSite`, and `Secure` in production).
  - Session timeout of 30 minutes.

---

## Codebase Structure

### Main File (`index.ts`)
- Initializes the application, database connections, and routes.
- Uses middleware for parsing requests, handling cookies, and managing sessions.

### Routes
- **Auth Routes (`authRoute.ts`)**: Handles registration and login.
- **Preferences Routes (`preferencesRoute.ts`)**: Manages user preferences.
- **Session Routes (`sessionRoute.ts`)**: Manages session lifecycle.

### Controllers
- **Auth Controller**: Contains logic for user registration and login.
- **Preferences Controller**: Handles saving and fetching user preferences.
- **Session Controller**: Handles session initialization, page logging, and termination.

### Database Clients
- **Redis Client**:
  - Manages Redis connection with automatic retries.
  - Provides helper methods for caching and retrieving data.
- **Custom Redis Store**:
  - Implements session store methods (`get`, `set`, `destroy`) using Redis.
  - Ensures data consistency and TTL management.

---

## Environment Variables

Ensure the following environment variables are set:

- `DB_URI`: MongoDB connection string.
- `SESSION_SECRET`: Secret key for encrypting session cookies.
- `JWT_SECRET`: Secret key for signing JWT tokens.
- `REDIS_HOST`: Redis server host.
- `REDIS_PORT`: Redis server port.
- `REDIS_PASSWORD`: Redis server password.
- `UPSTASH_URL`: Redis URL (optional; defaults to `redis://localhost:6379`).

---

## Known Issues
- **Redis Integration**: Custom Redis store was implemented due to issues with default Redis packages.
- **Cross-Device Syncing**: Sessions are synchronized for authenticated users using MongoDB but might have delays under heavy load.

---

## Next Steps
- Complete bonus features:
  - Extend session tracking to log specific user actions.
  - Implement pagination for large session data responses.
- Optimize Redis usage to handle high traffic scenarios.

