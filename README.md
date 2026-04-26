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
│   │   ├── Lab.js
│   │   ├── TestCase.js
│   │   ├── Submission.js
│   │   └── Version.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── student.routes.js
│   │   ├── compile.routes.js
│   │   ├── instructor.routes.js   # 🔲 in progress
│   │   └── admin.routes.js        # 🔲 in progress
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── student.controller.js
│   │   ├── compile.controller.js
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

### Student
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/student/courses` | Student | Get enrolled courses |
| GET | `/api/student/courses/:courseId/labs` | Student | Get labs for a course |
| GET | `/api/student/labs/:labId` | Student | Get lab details |
| POST | `/api/student/submit` | Student | Submit code for a lab |
| GET | `/api/student/grades` | Student | Get all graded submissions |
| POST | `/api/student/versions` | Student | Save a code version |
| GET | `/api/student/versions/:labId` | Student | Get version history |

### Compile
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/compile` | Authenticated | Run code via JDoodle API |

### Instructor *(in progress)*
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/instructor/labs` | Instructor | Create a new lab |
| PATCH | `/api/instructor/labs/:id/publish` | Instructor | Publish lab to students |
| POST | `/api/instructor/labs/:id/testcases` | Instructor | Add test case to lab |
| GET | `/api/instructor/submissions/:labId` | Instructor | View all submissions |
| GET | `/api/instructor/submissions/:labId/stats` | Instructor | Submission statistics |
| PATCH | `/api/instructor/grade/:submissionId` | Instructor | Grade a submission |
| POST | `/api/instructor/bulk-grade` | Instructor | Bulk grade submissions |

### Admin *(in progress)*
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/admin/users` | Admin | Create single user |
| POST | `/api/admin/users/bulk` | Admin | Bulk import users via CSV |
| GET | `/api/admin/users` | Admin | List all users |
| PATCH | `/api/admin/users/:id` | Admin | Update user |
| DELETE | `/api/admin/users/:id` | Admin | Deactivate user |
| POST | `/api/admin/courses` | Admin | Create course and sections |
| POST | `/api/admin/enroll` | Admin | Enroll students into a course |
| GET | `/api/admin/system` | Admin | System health metrics |

---

## Implementation Progress

### ✅ Complete
- [x] Project setup — Express, MongoDB Atlas, folder structure
- [x] User model with bcrypt password hashing
- [x] JWT authentication — register + login
- [x] Auth middleware — protects all routes
- [x] Role middleware — student / instructor / admin access control
- [x] All Mongoose models — User, Course, Lab, TestCase, Submission, Version
- [x] Student routes — courses, labs, submit, grades, versions
- [x] JDoodle compile service — run code in sandbox
- [x] `POST /api/compile` — working with Python, C++, Java, C

### 🔲 In Progress / Not Started
- [ ] Test runner service — run test cases, compare output, calculate score
- [ ] Wire test runner into submit flow
- [ ] Instructor routes — create lab, test cases, grade, analytics
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
