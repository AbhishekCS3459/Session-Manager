# Project Title: Session Management and User Preferences API

## Overview
This project is a **Session Management and User Preferences API** built using Node.js, Express, MongoDB, and Redis. It provides user authentication, session tracking, and dynamic preference management for both authenticated and guest users. The API is designed for scalability, optimized session storage, and secure preference handling.

### Why This Project?
- **User-Centric**: Enables persistent user sessions and dynamic customization of user preferences.
- **Secure**: Implements JWT for user authentication and session data encryption.
- **Efficient**: Uses Redis for fast session handling and MongoDB for structured user data.
### Sequence Diagram
![image](https://github.com/user-attachments/assets/053df767-0f82-4d53-9d7a-e0f11a9fd0ad)

### How It Works
1. **Authentication**: Secure user registration and login with JWT tokens.
2. **Session Management**: Tracks user sessions, visited pages, and activities.
3. **Preference Storage**: Handles preferences for authenticated users in MongoDB and for guest users in cookies.
4. **Data Persistence**: Utilizes MongoDB for long-term storage and Redis for session caching.

### Approach and Why
- **Redis for Sessions**: Redis is used as the session store for its high speed and TTL (Time-to-Live) support, ensuring efficient session expiration.
- **MongoDB for User Data**: MongoDB provides flexibility in storing user preferences and session history.
- **TypeScript**: TypeScript ensures type safety and better maintainability.
- **RESTful API**: Adheres to REST principles for easy integration and scalability.

---

## Features
- **User Authentication**: Register, login, and maintain secure sessions.
- **Session Tracking**: Log and retrieve session data, including pages visited and user activities.
- **Dynamic Preference Management**: Save and fetch user preferences dynamically for both authenticated and guest users.
- **Pagination**: Efficient pagination for session data retrieval.
- **Robust Error Handling**: Comprehensive error messages and status codes.

---

## API Endpoints

### Authentication
#### Register a User
- **Endpoint**: `/auth/register`
- **Method**: POST
- **Description**: Registers a new user.
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User registered successfully"
  }
  ```

#### Login
- **Endpoint**: `/auth/login`
- **Method**: POST
- **Description**: Logs in a user and initializes a session.
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "token": "string",
    "message": "Logged in successfully. Session synced."
  }
  ```

### Session Management
#### Start a Session
- **Endpoint**: `/session`
- **Method**: POST
- **Description**: Initializes a new user session.
- **Response**: `Session initialized!`

#### Retrieve Session Details
- **Endpoint**: `/session`
- **Method**: GET
- **Description**: Fetch session details with pagination support.
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Number of records per page (default: 10)
- **Response**:
  ```json
  {
    "startTime": "string",
    "sessionDuration": "number",
    "total": "number",
    "page": "number",
    "limit": "number",
    "pagesVisited": ["string"]
  }
  ```

#### Log a Page Visit
- **Endpoint**: `/session/page`
- **Method**: POST
- **Description**: Logs a visited page in the session.
- **Request Body**:
  ```json
  {
    "page": "string"
  }
  ```
- **Response**: `Page '<page>' added to session.`

#### End Session
- **Endpoint**: `/session`
- **Method**: DELETE
- **Description**: Ends the current session.
- **Response**: `Session destroyed.`

### User Preferences
#### Save Preferences
- **Endpoint**: `/preferences`
- **Method**: POST
- **Description**: Saves user preferences in MongoDB (authenticated) or cookies (guest).
- **Request Body**:
  ```json
  {
    "theme": "string",
    "notifications": "boolean",
    "language": "string",
    "email": "string" (optional for authenticated users)
  }
  ```
- **Response**:
  ```json
  {
    "message": "Preferences saved successfully",
    "preferences": { "theme": "string", "notifications": "boolean", "language": "string" }
  }
  ```

#### Get Preferences
- **Endpoint**: `/preferences`
- **Method**: GET
- **Description**: Retrieves user preferences from MongoDB or cookies.
- **Request Body**:
  ```json
  {
    "email": "string" (optional for authenticated users)
  }
  ```
- **Response**:
  ```json
  {
    "preferences": { "theme": "string", "notifications": "boolean", "language": "string" }
  }
  ```

---

## Setup Guide

### Prerequisites
- **Node.js** (v14+)
- **MongoDB Atlas**
- **Redis** (Aiven or Upstash recommended)

### Steps
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd <repo-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file based on `.env.sample`.
   - Add your MongoDB URI, Redis credentials, and JWT secret.

4. Start the server:
   ```bash
   npm run dev
   ```

---

## Testing with Postman
1. Import the provided Postman collection.
2. Set up environment variables in Postman for base URL and JWT token.
3. Test each endpoint sequentially:
   - Register a user.
   - Log in to generate a JWT.
   - Use the JWT to authenticate session and preference endpoints.

---

## Environment Variables
Create a `.env` file:
```env
DB_URI=<Your MongoDB URI>
REDIS_HOST=<Your Redis Host>
REDIS_PORT=<Your Redis Port>
REDIS_PASSWORD=<Your Redis Password>
JWT_SECRET=<Your JWT Secret>
UPSTASH_URL=<Your Redis Upstash URL>
```

---

## Future Enhancements
- Implement role-based access control.
- Add WebSocket support for real-time session updates.
- Enhance security with rate-limiting and advanced logging.

---

## Author
- **AbhishekCS3459**

---

## License
This project is licensed under the MIT License. See the LICENSE file for details.

