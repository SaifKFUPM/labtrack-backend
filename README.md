# LabTrack Backend

REST API for LabTrack, a programming lab management platform for KFUPM courses.

The backend is built with Node.js, Express, MongoDB Atlas, JWT authentication, JDoodle code execution, and Nodemailer password reset email.

## Live Services

| Service | URL |
| --- | --- |
| Backend API | `https://labtrack-backend-pjbq.onrender.com` |
| Health check | `https://labtrack-backend-pjbq.onrender.com/api/health` |
| Frontend | `https://labtrack-frontend-pearl.vercel.app` |

Production backend hosting is on Render. Production frontend hosting is on Vercel.

## Team

| Name | ID |
| --- | --- |
| Saif Alsadah | 202257480 |
| Haidar Aldahan | 202256620 |
| Hassan Al Henedi | 202276380 |
| Muhannad Almelaifi | 202253960 |

## Tech Stack

- Node.js and Express
- MongoDB Atlas and Mongoose
- JWT and bcryptjs
- JDoodle API for code execution
- Nodemailer for password reset email
- Render for backend deployment

## Features

- Role-based authentication for students, instructors, and admins
- Password reset flow with emailed reset links
- Student lab listing, workspace save/run/submit flow, grades, history, reference solutions, and peer reviews
- Instructor lab management, course sections, students, submissions, grading, analytics, plagiarism review, and settings
- Admin user, course, department, system, security, analytics, and backup management
- Seed script for demo users, courses, labs, test cases, and submissions

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas database
- JDoodle API credentials
- SMTP account for password reset email

### Install

```bash
npm install
```

### Environment

Copy the example file and fill in values:

```bash
cp .env.example .env
```

Required variables:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/?appName=labtrack
MONGO_DB_NAME=labtrack_db

JWT_SECRET=<strong-secret>
JWT_EXPIRES_IN=30m

FRONTEND_URL=http://localhost:5173

JDOODLE_CLIENT_ID=<jdoodle-client-id>
JDOODLE_CLIENT_SECRET=<jdoodle-client-secret>

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=swe.labtrack.noreply@gmail.com
SMTP_PASS=<gmail-app-password>
MAIL_FROM="LabTrack <swe.labtrack.noreply@gmail.com>"

PASSWORD_RESET_TTL_MINUTES=30
REQUIRE_EMAIL_DELIVERY=true
NODE_ENV=development
```

Notes:

- Do not commit `.env`.
- Render provides `PORT`, so it does not need to be set there.
- Use a Gmail app password for `SMTP_PASS`; do not use the normal Gmail password.
- Set `FRONTEND_URL` to the Vercel URL in production.

### Run Locally

```bash
npm run dev
```

The API starts on:

```txt
http://localhost:5000
```

Check:

```txt
http://localhost:5000/api/health
```

### Production Start

```bash
npm start
```

## Demo Data

Run the seed script when you need a fresh demo dataset:

```bash
npm run seed:demo
```

Seeded accounts use this password:

```txt
LabTrack123
```

Known demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@kfupm.edu.sa` | `LabTrack123` |
| Instructor | `instructor@kfupm.edu.sa` | `LabTrack123` |
| Student | `student1@kfupm.edu.sa` | `LabTrack123` |
| Student | `student2@kfupm.edu.sa` | `LabTrack123` |

The live database may also contain manually created users. Use the admin panel or forgot-password flow for those accounts.

## API Overview

All protected routes require:

```txt
Authorization: Bearer <token>
```

### Auth

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Register a user |
| POST | `/api/auth/login` | Public | Login and get JWT token |
| POST | `/api/auth/forgot-password` | Public | Send password reset email |
| POST | `/api/auth/reset-password/:token` | Public | Reset password from email token |
| GET | `/api/auth/me` | Authenticated | Get current user |

### Student

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/student/courses` | Get enrolled courses |
| GET | `/api/student/labs` | Get assigned labs |
| GET | `/api/student/labs/:labId` | Get lab details |
| POST | `/api/student/labs/:labId/run` | Run current workspace against lab test cases |
| POST | `/api/student/submissions/:labId` | Submit lab solution |
| GET | `/api/student/labs/:labId/versions` | List saved versions |
| POST | `/api/student/labs/:labId/versions` | Save a version |
| GET | `/api/student/grades` | Get grades and feedback |
| GET | `/api/student/submissions/:labId` | Get submission details |
| GET | `/api/progress` | Get progress map |
| PATCH | `/api/progress/:labId` | Update lab progress |

### Instructor

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/instructor/labs` | List instructor labs |
| POST | `/api/instructor/labs` | Create a lab |
| GET | `/api/instructor/labs/:labId` | Get lab details |
| PATCH | `/api/instructor/labs/:labId` | Update lab |
| DELETE | `/api/instructor/labs/:labId` | Delete lab |
| PATCH | `/api/instructor/labs/:labId/publish` | Publish lab |
| GET | `/api/instructor/labs/:labId/submissions` | List lab submissions |
| PATCH | `/api/instructor/submissions/:subId/grade` | Grade submission |
| POST | `/api/instructor/submissions/bulk-grade` | Bulk grade submissions |
| GET | `/api/instructor/labs/:labId/analytics` | Lab analytics |
| GET | `/api/instructor/labs/:labId/plagiarism` | Get plagiarism review |
| POST | `/api/instructor/labs/:labId/check-plagiarism` | Run plagiarism check |
| GET | `/api/instructor/courses` | List instructor courses |
| GET | `/api/instructor/students` | List unique instructor students |
| GET | `/api/instructor/settings` | Get instructor settings |
| PATCH | `/api/instructor/settings` | Update instructor settings |

### Admin

Admin routes live under `/api/admin` and cover users, courses, departments, settings, monitoring, analytics, security, audit logs, and backups.

### Peer Reviews

Peer review routes live under `/api/peer-reviews` and cover sharing, assigned reviews, received reviews, and review submission.

### Compile

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/compile` | Run code through JDoodle |

Supported labels:

| Label | JDoodle ID |
| --- | --- |
| `python` | `python3` |
| `cpp` | `cpp17` |
| `java` | `java` |
| `c` | `c` |
| `javascript` | `nodejs` |

## Deployment

Render settings:

```txt
Build Command: npm install
Start Command: npm start
Health Check Path: /api/health
```

Required Render env values are the same as `.env.example`, except Render supplies `PORT`.

After the frontend URL changes, update:

```env
FRONTEND_URL=https://labtrack-frontend-pearl.vercel.app
```

Then redeploy the Render service so CORS and password reset links use the correct frontend URL.

## Security Notes

- Never commit `.env`.
- Rotate any secret that was accidentally shared.
- Use app passwords or provider-specific SMTP credentials for email.
- Keep `JWT_SECRET`, `MONGO_URI`, `JDOODLE_CLIENT_SECRET`, and `SMTP_PASS` private.
