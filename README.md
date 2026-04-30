# LabTrack Backend

REST API for **LabTrack** — an integrated web platform for managing programming laboratory assignments at KFUPM.

Built with Node.js + Express + MongoDB.

---

## Team

| Name               | ID        |
| ------------------ | --------- |
| Saif Alsadah       | 202257480 |
| Haidar Aldahan     | 202256620 |
| Hassan Al Henedi   | 202276380 |
| Muhannad Almelaifi | 202253960 |

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** JWT + bcryptjs
- **Code Execution:** JDoodle API
- **Email:** Nodemailer
- **Deployment:** Railway (backend) + Vercel (frontend) + MongoDB Atlas (database)

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm
- MongoDB Atlas account
- JDoodle API account

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/labtrack-backend.git
cd labtrack-backend
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@labtrack.xxxxx.mongodb.net/labtrack_db
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=30m
JDOODLE_CLIENT_ID=your_client_id
JDOODLE_CLIENT_SECRET=your_client_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
FRONTEND_URL=http://localhost:3000
```

### Run in Development

```bash
npm run dev
```

Server starts on `http://localhost:5000`

---

## Project Structure

```
labtrack-backend/
├── src/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification
│   │   ├── roleMiddleware.js      # Role-based access control
│   │   └── errorMiddleware.js     # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Lab.js                 # embeds testCases + solutions
│   │   ├── Submission.js          # embeds testResults + rubric
│   │   └── Version.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── compile.routes.js
│   │   ├── student.routes.js      # ✅ wired in app.js
│   │   ├── instructor.routes.js   # ✅ implemented
│   │   └── admin.routes.js        # ✅ implemented
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── compile.controller.js
│   │   ├── student.controller.js  # ✅ core student endpoints implemented
│   │   ├── instructor.controller.js  # ✅ implemented
│   │   └── admin.controller.js       # ✅ implemented
│   ├── services/
│   │   ├── compile.service.js     # JDoodle API wrapper
│   │   ├── testRunner.service.js  # ✅ executes embedded lab testCases
│   │   └── email.service.js       # 🔲 in progress
│   └── utils/
│       ├── asyncHandler.js
│       └── generateToken.js
├── app.js
├── server.js
├── .env
├── .env.example
└── package.json
```

---

## API Reference

### Auth

| Method | Endpoint             | Access        | Description             |
| ------ | -------------------- | ------------- | ----------------------- |
| POST   | `/api/auth/register` | Public        | Register new user       |
| POST   | `/api/auth/login`    | Public        | Login and get JWT token |
| GET    | `/api/auth/me`       | Authenticated | Get current user        |

### Compile

| Method | Endpoint       | Access        | Description              |
| ------ | -------------- | ------------- | ------------------------ |
| POST   | `/api/compile` | Authenticated | Run code via JDoodle API |

### Student (wired)

| Method | Endpoint                             | Access  | Description                          |
| ------ | ------------------------------------ | ------- | ------------------------------------ |
| GET    | `/api/student/courses?enrolled=true` | Student | Get enrolled courses                 |
| GET    | `/api/student/labs?status=active`    | Student | Get active labs for enrolled courses |
| GET    | `/api/student/labs/:labId`           | Student | Get single lab details               |
| POST   | `/api/student/submissions/:labId`    | Student | Submit code and run tests            |
| GET    | `/api/student/labs/:labId/versions`  | Student | Get submission version history       |
| POST   | `/api/student/labs/:labId/versions`  | Student | Save a new code version              |
| GET    | `/api/student/grades`                | Student | Get graded submissions               |
| GET    | `/api/student/submissions/:labId`    | Student | Get details for a submission         |
| GET    | `/api/progress`                      | Student | Get progress map for current student |
| PATCH  | `/api/progress/:labId`               | Student | Update a progress entry for a lab    |

### Instructor

| Method | Endpoint                                   | Access     | Description                    |
| ------ | ------------------------------------------ | ---------- | ------------------------------ |
| GET    | `/api/instructor/labs`                     | Instructor | List labs made by instructor   |
| POST   | `/api/instructor/labs`                     | Instructor | Create a new lab               |
| PATCH  | `/api/instructor/labs/:labId`              | Instructor | Update lab details             |
| DELETE | `/api/instructor/labs/:labId`              | Instructor | Delete a lab                   |
| PATCH  | `/api/instructor/labs/:labId/publish`      | Instructor | Publish a lab (status: active) |
| GET    | `/api/instructor/labs/:labId/submissions`  | Instructor | List lab submissions           |
| PATCH  | `/api/instructor/submissions/:subId/grade` | Instructor | Grade a submission             |
| POST   | `/api/instructor/submissions/bulk-grade`   | Instructor | Bulk grade submissions         |

### Admin

All admin endpoints listed in [Checklist.md](./Checklist.md) are implemented and included in the backend routes.

### Peer Reviews

All peer-review endpoints listed in [Checklist.md](./Checklist.md) are implemented and included in the backend routes.

---

## Contributing

> **Before you start:** check [Checklist.md](./Checklist.md) to see what's already done and what's available to pick up.
> **When you finish something:** mark it off in `Checklist.md`, update the progress table, and commit the checklist alongside your code.

---

## Implementation Progress

### ✅ Complete

- [x] Project setup — Express, MongoDB Atlas, folder structure
- [x] User model with bcrypt password hashing
- [x] JWT authentication — register, login, `/me`
- [x] Auth middleware — protects all routes
- [x] Role middleware — student / instructor / admin access control
- [x] Mongoose models — User, Course, Lab (embeds testCases + solutions), Submission (embeds testResults + rubric), Version
- [x] JDoodle compile service — run code in sandbox
- [x] `POST /api/compile` — working with Python, C++, Java, C
- [x] Wire student routes into app.js (courses, labs, submit, grades, versions)
- [x] Test runner service — run test cases, compare output, calculate score
- [x] Instructor routes — lab management, submissions, plagiarism, analytics
- [x] Admin routes — users, courses, departments, system, security, analytics
- [x] Peer review routes — list, share, submit, receive, and update reviews
- [x] Checklist coverage — 58 / 58 endpoints completed

### 🔲 In Progress / Not Started

- [ ] Email service — Nodemailer notifications
- [ ] Email triggers — new lab, graded submission, welcome email
- [ ] Deploy to Railway
- [ ] Connect frontend (Vercel) to backend (Railway)

---

## Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens expire after 30 minutes. Re-login to get a fresh token.

### Roles

| Role         | Access                              |
| ------------ | ----------------------------------- |
| `student`    | `/api/student/*`, `/api/compile`    |
| `instructor` | `/api/instructor/*`, `/api/compile` |
| `admin`      | `/api/admin/*`                      |

---

## Email Domain

All user accounts must use a `@kfupm.edu.sa` email address. Registration is rejected for any other domain.

---

## Code Execution

Code is executed via the **JDoodle API** in a sandboxed environment. Supported languages:

| Label    | JDoodle ID |
| -------- | ---------- |
| `python` | `python3`  |
| `cpp`    | `cpp17`    |
| `java`   | `java`     |
| `c`      | `c`        |

Free tier limit: **200 compilations per day**.
