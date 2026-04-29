# LabTrack — Backend Implementation Checklist

> **Team notice:** If you implement or finish any endpoint, please check it off in this file and update the progress table. Commit the updated checklist along with your code so the team always has an accurate count. Don't wait — check it off as soon as it's done.

All endpoints are mapped directly from the frontend source code.  
Check off as you go. Priority: 🔴 must-have · 🟡 important · 🟢 nice-to-have

---

## Progress

| Group                    | Done        | Total |
| ------------------------ | ----------- | ----- |
| Auth                     | 3 / 3       | ✅    |
| Student — Labs           | 4 / 4       | ✅    |
| Student — Submissions    | 2 / 2       | ✅    |
| Student — Progress       | 2 / 2       | ✅    |
| Student — Versions       | 2 / 2       | ✅    |
| Student — Grades         | 1 / 1       | ✅    |
| Student — Courses        | 1 / 1       | ✅    |
| Student — Peer Reviews   | 5 / 5       | ✅    |
| Instructor — Labs        | 5 / 5       | ✅    |
| Instructor — Submissions | 3 / 3       | ✅    |
| Instructor — Plagiarism  | 3 / 3       | ✅    |
| Instructor — Analytics   | 1 / 1       | ✅    |
| Admin — Users            | 4 / 4       | ✅    |
| Admin — Courses          | 4 / 4       | ✅    |
| Admin — Departments      | 3 / 3       | ✅    |
| Admin — System           | 9 / 9       | ✅    |
| Admin — Security         | 4 / 4       | ✅    |
| Admin — Analytics        | 3 / 3       | ✅    |
| **Total**                | **58 / 58** |       |

---

## AUTH

- [x] 🔴 `POST /api/auth/register` — body: `{ fullName, email, password, role }` — returns `{ user, token }`
- [x] 🔴 `POST /api/auth/login` — body: `{ email, password }` — returns `{ user, token }`
- [x] 🔴 `GET /api/auth/me` — returns `{ id, fullName, email, role, department, status }`

> Response user shape must always be: `{ id, fullName, email, role, department, status }`

---

## STUDENT — Labs

- [x] 🔴 `GET /api/student/labs` — query: `?status=active` — returns array of labs with `{ id, title, labNumber, language, dueDate, status, points, difficulty, description, starterCode, testCases, solutions }`
- [x] 🔴 `GET /api/student/labs/:labId` — returns single lab, same shape
- [x] 🔴 `GET /api/student/labs/:labId/versions` — returns `[{ version, code, timestamp }]`
- [x] 🔴 `POST /api/student/labs/:labId/versions` — body: `{ code, timestamp }` — saves version

---

## STUDENT — Submissions

- [x] 🔴 `POST /api/student/submissions/:labId` — body: `{ code, language }` — runs tests, returns `{ id, status, testResults }`
- [x] 🔴 `GET /api/student/submissions/:labId` — get submission details

---

## STUDENT — Progress

- [x] 🔴 `GET /api/progress` — returns `{ [labId]: { status, submittedAt, score } }`
- [x] 🔴 `PATCH /api/progress/:labId` — body: `{ status, code, submittedAt }` — updates progress entry

---

## STUDENT — Courses

- [x] 🔴 `GET /api/student/courses` — query: `?enrolled=true` — returns `[{ id, courseCode, name, sections[{ enrolledStudentIds }] }]`

---

## STUDENT — Grades

- [x] 🔴 `GET /api/student/grades` — returns `[{ id, lab, score, testsPassed, testsTotal, grade, feedback, status, submittedAt }]`

---

## STUDENT — Peer Reviews

- [x] 🟡 `GET /api/peer-reviews` — returns `[{ id, labId, labTitle, status, dueDate, sharedAt, files, fileContents, review }]`
- [x] 🟡 `GET /api/peer-reviews/:reviewId` — returns single review + `testsPassed`
- [x] 🟡 `POST /api/peer-reviews/:reviewId/submit` — body: `{ readability, efficiency, comments, strengths, improvements, overallComment, lineComments, submittedAt }`
- [x] 🟡 `GET /api/peer-reviews/received/:labId` — returns review with `lineComments` for the current student
- [x] 🟡 `POST /api/peer-reviews/share` — body: `{ labId, reviewerEmail, fileContents, files }` — returns `{ id, shareLink }`

