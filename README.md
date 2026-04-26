# LabTrack Backend

REST API for **LabTrack** — an integrated web platform for managing programming laboratory assignments at KFUPM.

Built with Node.js + Express + MongoDB.

---

## Team

| Name | ID |
|---|---|
| Saif Alsadah | 202257480 |
| Haidar Aldahan | 202256620 |
| Hassan Al Henedi | 202276380 |
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
│   │   ├── student.routes.js      # 🔲 not wired in app.js yet
│   │   ├── instructor.routes.js   # 🔲 in progress
│   │   └── admin.routes.js        # 🔲 in progress
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── compile.controller.js
│   │   ├── student.controller.js  # 🔲 not wired in app.js yet
│   │   ├── instructor.controller.js  # 🔲 in progress
│   │   └── admin.controller.js       # 🔲 in progress
│   ├── services/
│   │   ├── compile.service.js     # JDoodle API wrapper
│   │   ├── testRunner.service.js  # 🔲 in progress
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

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login and get JWT token |
| GET | `/api/auth/me` | Authenticated | Get current user |

### Compile

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/compile` | Authenticated | Run code via JDoodle API |

### Student, Instructor, Admin *(not wired yet — see [Checklist.md](./Checklist.md))*

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

### 🔲 In Progress / Not Started

- [ ] Wire student routes into app.js (courses, labs, submit, grades, versions)
- [ ] Test runner service — run test cases, compare output, calculate score
- [ ] Instructor routes — create lab, grading, analytics
- [ ] Admin routes — user management, course setup, enrollment
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
| Role | Access |
|---|---|
| `student` | `/api/student/*`, `/api/compile` |
| `instructor` | `/api/instructor/*`, `/api/compile` |
| `admin` | `/api/admin/*` |

---

## Email Domain

All user accounts must use a `@kfupm.edu.sa` email address. Registration is rejected for any other domain.

---

## Code Execution

Code is executed via the **JDoodle API** in a sandboxed environment. Supported languages:

| Label | JDoodle ID |
|---|---|
| `python` | `python3` |
| `cpp` | `cpp17` |
| `java` | `java` |
| `c` | `c` |

Free tier limit: **200 compilations per day**.
