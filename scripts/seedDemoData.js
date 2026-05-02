require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Department = require("../src/models/Department");
const Course = require("../src/models/Course");
const Lab = require("../src/models/Lab");
const Submission = require("../src/models/Submission");
const Progress = require("../src/models/Progress");
const PeerReview = require("../src/models/PeerReview");
const Version = require("../src/models/Version");

const PASSWORD = "LabTrack123";
const DAY_MS = 24 * 60 * 60 * 1000;
const SEMESTER = "T252";

const knownUsers = [
  {
    fullName: "LabTrack Admin",
    email: "admin@kfupm.edu.sa",
    role: "admin",
    department: "SWE",
  },
  {
    fullName: "LabTrack Instructor",
    email: "instructor@kfupm.edu.sa",
    role: "instructor",
    department: "SWE",
  },
  {
    fullName: "LabTrack Student One",
    email: "student1@kfupm.edu.sa",
    role: "student",
    department: "ICS",
    studentId: "20250001",
  },
  {
    fullName: "LabTrack Student Two",
    email: "student2@kfupm.edu.sa",
    role: "student",
    department: "ICS",
    studentId: "20250002",
  },
];

const courseSeeds = [
  {
    code: "ICS 104",
    name: "Introduction to Programming in Python and C",
    department: "ICS",
    creditHours: 3,
    joinCode: "ICS104",
    meetingTimes: "Sun/Tue 09:00-10:15",
  },
  {
    code: "ICS 108",
    name: "Object-oriented Programming",
    department: "ICS",
    creditHours: 4,
    joinCode: "ICS108",
    meetingTimes: "Mon/Wed 10:00-11:15",
  },
  {
    code: "ICS 202",
    name: "Data Structures and Algorithms",
    department: "ICS",
    creditHours: 4,
    joinCode: "ICS202",
    meetingTimes: "Sun/Tue 13:00-14:15",
  },
  {
    code: "SWE 326",
    name: "Software Testing",
    department: "SWE",
    creditHours: 3,
    joinCode: "SWE326",
    meetingTimes: "Mon/Wed 14:00-15:15",
  },
  {
    code: "SWE 363",
    name: "Web Engineering and Development",
    department: "SWE",
    creditHours: 3,
    joinCode: "SWE363",
    meetingTimes: "Sun/Tue 15:00-16:15",
  },
];

const codeFile = (name, content, fileType = "text/plain") => ({
  name,
  size: Buffer.byteLength(content, "utf8"),
  fileType,
  content,
});

const dueInDays = (days) => new Date(Date.now() + days * DAY_MS);

const testCase = (name, input, expectedOutput, points) => ({
  name,
  description: name,
  input,
  expectedOutput,
  points,
  visible: true,
  timeoutSeconds: 5,
  verified: true,
});