---

## INSTRUCTOR — Lab Management

- [x] 🔴 `GET /api/instructor/labs` — returns all labs created by this instructor
- [x] 🔴 `POST /api/instructor/labs` — body: `{ title, labNumber, instructions, dueDate, points, difficulty, languages, testCases[], solutions[] }` — creates lab
- [x] 🔴 `PATCH /api/instructor/labs/:labId` — body: any subset of above — updates lab
- [x] 🔴 `DELETE /api/instructor/labs/:labId` — deletes lab
- [x] 🔴 `PATCH /api/instructor/labs/:labId/publish` — body: `{ status: "active" }` — publishes lab, emails students

---

## INSTRUCTOR — Submissions & Grading

- [x] 🔴 `GET /api/instructor/labs/:labId/submissions` — returns `[{ id, studentId, studentName, studentEmail, status, submittedAt, code, score, maxScore, late, testResults[], rubric, overallFeedback }]`
- [x] 🔴 `PATCH /api/instructor/submissions/:subId/grade` — body: `{ score, rubric: { comments, style, efficiency }, inlineComments, overallFeedback, status: "graded" }` — saves grade, emails student
- [x] 🟡 `POST /api/instructor/submissions/bulk-grade` — body: `{ updates: [{ subId, score, feedback }] }` — bulk grades array of submissions

---

## INSTRUCTOR — Plagiarism

- [x] 🟡 `POST /api/instructor/labs/:labId/check-plagiarism` — triggers check — returns `{ pairs: [{ studentAId, studentBId, similarity, flagged }] }`
- [x] 🟡 `GET /api/instructor/labs/:labId/plagiarism` — returns saved pairs
- [x] 🟡 `PATCH /api/instructor/labs/:labId/plagiarism/:pairKey` — body: `{ flagged }` — updates flag status

---

## INSTRUCTOR — Analytics

- [x] 🟡 `GET /api/instructor/labs/:labId/analytics` — returns `{ stats, distribution, timeline, topSubmitters }`

---

## ADMIN — User Management

- [x] 🔴 `GET /api/admin/users` — returns `[{ id, fullName, email, role, department, studentId, status, lastLogin, createdAt }]`
- [x] 🔴 `POST /api/admin/users` — body: `{ fullName, email, password, role, department, studentId }` — creates user, emails welcome
- [x] 🔴 `PATCH /api/admin/users/:userId` — body: `{ role, department, status }` — updates user
- [x] 🔴 `DELETE /api/admin/users/:userId` — soft delete (set status: inactive)

---

## ADMIN — Course Management

- [x] 🔴 `GET /api/admin/courses` — returns `[{ id, courseCode, name, department, creditHours, semester, sections[{ sectionNumber, enrolledStudentIds, instructorId, meetingDays }] }]`
- [x] 🔴 `POST /api/admin/courses` — body: `{ courseCode, name, department, creditHours, semester, sections[] }` — creates course
- [x] 🔴 `PATCH /api/admin/courses/:courseId` — body: any subset — updates course
- [x] 🔴 `DELETE /api/admin/courses/:courseId` — deletes course

---

## ADMIN — Departments

- [x] 🟡 `GET /api/admin/departments` — returns `[{ id, code, name, headId, contactEmail, policies{ latePenaltyPercent, defaultDeadlineTime, requireCodeComments, allowPeerCollaboration, maxGroupSize, plagiarismThreshold } }]`
- [x] 🟡 `POST /api/admin/departments` — body: `{ code, name, headId, contactEmail, policies }` — creates dept
- [x] 🟡 `PATCH /api/admin/departments/:deptId` — body: `{ policies }` — updates dept settings

---

