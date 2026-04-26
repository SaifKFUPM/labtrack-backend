# LabTrack — Backend Implementation Checklist

All endpoints are mapped directly from the frontend source code.  
Check off as you go. Priority: 🔴 must-have · 🟡 important · 🟢 nice-to-have

---

## Progress

| Group | Done | Total |
|---|---|---|
| Auth | 2 / 3 | |
| Student — Labs | 0 / 4 | |
| Student — Submissions | 0 / 2 | |
| Student — Progress | 0 / 2 | |
| Student — Versions | 0 / 2 | |
| Student — Grades | 0 / 1 | |
| Student — Courses | 0 / 1 | |
| Student — Peer Reviews | 0 / 5 | |
| Instructor — Labs | 0 / 5 | |
| Instructor — Submissions | 0 / 3 | |
| Instructor — Plagiarism | 0 / 3 | |
| Instructor — Analytics | 0 / 1 | |
| Admin — Users | 0 / 4 | |
| Admin — Courses | 0 / 4 | |
| Admin — Departments | 0 / 3 | |
| Admin — System | 0 / 8 | |
| Admin — Security | 0 / 4 | |
| Admin — Analytics | 0 / 3 | |
| **Total** | **2 / 58** | |

---

## AUTH

- [x] 🔴 `POST /api/auth/register` — body: `{ fullName, email, password, role }` — returns `{ user, token }`
- [x] 🔴 `POST /api/auth/login` — body: `{ email, password }` — returns `{ user, token }`
- [ ] 🔴 `GET /api/auth/me` — returns `{ id, fullName, email, role, department, status }`

> Response user shape must always be: `{ id, fullName, email, role, department, status }`

---

## STUDENT — Labs

- [ ] 🔴 `GET /api/labs` — query: `?status=active` — returns array of labs with `{ id, title, labNumber, language, dueDate, status, points, difficulty, description, starterCode, testCases, solutions }`
- [ ] 🔴 `GET /api/labs/:labId` — returns single lab, same shape
- [ ] 🔴 `GET /api/labs/:labId/versions` — returns `[{ version, code, timestamp }]`
- [ ] 🔴 `POST /api/labs/:labId/versions` — body: `{ code, timestamp }` — saves version

---

## STUDENT — Submissions

- [ ] 🔴 `POST /api/submissions/:labId` — body: `{ code, language }` — runs tests, returns `{ id, status, testResults }`
- [ ] 🔴 `GET /api/grades` — returns `[{ id, lab, score, testsPassed, testsTotal, grade, feedback, status, submittedAt }]`

---

## STUDENT — Progress

- [ ] 🔴 `GET /api/progress` — returns `{ [labId]: { status, submittedAt, score } }`
- [ ] 🔴 `PATCH /api/progress/:labId` — body: `{ status, code, submittedAt }` — updates progress entry

---

## STUDENT — Courses

- [ ] 🔴 `GET /api/courses` — query: `?enrolled=true` — returns `[{ id, courseCode, name, sections[{ enrolledStudentIds }] }]`

---

## STUDENT — Peer Reviews

- [ ] 🟡 `GET /api/peer-reviews` — returns `[{ id, labId, labTitle, status, dueDate, sharedAt, files, fileContents, review }]`
- [ ] 🟡 `GET /api/peer-reviews/:reviewId` — returns single review + `testsPassed`
- [ ] 🟡 `POST /api/peer-reviews/:reviewId/submit` — body: `{ readability, efficiency, comments, strengths, improvements, overallComment, lineComments, submittedAt }`
- [ ] 🟡 `GET /api/peer-reviews/received/:labId` — returns review with `lineComments` for the current student
- [ ] 🟡 `POST /api/peer-reviews/share` — body: `{ labId, reviewerEmail, fileContents, files }` — returns `{ id, shareLink }`

---

## INSTRUCTOR — Lab Management

- [ ] 🔴 `GET /api/instructor/labs` — returns all labs created by this instructor
- [ ] 🔴 `POST /api/instructor/labs` — body: `{ title, labNumber, instructions, dueDate, points, difficulty, languages, testCases[], solutions[] }` — creates lab
- [ ] 🔴 `PATCH /api/instructor/labs/:labId` — body: any subset of above — updates lab
- [ ] 🔴 `DELETE /api/instructor/labs/:labId` — deletes lab
- [ ] 🔴 `PATCH /api/instructor/labs/:labId/publish` — body: `{ status: "active" }` — publishes lab, emails students

---

## INSTRUCTOR — Submissions & Grading

- [ ] 🔴 `GET /api/instructor/labs/:labId/submissions` — returns `[{ id, studentId, studentName, studentEmail, status, submittedAt, code, score, maxScore, late, testResults[], rubric, overallFeedback }]`
- [ ] 🔴 `PATCH /api/instructor/submissions/:subId/grade` — body: `{ score, rubric: { comments, style, efficiency }, inlineComments, overallFeedback, status: "graded" }` — saves grade, emails student
- [ ] 🟡 `POST /api/instructor/submissions/bulk-grade` — body: `{ updates: [{ subId, score, feedback }] }` — bulk grades array of submissions

---

## INSTRUCTOR — Plagiarism