const makeLabSeeds = () => [
  {
    courseCode: "ICS 104",
    labNumber: 1,
    title: "Python Number Analyzer",
    difficulty: "easy",
    language: "Python",
    fileName: "solution.py",
    fileType: "text/x-python",
    dueDate: dueInDays(7),
    instructions:
      "Read integers from one line and print count, sum, minimum, and maximum using the exact output labels shown in the test cases.",
    starterCode: `numbers = list(map(int, input().split()))

# TODO: compute count, total, minimum, and maximum.
print("count=0")
print("sum=0")
print("min=0")
print("max=0")
`,
    solutionCode: `numbers = list(map(int, input().split()))
print(f"count={len(numbers)}")
print(f"sum={sum(numbers)}")
print(f"min={min(numbers)}")
print(f"max={max(numbers)}")
`,
    testCases: [
      testCase("Small positive list", "1 2 3 4", "count=4\nsum=10\nmin=1\nmax=4", 25),
      testCase("Includes negatives", "-5 10 0 2", "count=4\nsum=7\nmin=-5\nmax=10", 25),
      testCase("Single value", "42", "count=1\nsum=42\nmin=42\nmax=42", 25),
      testCase("Mixed order", "9 -1 9 3 0", "count=5\nsum=20\nmin=-1\nmax=9", 25),
    ],
  },
  {
    courseCode: "ICS 104",
    labNumber: 2,
    title: "Password Strength Classifier",
    difficulty: "easy",
    language: "Python",
    fileName: "solution.py",
    fileType: "text/x-python",
    dueDate: dueInDays(10),
    instructions:
      "Classify one password as weak, medium, or strong. Strong passwords have length at least 8, include a digit, and include an uppercase letter. Medium passwords satisfy any two of those rules.",
    starterCode: `password = input().strip()

# TODO: print weak, medium, or strong.
print("weak")
`,
    solutionCode: `password = input().strip()
checks = [
    len(password) >= 8,
    any(ch.isdigit() for ch in password),
    any(ch.isupper() for ch in password),
]
score = sum(checks)
if score == 3:
    print("strong")
elif score == 2:
    print("medium")
else:
    print("weak")
`,
    testCases: [
      testCase("Strong password", "LabTrack123", "strong", 25),
      testCase("No digit", "LabTrack", "medium", 25),
      testCase("Short but mixed", "Ab1", "medium", 25),
      testCase("Lowercase only", "lab", "weak", 25),
    ],
  },
  {
    courseCode: "ICS 108",
    labNumber: 1,
    title: "Java Grade Book Summary",
    difficulty: "medium",
    language: "Java",
    fileName: "Main.java",
    fileType: "text/x-java-source",
    dueDate: dueInDays(12),
    instructions:
      "Read n followed by n grades. Print the average with two decimals, the maximum grade, and the number of passing grades where passing means 60 or more.",
    starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int n = input.nextInt();
        // TODO: read grades and print avg, max, and passed.
    }
}
`,
    solutionCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int n = input.nextInt();
        int max = Integer.MIN_VALUE;
        int passed = 0;
        int total = 0;
        for (int i = 0; i < n; i++) {
            int grade = input.nextInt();
            total += grade;
            max = Math.max(max, grade);
            if (grade >= 60) passed++;
        }
        double avg = total / (double) n;
        System.out.printf(Locale.US, "avg=%.2f%n", avg);
        System.out.println("max=" + max);
        System.out.println("passed=" + passed);
    }
}
`,
    testCases: [
      testCase("All passing", "5\n70 80 90 60 100", "avg=80.00\nmax=100\npassed=5", 25),
      testCase("Mixed grades", "4\n59 60 75 40", "avg=58.50\nmax=75\npassed=2", 25),
      testCase("One grade", "1\n88", "avg=88.00\nmax=88\npassed=1", 25),
      testCase("Boundary values", "3\n0 100 60", "avg=53.33\nmax=100\npassed=2", 25),
    ],
  },
  {
    courseCode: "ICS 202",
    labNumber: 1,
    title: "Balanced Brackets",
    difficulty: "medium",
    language: "Python",
    fileName: "solution.py",
    fileType: "text/x-python",
    dueDate: dueInDays(8),
    instructions:
      "Use a stack to decide whether the input string has balanced (), [], and {} brackets. Ignore all non-bracket characters.",
    starterCode: `text = input().strip()

# TODO: use a stack and print balanced or not balanced.
print("not balanced")
`,
    solutionCode: `text = input().strip()
pairs = {")": "(", "]": "[", "}": "{"}
stack = []
ok = True
for ch in text:
    if ch in "([{":
        stack.append(ch)
    elif ch in pairs:
        if not stack or stack.pop() != pairs[ch]:
            ok = False
            break
print("balanced" if ok and not stack else "not balanced")
`,
    testCases: [
      testCase("Nested balanced", "{[()]}", "balanced", 25),
      testCase("Wrong order", "([)]", "not balanced", 25),
      testCase("With letters", "if (a[0] == b) { return c; }", "balanced", 25),
      testCase("Missing close", "((())", "not balanced", 25),
    ],
  },
  {
    courseCode: "ICS 202",
    labNumber: 2,
    title: "Shortest Path in an Unweighted Graph",
    difficulty: "hard",
    language: "Python",
    fileName: "solution.py",
    fileType: "text/x-python",
    dueDate: dueInDays(16),
    instructions:
      "Read n, m, then m undirected edges, then source and target. Print the length of the shortest path, or -1 if no path exists.",
    starterCode: `from collections import deque

n, m = map(int, input().split())
graph = [[] for _ in range(n)]
for _ in range(m):
    a, b = map(int, input().split())
    graph[a].append(b)
    graph[b].append(a)
source, target = map(int, input().split())

# TODO: run BFS and print the distance.
print(-1)
`,
    solutionCode: `from collections import deque

n, m = map(int, input().split())
graph = [[] for _ in range(n)]
for _ in range(m):
    a, b = map(int, input().split())
    graph[a].append(b)
    graph[b].append(a)
source, target = map(int, input().split())

dist = [-1] * n
dist[source] = 0
queue = deque([source])
while queue:
    node = queue.popleft()
    for nxt in graph[node]:
        if dist[nxt] == -1:
            dist[nxt] = dist[node] + 1
            queue.append(nxt)
print(dist[target])
`,
    testCases: [
      testCase("Direct edge", "3 2\n0 1\n1 2\n0 1", "1", 25),
      testCase("Two hops", "4 3\n0 1\n1 2\n2 3\n0 2", "2", 25),
      testCase("Unreachable", "5 2\n0 1\n2 3\n0 4", "-1", 25),
      testCase("Same source target", "2 1\n0 1\n1 1", "0", 25),
    ],
  },
  {
    courseCode: "SWE 326",
    labNumber: 1,
    title: "Boundary Value Classifier",
    difficulty: "easy",
    language: "Python",
    fileName: "solution.py",
    fileType: "text/x-python",
    dueDate: dueInDays(9),
    instructions:
      "Classify an age for boundary-value testing. Print invalid for ages outside 0..120, child for 0..12, teen for 13..19, adult for 20..64, and senior for 65..120.",
    starterCode: `age = int(input())

# TODO: print invalid, child, teen, adult, or senior.
print("invalid")
`,
    solutionCode: `age = int(input())
if age < 0 or age > 120:
    print("invalid")
elif age <= 12:
    print("child")
elif age <= 19:
    print("teen")
elif age <= 64:
    print("adult")
else:
    print("senior")
`,
    testCases: [
      testCase("Lower invalid", "-1", "invalid", 20),
      testCase("Child upper boundary", "12", "child", 20),
      testCase("Teen lower boundary", "13", "teen", 20),
      testCase("Adult upper boundary", "64", "adult", 20),
      testCase("Senior upper boundary", "120", "senior", 20),
    ],
  },
  {
    courseCode: "SWE 363",
    labNumber: 1,
    title: "HTTP Status Classifier",
    difficulty: "easy",
    language: "JavaScript",
    fileName: "solution.js",
    fileType: "text/javascript",
    dueDate: dueInDays(11),
    instructions:
      "Read one HTTP status code and print informational, success, redirect, client error, server error, or unknown.",
    starterCode: `const fs = require("fs");
const code = Number(fs.readFileSync(0, "utf8").trim());

// TODO: classify the code.
console.log("unknown");
`,
    solutionCode: `const fs = require("fs");
const code = Number(fs.readFileSync(0, "utf8").trim());

if (code >= 100 && code <= 199) console.log("informational");
else if (code >= 200 && code <= 299) console.log("success");
else if (code >= 300 && code <= 399) console.log("redirect");
else if (code >= 400 && code <= 499) console.log("client error");
else if (code >= 500 && code <= 599) console.log("server error");
else console.log("unknown");
`,
    testCases: [
      testCase("OK", "200", "success", 25),
      testCase("Not found", "404", "client error", 25),
      testCase("Gateway error", "502", "server error", 25),
      testCase("Outside HTTP range", "42", "unknown", 25),
    ],
  },
  {
    courseCode: "SWE 363",
    labNumber: 2,
    title: "URL Slug Generator",
    difficulty: "medium",
    language: "JavaScript",
    fileName: "solution.js",
    fileType: "text/javascript",
    dueDate: dueInDays(18),
    instructions:
      "Read a page title and convert it to a URL slug. Lowercase it, keep letters and numbers, replace groups of other characters with one hyphen, and trim extra hyphens.",
    starterCode: `const fs = require("fs");
const title = fs.readFileSync(0, "utf8").trim();

// TODO: print the slug.
console.log(title);
`,
    solutionCode: `const fs = require("fs");
const title = fs.readFileSync(0, "utf8").trim();
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");
console.log(slug);
`,
    testCases: [
      testCase("Basic title", "LabTrack Web Engineering", "labtrack-web-engineering", 25),
      testCase("Extra spaces", "  React   Router Basics  ", "react-router-basics", 25),
      testCase("Symbols", "API Design: REST & JSON!", "api-design-rest-json", 25),
      testCase("Numbers", "SWE 363 Lab 2", "swe-363-lab-2", 25),
    ],
  },
];

