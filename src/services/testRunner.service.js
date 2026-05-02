const { compileCode } = require("./compile.service");
const Submission = require("../models/Submission");
const Lab = require("../models/Lab");

const normalizeOutput = (value) => String(value ?? "").trim().replace(/\r\n/g, "\n");

const buildResult = (testCase, index, result, error) => {
  const expectedOutput = normalizeOutput(testCase.expectedOutput);
  const actualOutput = error
    ? `Compilation error: ${error.message}`
    : normalizeOutput(result?.output);
  const isExecutionError = Boolean(error || result?.isError);
  const isPassed = !isExecutionError && actualOutput === expectedOutput;
  const isVisible = testCase.visible !== false;

  return {
    testCaseId: testCase._id,
    name: testCase.name || testCase.description || `Test ${index + 1}`,
    description: testCase.description || testCase.name || `Test ${index + 1}`,
    passed: isPassed,
    status: isPassed ? "pass" : isExecutionError ? "error" : "fail",
    points: testCase.points,
    earned: isPassed ? testCase.points : 0,
    visible: isVisible,
    ...(isVisible && {
      input: testCase.input,
      expectedOutput,
      actualOutput,
    }),
  };
};

const runLabTestCases = async ({ lab, code, language }) => {
  const testCases = lab.testCases || [];
  if (testCases.length === 0) {
    return { passed: 0, total: 0, score: 0, maxScore: lab.points, results: [] };
  }

  let passed = 0;
  let totalPoints = 0;
  let earnedPoints = 0;
  const results = [];

  for (const [index, testCase] of testCases.entries()) {
    totalPoints += testCase.points;

    try {
      const result = await compileCode(code, language, testCase.input);
      const testResult = buildResult(testCase, index, result);
      if (testResult.passed) {
        passed += 1;
        earnedPoints += testCase.points;
      }
      results.push(testResult);
    } catch (err) {
      results.push(buildResult(testCase, index, null, err));
    }
  }

  const score =
    totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * lab.points) : 0;

  return {
    passed,
    total: testCases.length,
    score,
    maxScore: lab.points,
    results,
  };
};

const runTests = async (submissionId) => {
  const submission = await Submission.findById(submissionId);
  if (!submission) throw new Error("Submission not found");

  const lab = await Lab.findById(submission.labId);
  if (!lab) throw new Error("Lab not found");

  const summary = await runLabTestCases({
    lab,
    code: submission.code,
    language: submission.language,
  });

  await Submission.findByIdAndUpdate(submissionId, {
    testResults: summary.results,
    score: summary.score,
    maxScore: summary.maxScore,
  });

  return summary;
};

module.exports = { runLabTestCases, runTests };