## ADMIN — System Monitor & Maintenance

- [x] 🟡 `GET /api/admin/system/logs` — returns `[{ id, level, service, message, timestamp, resolved }]`
- [x] 🟡 `PATCH /api/admin/system/logs/:logId` — body: `{ resolved }` — marks log resolved
- [x] 🟡 `DELETE /api/admin/system/logs` — clears all logs
- [x] 🟡 `GET /api/admin/system/maintenance` — returns `{ active, message, scheduledStart, scheduledEnd, allowAdminAccess, history[] }`
- [x] 🟡 `PATCH /api/admin/system/maintenance` — body: `{ active, message, scheduledStart, scheduledEnd, allowAdminAccess }`
- [x] 🟡 `GET /api/admin/system/backups` — returns `[{ id, name, type, scope, size, status, ts, retention }]`
- [x] 🟡 `POST /api/admin/system/backups/trigger` — body: `{ scope }` — returns `{ backupId, status }`
- [x] 🟡 `GET /api/admin/system/backup-schedule` — returns schedule config
- [x] 🟡 `PATCH /api/admin/system/backup-schedule` — updates schedule config

---

## ADMIN — System Settings

- [x] 🟡 `GET /api/admin/system/settings` — returns `{ execution{ compilationTimeoutSec, executionTimeoutSec, memoryLimitMB }, languages[], api{ judgeApiUrl, judgeApiKey }, testing{}, notifications{} }`
- [x] 🟡 `PATCH /api/admin/system/settings` — body: any subset — updates settings

---

## ADMIN — Security & Access Control

- [x] 🟡 `GET /api/admin/security/settings` — returns `{ twoFactorRequired, sessionTimeoutMin, maxLoginAttempts, lockoutDurationMin, passwordExpiryDays, requireStrongPassword, examMode }`
- [x] 🟡 `PATCH /api/admin/security/settings` — body: any subset — updates security config
- [x] 🟡 `GET /api/admin/audit-logs` — returns `[{ id, actor, action, target, ip, ts, severity }]`
- [x] 🟡 `DELETE /api/admin/audit-logs` — clears audit log

---

## ADMIN — Analytics

- [x] 🟡 `GET /api/admin/analytics` — returns `{ stats{ users, courses, labs, depts }, deptSubs[], weekly[], langs[] }`
- [x] 🟡 `POST /api/admin/analytics/reports` — body: `{ name, type, filters }` — saves report
- [x] 🟡 `GET /api/admin/analytics/reports` — returns `[{ id, name, type, filters, generatedAt }]`

---

## New Models Needed


- [x] `src/models/Department.js` — code, name, headId, contactEmail, policies{}
- [x] `src/models/SystemLog.js` — level, service, message, resolved
- [x] `src/models/AuditLog.js` — actor, action, target, ip, severity
- [x] `src/models/SystemSettings.js` — execution{}, languages[], api{}, testing{}, notifications{}
- [x] `src/models/Progress.js` — studentId, labId, status, code, submittedAt, score
- [x] `src/models/PeerReview.js` — labId, reviewerId, authorId, status, fileContents, files, readability, efficiency, comments, strengths, improvements, overallComment, lineComments, submittedAt, shareLink, dueDate

---

## Frontend Wiring Notes

- Token is stored inside the user object: `{ ...user, token }`
- All API requests need `Authorization: Bearer <token>` header
- Frontend reads `VITE_API_URL` — set this in frontend `.env`: `VITE_API_URL=http://localhost:5000/api`
- Frontend has no `axios` yet — needs `src/utils/api.js` wrapper added on their side

---

## Build Order (one week)

1. 🔴 Auth `/me` — 15 min
2. 🔴 New models: Progress, PeerReview, Department
3. 🔴 Student labs, progress, submissions, grades, courses
4. 🔴 Instructor labs + grading
5. 🔴 Admin users + courses
6. 🟡 Instructor plagiarism + analytics
7. 🟡 Admin departments + system + security + analytics
8. 🟡 Peer reviews