const ensureKnownUsers = async () => {
  const users = {};
  for (const seed of knownUsers) {
    let user = await User.findOne({ email: seed.email });
    if (!user) {
      user = new User(seed);
    } else {
      Object.assign(user, seed);
    }

    user.password = PASSWORD;
    user.status = "active";
    user.active = true;
    await user.save();
    users[seed.email] = user;
  }
  return users;
};

const seedDepartments = async (users) => {
  await Department.findOneAndUpdate(
    { code: "ICS" },
    {
      code: "ICS",
      name: "Information and Computer Science",
      headId: users["instructor@kfupm.edu.sa"]._id,
      contactEmail: "ics@kfupm.edu.sa",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  await Department.findOneAndUpdate(
    { code: "SWE" },
    {
      code: "SWE",
      name: "Software Engineering",
      headId: users["instructor@kfupm.edu.sa"]._id,
      contactEmail: "swe@kfupm.edu.sa",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
};

const clearDemoCourses = async () => {
  const courseCodes = courseSeeds.map((course) => course.code);
  const joinCodes = courseSeeds.map((course) => course.joinCode);
  const oldCourses = await Course.find({
    $or: [{ code: { $in: courseCodes } }, { joinCode: { $in: joinCodes } }],
  }).select("_id");
  const oldCourseIds = oldCourses.map((course) => course._id);
  const oldLabs = await Lab.find({ courseId: { $in: oldCourseIds } }).select("_id");
  const oldLabIds = oldLabs.map((lab) => lab._id);
  const oldSubmissions = await Submission.find({ labId: { $in: oldLabIds } }).select("_id");
  const oldSubmissionIds = oldSubmissions.map((submission) => submission._id);

  await Promise.all([
    Version.deleteMany({ submissionId: { $in: oldSubmissionIds } }),
    Submission.deleteMany({ _id: { $in: oldSubmissionIds } }),
    Progress.deleteMany({ labId: { $in: oldLabIds } }),
    PeerReview.deleteMany({ labId: { $in: oldLabIds } }),
    Lab.deleteMany({ _id: { $in: oldLabIds } }),
    Course.deleteMany({ _id: { $in: oldCourseIds } }),
  ]);
};

const createCourses = async (users) => {
  const instructor = users["instructor@kfupm.edu.sa"];
  const students = [
    users["student1@kfupm.edu.sa"]._id,
    users["student2@kfupm.edu.sa"]._id,
  ];
  const courses = {};

  for (const seed of courseSeeds) {
    const course = await Course.create({
      code: seed.code,
      name: seed.name,
      department: seed.department,
      semester: SEMESTER,
      creditHours: seed.creditHours,
      joinCode: seed.joinCode,
      active: true,
      sections: [
        {
          sectionNumber: "01",
          instructor: instructor._id,
          students,
          capacity: 35,
          meetingTimes: seed.meetingTimes,
        },
      ],
    });
    courses[seed.code] = course;
  }

  return courses;
};

const createLabs = async (courses, users) => {
  const instructor = users["instructor@kfupm.edu.sa"];
  const labs = {};

  for (const seed of makeLabSeeds()) {
    const starterFile = codeFile(seed.fileName, seed.starterCode, seed.fileType);
    const lab = await Lab.create({
      courseId: courses[seed.courseCode]._id,
      labNumber: seed.labNumber,
      title: seed.title,
      instructions: seed.instructions,
      dueDate: seed.dueDate,
      points: 100,
      difficulty: seed.difficulty,
      languages: [seed.language],
      starterCode: seed.starterCode,
      files: [seed.fileName],
      starterFiles: [starterFile],
      supportingFiles: [],
      status: "active",
      createdBy: instructor._id,
      testCases: seed.testCases,
      solutions: [
        {
          type: "instructor",
          title: "Reference Solution",
          language: seed.language,
          code: seed.solutionCode,
          files: { [seed.fileName]: seed.solutionCode },
          explanation: "One straightforward implementation that passes the seeded test cases.",
          releaseMode: "after_graded",
          status: "scheduled",
          unlockedAt: new Date(seed.dueDate.getTime() + 2 * DAY_MS),
        },
      ],
    });
    labs[`${seed.courseCode}#${seed.labNumber}`] = lab;
  }

  return labs;
};

const makeResults = (lab, passingIndexes) => {
  const passing = new Set(passingIndexes);
  return lab.testCases.map((test, index) => {
    const passed = passing.has(index);
    return {
      description: test.description,
      input: test.input,
      passed,
      actualOutput: passed ? test.expectedOutput : "incorrect output",
      expectedOutput: test.expectedOutput,
      points: passed ? test.points : 0,
      visible: test.visible,
    };
  });
};

const scoreFor = (lab, passingIndexes) => {
  const passing = new Set(passingIndexes);
  const total = lab.testCases.reduce((sum, test) => sum + test.points, 0);
  const earned = lab.testCases.reduce(
    (sum, test, index) => sum + (passing.has(index) ? test.points : 0),
    0,
  );
  return Math.round((earned / total) * lab.points);
};

const seedSubmissions = async (labs, users) => {
  const studentOne = users["student1@kfupm.edu.sa"];
  const studentTwo = users["student2@kfupm.edu.sa"];
  const instructor = users["instructor@kfupm.edu.sa"];
  const gradedLab = labs["ICS 104#1"];
  const pendingLab = labs["ICS 202#1"];
  const webLab = labs["SWE 363#1"];

  const gradedPassing = [0, 1, 2, 3];
  const pendingPassing = [0, 2, 3];
  const webPassing = [0, 1, 2, 3];

  const gradedSubmission = await Submission.create({
    studentId: studentOne._id,
    labId: gradedLab._id,
    code: makeLabSeeds().find((lab) => lab.courseCode === "ICS 104" && lab.labNumber === 1).solutionCode,
    language: "Python",
    status: "graded",
    score: scoreFor(gradedLab, gradedPassing),
    maxScore: gradedLab.points,
    rubric: { comments: 10, style: 10, efficiency: 10 },
    overallFeedback: "Clean solution and correct output formatting.",
    instructorNote: "Seeded demo submission.",
    testResults: makeResults(gradedLab, gradedPassing),
    submittedAt: new Date(Date.now() - 2 * DAY_MS),
    gradedBy: instructor._id,
    gradedAt: new Date(Date.now() - DAY_MS),
  });

  await Submission.create({
    studentId: studentTwo._id,
    labId: pendingLab._id,
    code: `text = input().strip()
print("balanced" if text.count("(") == text.count(")") else "not balanced")
`,
    language: "Python",
    status: "submitted",
    score: scoreFor(pendingLab, pendingPassing),
    maxScore: pendingLab.points,
    testResults: makeResults(pendingLab, pendingPassing),
    submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  });

  await Submission.create({
    studentId: studentOne._id,
    labId: webLab._id,
    code: makeLabSeeds().find((lab) => lab.courseCode === "SWE 363" && lab.labNumber === 1).solutionCode,
    language: "JavaScript",
    status: "submitted",
    score: scoreFor(webLab, webPassing),
    maxScore: webLab.points,
    testResults: makeResults(webLab, webPassing),
    submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  });

  await Version.create({
    submissionId: gradedSubmission._id,
    code: gradedSubmission.code,
    versionNumber: 1,
    description: "Seeded passing solution",
  });

  await Progress.create({
    studentId: studentOne._id,
    labId: labs["ICS 202#2"]._id,
    status: "in progress",
    code: "# BFS draft\n",
    score: 0,
  });

  await Progress.create({
    studentId: studentTwo._id,
    labId: labs["SWE 326#1"]._id,
    status: "in progress",
    code: "age = int(input())\nprint('invalid')\n",
    score: 0,
  });
};

const main = async () => {
  await connectDB();

  const users = await ensureKnownUsers();
  await seedDepartments(users);
  await clearDemoCourses();
  const courses = await createCourses(users);
  const labs = await createLabs(courses, users);
  await seedSubmissions(labs, users);

  const [userCount, courseCount, labCount, submissionCount, progressCount] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Lab.countDocuments(),
    Submission.countDocuments(),
    Progress.countDocuments(),
  ]);

  console.log("Demo data seeded.");
  console.table({
    users: userCount,
    courses: courseCount,
    labs: labCount,
    submissions: submissionCount,
    progress: progressCount,
  });
  console.log("Known password for seeded accounts:", PASSWORD);
};

main()
  .catch((error) => {
    console.error("Demo seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