- [ ] 🟡 `POST /api/instructor/labs/:labId/check-plagiarism` — triggers check — returns `{ pairs: [{ studentAId, studentBId, similarity, flagged }] }`
- [ ] 🟡 `GET /api/instructor/labs/:labId/plagiarism` — returns saved pairs
- [ ] 🟡 `PATCH /api/instructor/labs/:labId/plagiarism/:pairKey` — body: `{ flagged }` — updates flag status

---

## INSTRUCTOR — Analytics

- [ ] 🟡 `GET /api/instructor/labs/:labId/analytics` — returns `{ stats, distribution, timeline, topSubmitters }`

---

## ADMIN — User Management

- [ ] 🔴 `GET /api/admin/users` — returns `[{ id, fullName, email, role, department, studentId, status, lastLogin, createdAt }]`
- [ ] 🔴 `POST /api/admin/users` — body: `{ fullName, email, password, role, department, studentId }` — creates user, emails welcome
- [ ] 🔴 `PATCH /api/admin/users/:userId` — body: `{ role, department, status }` — updates user
- [ ] 🔴 `DELETE /api/admin/users/:userId` — soft delete (set status: inactive)

---

## ADMIN — Course Management

- [ ] 🔴 `GET /api/admin/courses` — returns `[{ id, courseCode, name, department, creditHours, semester, sections[{ sectionNumber, enrolledStudentIds, instructorId, meetingDays }] }]`
- [ ] 🔴 `POST /api/admin/courses` — body: `{ courseCode, name, department, creditHours, semester, sections[] }` — creates course
- [ ] 🔴 `PATCH /api/admin/courses/:courseId` — body: any subset — updates course
- [ ] 🔴 `DELETE /api/admin/courses/:courseId` — deletes course

---

## ADMIN — Departments

- [ ] 🟡 `GET /api/admin/departments` — returns `[{ id, code, name, headId, contactEmail, policies{ latePenaltyPercent, defaultDeadlineTime, requireCodeComments, allowPeerCollaboration, maxGroupSize, plagiarismThreshold } }]`
- [ ] 🟡 `POST /api/admin/departments` — body: `{ code, name, headId, contactEmail, policies }` — creates dept
- [ ] 🟡 `PATCH /api/admin/departments/:deptId` — body: `{ policies }` — updates dept settings

---

## ADMIN — System Monitor & Maintenance

- [ ] 🟡 `GET /api/admin/system/logs` — returns `[{ id, level, service, message, timestamp, resolved }]`
- [ ] 🟡 `PATCH /api/admin/system/logs/:logId` — body: `{ resolved }` — marks log resolved
- [ ] 🟡 `DELETE /api/admin/system/logs` — clears all logs
- [ ] 🟡 `GET /api/admin/system/maintenance` — returns `{ active, message, scheduledStart, scheduledEnd, allowAdminAccess, history[] }`
- [ ] 🟡 `PATCH /api/admin/system/maintenance` — body: `{ active, message, scheduledStart, scheduledEnd, allowAdminAccess }`
- [ ] 🟡 `GET /api/admin/system/backups` — returns `[{ id, name, type, scope, size, status, ts, retention }]`
- [ ] 🟡 `POST /api/admin/system/backups/trigger` — body: `{ scope }` — returns `{ backupId, status }`
- [ ] 🟡 `GET /api/admin/system/backup-schedule` — returns schedule config
- [ ] 🟡 `PATCH /api/admin/system/backup-schedule` — updates schedule config

---

## ADMIN — System Settings

- [ ] 🟡 `GET /api/admin/system/settings` — returns `{ execution{ compilationTimeoutSec, executionTimeoutSec, memoryLimitMB }, languages[], api{ judgeApiUrl, judgeApiKey }, testing{}, notifications{} }`
- [ ] 🟡 `PATCH /api/admin/system/settings` — body: any subset — updates settings

---

## ADMIN — Security & Access Control

- [ ] 🟡 `GET /api/admin/security/settings` — returns `{ twoFactorRequired, sessionTimeoutMin, maxLoginAttempts, lockoutDurationMin, passwordExpiryDays, requireStrongPassword, examMode }`
- [ ] 🟡 `PATCH /api/admin/security/settings` — body: any subset — updates security config
- [ ] 🟡 `GET /api/admin/audit-logs` — returns `[{ id, actor, action, target, ip, ts, severity }]`
- [ ] 🟡 `DELETE /api/admin/audit-logs` — clears audit log

---

## ADMIN — Analytics

- [ ] 🟡 `GET /api/admin/analytics` — returns `{ stats{ users, courses, labs, depts }, deptSubs[], weekly[], langs[] }`
- [ ] 🟡 `POST /api/admin/analytics/reports` — body: `{ name, type, filters }` — saves report
- [ ] 🟡 `GET /api/admin/analytics/reports` — returns `[{ id, name, type, filters, generatedAt }]`

---

## New Models Needed

- [ ] `src/models/Progress.js` — studentId, labId, status, code, submittedAt, score
- [ ] `src/models/PeerReview.js` — labId, reviewerId, authorId, status, fileContents, files, readability, efficiency, comments, strengths, improvements, overallComment, lineComments, submittedAt, shareLink, dueDate
- [ ] `src/models/Department.js` — code, name, headId, contactEmail, policies{}
- [ ] `src/models/SystemLog.js` — level, service, message, resolved
- [ ] `src/models/AuditLog.js` — actor, action, target, ip, severity
- [ ] `src/models/SystemSettings.js` — execution{}, languages[], api{}, testing{}, notifications{}

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
