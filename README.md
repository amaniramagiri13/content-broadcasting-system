# Content Broadcasting System

A backend system for broadcasting educational content from teachers to students.
Teachers upload content, principals approve it, and students access live content via a public API.

## Tech Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Auth**: JWT + bcrypt
- **File Upload**: Multer (local storage)
- **Rate Limiting**: express-rate-limit

## Setup

### 1. Clone and install
```bash
git clone <repo-url>
cd content-broadcasting-system
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```

### 3. Create database
```bash
psql -U postgres -c "CREATE DATABASE content_broadcasting;"
```

### 4. Run migrations
```bash
npm run migrate
```

### 5. Seed demo data
```bash
npm run seed
```

### 6. Start the server
```bash
npm start
```

## Demo Credentials

| Role      | Email                  | Password     |
|-----------|------------------------|--------------|
| Principal | principal@school.com   | principal123 |
| Teacher 1 | teacher1@school.com    | teacher123   |
| Teacher 2 | teacher2@school.com    | teacher456   |

## API Endpoints

### Auth
- POST /auth/register
- POST /auth/login
- GET /auth/me

### Teacher
- POST /content/upload
- GET /content/my
- GET /content/:id

### Principal
- GET /approval/content
- GET /approval/pending
- PATCH /approval/content/:id/review

### Public (No Auth)
- GET /content/live/:teacherId
- GET /content/live/:teacherId?subject=maths

## Scheduling Logic
Content rotates automatically based on duration.
System uses modular arithmetic to determine active content — no cron jobs needed.

## Assumptions
- Content without start_time/end_time will not appear in live broadcasts
- Subjects are free-form strings stored in lowercase
