# Go-Foodie Backend

REST API backend for **Go-Foodie**, a food delivery platform. The service handles user authentication (password and OTP), session management, and the core data model for users, addresses, restaurants, and delivery roles.

Built with **Node.js**, **Express 5**, **TypeScript**, **Prisma**, and **PostgreSQL**.

## Features

- User registration with mobile OTP verification (Twilio SMS)
- Login via password or OTP
- JWT access tokens (15 min) and refresh tokens (7 days) with server-side sessions
- Forgot-password flow via OTP
- Protected profile endpoint
- Logout (single session) and logout-all (all devices)
- Role-based user model: `USER`, `ADMIN`, `DELIVERY`, `RESTAURANT`
- Address and restaurant models ready for delivery flows
- Health check endpoint
- Security middleware: Helmet, CORS, XSS protection (dependencies), rate limiting (available)

## Tech Stack

| Layer      | Technology            |
| ---------- | --------------------- |
| Runtime    | Node.js 20+           |
| Framework  | Express 5             |
| Language   | TypeScript (ESM)      |
| ORM        | Prisma 7 + PostgreSQL |
| Validation | Zod                   |
| Auth       | JWT, bcrypt           |
| SMS / OTP  | Twilio                |
| Dev server | tsx (watch mode)      |

## Project Structure

```
Go-Foodie-Backend/
├── prisma/
│   ├── schema.prisma       # Database models & enums
│   └── migrations/         # SQL migrations
├── src/
│   ├── index.ts            # Server entry & DB connect
│   ├── app.ts              # Express app & routes
│   ├── config/             # Twilio & external config
│   ├── lib/                # Prisma client
│   ├── middlewares/        # Auth middleware
│   ├── modules/
│   │   ├── auth/           # Auth routes, controllers, services
│   │   └── user/           # User helpers
│   ├── services/           # OTP, SMS, tokens
│   ├── generated/prisma/   # Prisma client (generated)
│   ├── types/              # Shared TypeScript types
│   └── utils/              # API responses, errors
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- [PostgreSQL](https://www.postgresql.org/) database
- [Twilio](https://www.twilio.com/) account (Account SID, Auth Token, phone number) for SMS OTP
- npm

## Environment Variables

Create a `.env` file in the project root:

```env
# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/go_foodie?schema=public

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Twilio (SMS OTP)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

| Variable               | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `PORT`                 | HTTP port (default `3000` if unset)                      |
| `API_URL`              | Base URL for paginated `nextPage` / `previousPage` links |
| `CLIENT_URL`           | Allowed CORS origin (credentials enabled)                |
| `DATABASE_URL`         | PostgreSQL connection string                             |
| `ACCESS_TOKEN_SECRET`  | Secret for signing access JWTs                           |
| `REFRESH_TOKEN_SECRET` | Secret for signing refresh JWTs                          |
| `TWILIO_*`             | Twilio credentials for sending OTP SMS                   |

> **Note:** Do not commit `.env` to version control. It is listed in `.dockerignore`.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

```bash
npx prisma generate
npx prisma migrate deploy
```

For local development with schema changes:

```bash
npx prisma migrate dev
```

### 3. Run the development server

```bash
npm run dev
```

The API listens on `http://localhost:<PORT>` (set `PORT` in `.env`; Docker example uses `5000`).

### 4. Verify the server

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{ "message": "Server is running" }
```

## Docker

Build and run with Docker (expects `.env` or env vars at runtime):

```bash
docker build -t go-foodie-backend .
docker run -p 5000:5000 --env-file .env go-foodie-backend
```

The image runs `npm run dev` and exposes port `5000`. Ensure `DATABASE_URL` points to a reachable PostgreSQL instance from inside the container.

## API Overview

Base path for auth: **`/api/auth`**

All JSON responses follow a common shape:

**Success**

```json
{
  "success": true,
  "message": "…",
  "data": {}
}
```

**Error**

```json
{
  "success": false,
  "message": "…",
  "error": "…"
}
```

### Authentication

Protected routes accept the access token via:

- Header: `Authorization: Bearer <accessToken>`
- Cookie: `token=<accessToken>`

| Method | Endpoint                                   | Auth | Description                    |
| ------ | ------------------------------------------ | ---- | ------------------------------ |
| POST   | `/api/auth/register`                       | No   | Register user; sends OTP SMS   |
| POST   | `/api/auth/verify`                         | No   | Verify registration OTP        |
| POST   | `/api/auth/send-login-otp`                 | No   | Send login OTP to mobile       |
| POST   | `/api/auth/login/otp`                      | No   | Login with mobile + OTP        |
| POST   | `/api/auth/login/password`                 | No   | Login with mobile + password   |
| POST   | `/api/auth/refresh`                        | No   | Rotate access & refresh tokens |
| POST   | `/api/auth/logout`                         | No   | End current session            |
| POST   | `/api/auth/logout-all`                     | No   | End all sessions for user      |
| GET    | `/api/auth/profile`                        | Yes  | Get current user profile       |
| POST   | `/api/auth/forgot-password/send-otp`       | No   | Send reset-password OTP        |
| POST   | `/api/auth/forgot-password/reset-password` | No   | Reset password with OTP        |

### Health

| Method | Endpoint  | Description         |
| ------ | --------- | ------------------- |
| GET    | `/health` | Server health check |

### Example: Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "password": "securepass123"
}
```

Indian mobile numbers are validated (`+91` optional, 10 digits starting with 6–9). After registration, verify with the OTP sent via SMS:

```http
POST /api/auth/verify
Content-Type: application/json

{
  "mobile": "9876543210",
  "otp": "123456"
}
```

### Example: Login (password)

```http
POST /api/auth/login/password
Content-Type: application/json

{
  "mobile": "9876543210",
  "password": "securepass123"
}
```

Response includes `accessToken` and `refreshToken` in `data`. Use the access token for `/api/auth/profile`. Refresh before expiry:

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

## Auth Flow (summary)

```mermaid
sequenceDiagram
  participant Client
  participant API
  participant DB
  participant Twilio

  Client->>API: POST /register
  API->>DB: Create user
  API->>Twilio: Send OTP
  Client->>API: POST /verify
  API->>DB: Mark isVerified

  Client->>API: POST /login/password or /login/otp
  API->>DB: Create session
  API-->>Client: accessToken + refreshToken

  Client->>API: GET /profile (Bearer token)
  API-->>Client: User profile
```

- OTPs expire after **10 minutes**.
- Access tokens expire in **15 minutes**; refresh tokens in **7 days**.
- Sessions are stored in the `Session` table and tied to `userAgent` and `ipAddress`.

## Database Models

| Model        | Purpose                                   |
| ------------ | ----------------------------------------- |
| `User`       | Accounts with role, verification flag     |
| `Session`    | Refresh token sessions per device         |
| `OtpCodes`   | Hashed OTPs for register, login, reset    |
| `Address`    | User delivery addresses (HOME/WORK/OTHER) |
| `Restaurant` | Restaurant linked to owner user           |

Run `npx prisma studio` to browse data locally.

## Scripts

| Command       | Description                      |
| ------------- | -------------------------------- |
| `npm run dev` | Start dev server with hot reload |
| `npm test`    | Not configured yet               |

## Author

**Mahesh Rathod**

## License

ISC
