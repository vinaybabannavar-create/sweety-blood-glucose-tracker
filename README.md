<div align="center">

# SWEETY
### Blood Glucose Tracker

**Track readings. Understand patterns. Stay informed.**

A full-stack blood glucose logging and reporting application built with React, Node.js, Express, Prisma, and PostgreSQL.

[![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=20232A)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-REST_API-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)

**Developed for the Kenpath Junior Full Stack Developer assignment**

[Features](#-key-features) · [Architecture](#-architecture) · [Setup](#-getting-started) · [API](#-api-reference) · [Testing](#-testing) · [Security](#-security--data-integrity)

</div>

---

## Overview

Sweety gives users a focused place to record daily blood glucose readings, review their history, and view summaries over useful date ranges.

Each account has its own private readings. Users can record up to four readings per day—one for each supported time slot—and review daily, month-to-date, and previous-month reports.

The project is built as a React client backed by an Express REST API. Prisma manages database access, PostgreSQL stores application data, and authentication uses bcrypt password hashing with a JWT in an HTTP-only cookie.

## ✨ Key Features

| Area | Capabilities |
|---|---|
| **Authentication** | Registration, login, logout, session restoration, protected routes |
| **Reading management** | Create, view, update, and delete personal readings |
| **Daily slots** | Morning fasting, after breakfast, after lunch, after dinner |
| **Validation** | Whole-number values from 40–600 mg/dL, no future dates, no duplicate daily slots |
| **Reports** | Daily, month-to-date, and previous-calendar-month summaries |
| **Insights** | Highest, lowest, average rounded to one decimal place, and reading count |
| **Experience** | Responsive dashboard, reading history, charts, pagination, validation feedback |
| **Development** | Prisma migrations, seed script, Docker Compose database, API tests |

## 🧰 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Backend | Node.js, Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Authentication | bcrypt, JWT, HTTP-only cookies |
| API testing | Node.js test runner, Supertest |
| Local infrastructure | Docker Compose |

## 🏛️ Architecture

```text
┌──────────────────────────────────────────────┐
│                  React Client                │
│             Vite · Router · UI               │
└──────────────────────┬───────────────────────┘
                       │ HTTP / JSON
                       │ HTTP-only session cookie
                       ▼
┌──────────────────────────────────────────────┐
│                Express REST API              │
│                                              │
│  Authentication  │  Reading Management       │
│  Validation      │  Reports                  │
└──────────────────────┬───────────────────────┘
                       │ Prisma ORM
                       ▼
┌──────────────────────────────────────────────┐
│                  PostgreSQL                  │
│             Users · Glucose Readings         │
└──────────────────────────────────────────────┘
```

### Request flow

1. A user signs in through the React client.
2. The API verifies credentials and issues a signed JWT in an HTTP-only cookie.
3. Protected requests are authenticated by the API.
4. Prisma reads or updates records scoped to the authenticated user.
5. The client displays readings, history, and report summaries.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop, or PostgreSQL 15+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/vinaybabannavar-create/sweety-blood-glucose-tracker.git
cd sweety-blood-glucose-tracker
```

### 2. Configure environment variables

Create the backend environment file.

**Windows PowerShell**
```powershell
Copy-Item server/.env.example server/.env
```

**macOS / Linux**
```bash
cp server/.env.example server/.env
```

Set the local development values in `server/.env`:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://sweety:sweety_dev_password@localhost:5433/sweety?schema=public"
JWT_SECRET="replace-with-a-long-random-development-secret"
JWT_EXPIRES_IN=7d
COOKIE_NAME=sweety_session
COOKIE_SECURE=false
CLIENT_ORIGIN=http://localhost:5173
```

> **Port note:** This configuration uses host port `5433` because port `5432` may already be occupied by a local PostgreSQL service. The Docker Compose mapping and `DATABASE_URL` must use the same host port. If your Docker configuration maps `5432:5432`, change the URL to use port `5432`.

Never commit `server/.env` or production secrets.

### 3. Start PostgreSQL

Run this command from the project root:

```bash
docker compose up -d db
```

Check the database container:

```bash
docker compose ps
```

Wait until the database reports `healthy`.

Local database defaults:

| Setting | Value |
|---|---|
| Database | `sweety` |
| Username | `sweety` |
| Password | `sweety_dev_password` |
| Container port | `5432` |
| Host port | `5433` in the configuration above |

### 4. Install and start the backend

From the project root:

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

The API runs at:

```text
http://localhost:4000
```

Health endpoint:

```text
http://localhost:4000/api/health
```

A healthy API responds with:

```json
{
  "success": true,
  "status": "ok"
}
```

Keep the backend terminal running.

### 5. Install and start the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the application:

**http://localhost:5173**

Keep both development servers running. During local development, Vite proxies `/api` requests to the backend.

## 🔐 Demo Account

After running `npm run seed`, use the development demo account:

| Field | Value |
|---|---|
| Email | `demo@sweety.local` |
| Password | `SweetyDemo123!` |

This account is intended for local evaluation only. Change or remove the demo credentials before any public deployment.

## 📊 Reading Rules & Reports

### Supported daily slots

| Slot label | API value |
|---|---|
| Morning (fasting) | `morning` |
| After breakfast | `after_breakfast` |
| After lunch | `after_lunch` |
| After dinner | `after_dinner` |

### Validation rules

- Glucose values must be whole numbers between **40 and 600 mg/dL**, inclusive.
- A reading date cannot be in the future.
- A user can have only one reading per slot per calendar date.
- There are four supported slots, so a user can record at most four readings per day.
- Reading ownership is derived from the authenticated session, not from a client-supplied user ID.

### Report definitions

| Report | Date range |
|---|---|
| Daily | The selected calendar date |
| Month to date | First day of the selected month through the selected date |
| Monthly | The complete previous calendar month |

Each report provides the highest value, lowest value, average rounded to one decimal place, and reading count.

## 📡 API Reference

All endpoints are prefixed with `/api`.

### Authentication

| Method | Endpoint | Auth required | Purpose |
|---|---|:---:|---|
| `POST` | `/auth/register` | No | Create an account |
| `POST` | `/auth/login` | No | Start a session |
| `POST` | `/auth/logout` | No | End a session |
| `GET` | `/auth/me` | Yes | Return the current user |

### Readings

| Method | Endpoint | Auth required | Purpose |
|---|---|:---:|---|
| `GET` | `/readings` | Yes | List the user's readings |
| `POST` | `/readings` | Yes | Create a reading |
| `GET` | `/readings/:id` | Yes | Get one owned reading |
| `PUT` | `/readings/:id` | Yes | Update an owned reading |
| `DELETE` | `/readings/:id` | Yes | Delete an owned reading |

The list endpoint supports query parameters including `page`, `limit`, `date`, `from`, and `to`.

### Reports

| Method | Endpoint | Auth required | Purpose |
|---|---|:---:|---|
| `GET` | `/reports/daily?date=YYYY-MM-DD` | Yes | Selected-day summary |
| `GET` | `/reports/month-to-date?date=YYYY-MM-DD` | Yes | Month start through selected date |
| `GET` | `/reports/monthly?date=YYYY-MM-DD` | Yes | Previous calendar month |

### Example reading payload

```json
{
  "readingDate": "2026-11-08",
  "timeSlot": "morning",
  "glucoseValue": 105
}
```

The API accepts these `timeSlot` values:

```text
morning
after_breakfast
after_lunch
after_dinner
```

The API determines the user identity from the verified session. A client-provided `userId` is not treated as the authority for record ownership.

## 🧪 Testing & Verification

### Backend automated tests

With PostgreSQL running and `server/.env` configured:

```bash
cd server
npm test
```

The backend test suite uses Node's built-in test runner and Supertest.

**Verified local test coverage:**

- User registration and authenticated session creation.
- Authentication enforcement on reading routes.
- Reading creation and duplicate-slot rejection.
- Rejection of glucose values outside the allowed range.

**Latest recorded local result:**

| Result | Count |
|---|---:|
| Passed | 4 |
| Failed | 0 |

Run the test suite again after code changes and before submitting.

### Frontend production build

The client includes a production build command:

```bash
cd client
npm run build
```

The current client package does not define an `npm test` script. Use browser-based functional checks for the frontend unless automated UI tests are added.

### Manual QA checklist

- [ ] Register a new account.
- [ ] Sign in and restore the session after refresh.
- [ ] Sign out and verify protected pages require authentication.
- [ ] Add a reading for each of the four daily slots.
- [ ] Edit a reading and verify the updated value.
- [ ] Delete a reading and verify it disappears.
- [ ] Try values below 40 and above 600.
- [ ] Try a decimal value, blank value, and future date.
- [ ] Try adding the same slot twice on one date.
- [ ] Verify a fifth reading cannot be added to the same day.
- [ ] Verify daily, month-to-date, and previous-month reports.
- [ ] Verify one account cannot access another account's readings.
- [ ] Check browser console and Network tab for failed requests.

## 🛡️ Security & Data Integrity

- Passwords are hashed with bcrypt; plain-text passwords are not stored.
- JWT session tokens are stored in HTTP-only cookies.
- Protected endpoints require a valid authenticated session.
- Reading queries are scoped to the authenticated user.
- Server-side validation checks dates, slots, and glucose values.
- PostgreSQL constraints enforce the allowed value range, valid slots, and uniqueness per user/date/slot.
- The API does not trust a client-supplied user ID for reading ownership.
- Environment files and secrets must remain out of version control.

### Production hardening considerations

Before production deployment:

- Use HTTPS and set `COOKIE_SECURE=true`.
- Generate a strong, private JWT secret.
- Configure the correct frontend origin.
- Add rate limiting and CSRF protection appropriate to the cookie strategy.
- Consider email verification and password reset flows.
- Add structured logging, monitoring, and managed database backups.

## 🗂️ Project Structure

```text
sweety-blood-glucose-tracker/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   └── package.json
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 📝 Engineering Decisions & Scope

- **Calendar-date storage:** Reading dates use the `YYYY-MM-DD` calendar-date format and PostgreSQL `DATE` storage to avoid unintended day shifts from timestamp timezone conversion.
- **Database-level uniqueness:** A unique user/date/slot constraint protects against duplicate entries, including concurrent requests.
- **Previous-month semantics:** The monthly report covers the complete previous calendar month.
- **Focused assignment scope:** Redis caching, background queues, and doctor-role workflows are not included. The implementation prioritizes the core personal tracking and reporting requirements.

> **Health disclaimer:** Sweety is a personal logging and reporting application, not a medical device. It does not diagnose conditions, interpret readings clinically, or provide treatment advice. Consult a qualified healthcare professional about health concerns and glucose readings.

## 📌 Project Status

The project has been run locally. PostgreSQL migrations and seed data were applied, the API health endpoint was verified, and the current backend automated test suite passed **4 tests with 0 failures**. Complete the remaining manual QA checklist and client production build before describing the entire application as fully verified.

---

<div align="center">

### SWEETY — Blood Glucose Tracker

**React · Node.js · Express · Prisma · PostgreSQL**

Built with care as a full-stack development project.

[Back to top](#sweety)

</div>
