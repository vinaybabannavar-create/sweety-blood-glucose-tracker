::: {align="center"}

# Sweety

### Blood Glucose Tracker

A secure, full-stack application for recording daily blood glucose
readings and understanding trends through clear, date-based reports.

**Built for the Kenpath Junior Full Stack Developer assignment**

[Features](#-features) · [Tech Stack](#-technology-stack) · [Getting
Started](#-getting-started) · [API](#-api-reference) ·
[Testing](#-testing) · [Security](#-security)
:::

---

## Overview

Sweety helps users keep their glucose readings organized in one personal
workspace. Users can create an account, log readings across four daily
time slots, review their history, and explore daily and monthly
summaries.

The application uses a React frontend, an Express REST API, Prisma ORM,
and PostgreSQL. Authentication is handled with bcrypt password hashing
and a JWT stored in an HTTP-only cookie. Reading data is always scoped
to the authenticated user.

## ✨ Features

### Account and session management

- User registration, login, and logout.
- Password hashing with bcrypt.
- Session restoration using a signed JWT in an HTTP-only cookie.
- Protected API routes.

### Glucose reading management

- Create, view, update, and delete readings.
- Four supported daily time slots:
  - Morning (fasting)
  - After breakfast
  - After lunch
  - After dinner
- Glucose values must be whole numbers from **40 to 600 mg/dL**.
- One reading per time slot per calendar day.
- Future dates and duplicate slots are rejected.
- User-specific reading access.

### Reports and insights

- Daily report for a selected date.
- Month-to-date report, from the first day of the month through the
  selected date.
- Monthly report for the complete previous calendar month.
- Highest, lowest, average (rounded to one decimal place), and reading
  count.
- Chart-based data presentation.

### User experience

- Responsive dashboard and navigation.
- Reading history with pagination.
- Reading forms with validation feedback.
- Helpful empty states when no readings are available.

## 🧰 Technology Stack

Layer Technologies

---

Frontend React, Vite, React Router
Styling Tailwind CSS
Charts Recharts
Backend Node.js, Express
ORM Prisma
Database PostgreSQL
Authentication bcrypt, JWT, HTTP-only cookies
Testing Node.js test runner, Supertest
Local database Docker Compose

## 🏗️ Application Architecture

```text
┌───────────────────────────────┐
│         React Client          │
│     Vite · Router · UI        │
└───────────────┬───────────────┘
                │ HTTP / JSON
                │ Cookie session
                ▼
┌───────────────────────────────┐
│       Express REST API        │
│ Authentication · Validation  │
│ Readings · Reports            │
└───────────────┬───────────────┘
                │ Prisma ORM
                ▼
┌───────────────────────────────┐
│          PostgreSQL           │
│ Users · Glucose Readings      │
└───────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

Install the following before running the project:

- **Node.js 20 or later**
- **npm 10 or later**
- **Docker Desktop** (recommended), or PostgreSQL 15+
- Git (recommended)

### 1. Clone the repository

```bash
git clone <YOUR_PUBLIC_REPOSITORY_URL>
cd sweety-blood-glucose-tracker
```

Replace `<YOUR_PUBLIC_REPOSITORY_URL>` with the URL of your public
GitHub repository.

### 2. Configure the backend environment

Create the backend environment file from the example:

**Windows PowerShell**

```powershell
Copy-Item server/.env.example server/.env
```

**macOS / Linux**

```bash
cp server/.env.example server/.env
```

Update `server/.env` with your local configuration:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://sweety:sweety_dev_password@localhost:5433/sweety?schema=public"
JWT_SECRET="replace-this-with-a-long-random-secret"
JWT_EXPIRES_IN=7d
COOKIE_NAME=sweety_session
COOKIE_SECURE=false
CLIENT_ORIGIN=http://localhost:5173
```

> **Database port:** The example above uses host port `5433`, which is
> useful when another PostgreSQL service already occupies `5432`. If
> port `5432` is available, you can use `5432` instead. Keep the host
> port in `DATABASE_URL` aligned with the left-hand port in Docker
> Compose.

Never commit your real `.env` file or production secrets.

### 3. Start PostgreSQL

From the project root:

```bash
docker compose up -d db
```

Check the container:

```bash
docker compose ps
```

Wait until the database reports a healthy status before continuing.

The local Docker database defaults are:

Setting Value

---

Database `sweety`
Username `sweety`
Password `sweety_dev_password`
Container port `5432`
Host port `5433` in the configuration above

If you change the Docker host port, update `DATABASE_URL` accordingly.

### 4. Install and initialize the backend

Open a terminal in the project root:

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

The API starts at:

```text
http://localhost:4000
```

Health check:

```text
http://localhost:4000/api/health
```

A successful health check returns:

```json
{
  "success": true,
  "status": "ok"
}
```

Keep this terminal running.

### 5. Install and start the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the application:

```text
http://localhost:5173
```

Keep both the backend and frontend development servers running. The Vite
development server proxies `/api` requests to the backend.

## 🔐 Demo Account

After running the seed command, use the demo account:

Field Demo value

---

Email `demo@sweety.local`
Password `SweetyDemo123!`

The seed script can be run again to restore the demo user's sample data.
This is a development-only account. Change or remove the demo
credentials before any public deployment.

## 📡 API Reference

All API routes are prefixed with `/api`.

### Authentication

Method Endpoint Authentication Description

---

`POST` `/auth/register` No Create an account
`POST` `/auth/login` No Sign in
`POST` `/auth/logout` No End the session
`GET` `/auth/me` Yes Get the current user

### Readings

Method Endpoint Authentication Description

---

`GET` `/readings` Yes List readings
`POST` `/readings` Yes Create a reading
`GET` `/readings/:id` Yes Get one owned reading
`PUT` `/readings/:id` Yes Update an owned reading
`DELETE` `/readings/:id` Yes Delete an owned reading

The list endpoint supports query parameters such as `page`, `limit`,
`date`, `from`, and `to`.

### Reports

---

Method Endpoint Authentication Description

---

`GET` `/reports/daily?date=YYYY-MM-DD` Yes Selected-day
summary

`GET` `/reports/month-to-date?date=YYYY-MM-DD` Yes First of month
through selected
date

`GET` `/reports/monthly?date=YYYY-MM-DD` Yes Complete
previous
calendar month

---

### Example reading payload

```json
{
  "readingDate": "2026-11-08",
  "timeSlot": "morning",
  "glucoseValue": 105
}
```

Allowed `timeSlot` values:

```text
morning
after_breakfast
after_lunch
after_dinner
```

The API derives the user identity from the verified session. A
client-supplied `userId` is not trusted.

## 🧪 Testing

### Backend automated tests

Make sure PostgreSQL is running and `server/.env` is configured. Then
run:

```bash
cd server
npm test
```

The backend test suite uses Node's built-in test runner and Supertest.

The verified local test run covers: - User registration and
authenticated session creation. - Authentication enforcement on reading
routes. - Reading creation and duplicate-slot rejection. - Rejection of
glucose values outside the allowed range.

**Latest local result:** 4 tests passed, 0 failed.

> This result reflects the test run performed during development. Run
> the tests again after making changes and before submitting.

### Frontend build check

The client currently provides a production build script:

```bash
cd client
npm run build
```

The client package does not currently define an `npm test` script. Use
browser-based functional checks for the UI unless frontend tests are
added.

### Manual verification checklist

- [ ] Register a new account and sign in.
- [ ] Sign out and verify protected pages require authentication.
- [ ] Add a reading for each of the four time slots.
- [ ] Edit and delete a reading.
- [ ] Try a value below 40 and above 600.
- [ ] Try a decimal value and a future date.
- [ ] Try to add the same slot twice on one date.
- [ ] Verify that a fifth reading cannot be added to the same day.
- [ ] Verify daily, month-to-date, and previous-month reports.
- [ ] Verify that one user cannot access another user's readings.

## 🛡️ Security and Data Integrity

- Passwords are hashed with bcrypt; plain-text passwords are not
  stored.
- JWT session tokens are stored in HTTP-only cookies.
- Protected endpoints require a valid authenticated session.
- Reading queries are scoped to the authenticated user.
- Server-side validation checks dates, slots, and glucose values.
- PostgreSQL constraints enforce allowed glucose ranges, valid slots,
  and uniqueness per user/date/slot.
- The API does not accept a client-provided user ID as the authority
  for reading ownership.
- Environment files and secrets must remain out of version control.

### Production hardening

Before a production deployment, configure HTTPS, `COOKIE_SECURE=true`, a
strong secret, and the correct frontend origin. Also consider rate
limiting, CSRF protection appropriate to the cookie strategy, email
verification, password reset, structured logging, monitoring, and
managed database backups.

## 📁 Environment Configuration

Backend variables are documented in `server/.env.example`.

Variable Purpose

---

`NODE_ENV` Runtime environment
`PORT` Express API port
`DATABASE_URL` PostgreSQL connection string
`JWT_SECRET` Secret used to sign session tokens
`JWT_EXPIRES_IN` Session token lifetime
`COOKIE_NAME` Authentication cookie name
`COOKIE_SECURE` Whether the cookie requires HTTPS
`CLIENT_ORIGIN` Allowed frontend origin

The frontend uses `VITE_API_BASE_URL` only when the API is hosted on a
different origin. For local development, leave it empty and use the Vite
proxy.

## 📝 Design Decisions and Scope

- **Calendar dates:** Reading dates are represented as `YYYY-MM-DD`
  calendar dates and stored using PostgreSQL's `DATE` type to avoid
  accidental day shifts caused by timestamp timezone conversion.
- **Four readings per day:** The four allowed time slots and the
  unique user/date/slot constraint prevent duplicate entries and
  naturally cap a day at four readings.
- **Monthly reporting:** The monthly report represents the entire
  previous calendar month.
- **Average calculation:** The average is calculated from the readings
  in the selected reporting period and rounded to one decimal place.
- **Focused scope:** Redis caching, background queues, and doctor-role
  workflows are not included; the implementation focuses on the
  required personal tracking and reporting workflow.

> Sweety is a personal logging and reporting application. It is not a
> medical device and does not provide diagnosis, treatment
> recommendations, or clinical interpretation. Users should consult a
> qualified healthcare professional about their readings.

## 📌 Project Status

The application has been started locally, the PostgreSQL database has
been migrated and seeded, the API health endpoint has been verified, and
the backend automated test suite has passed its current four tests.
Complete the remaining manual validation checklist and client production
build before treating the project as fully verified.

---

::: {align="center"}
**Sweety -- Blood Glucose Tracker**

Built with React · Express · Prisma · PostgreSQL
:::
