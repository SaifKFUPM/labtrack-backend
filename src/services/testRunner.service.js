const { compileCode } = require('./compile.service');
const Submission = require('../models/Submission');
const Lab = require('../models/Lab');

const runTests = async (submissionId) => {
  const submission = await Submission.findById(submissionId);
  if (!submission) throw new Error('Submission not found');

  const lab = await Lab.findById(submission.labId);
  if (!lab) throw new Error('Lab not found');

  const testCases = lab.testCases || [];
  if (testCases.length === 0) {
    return { passed: 0, total: 0, score: 0, maxScore: lab.points, results: [] };
  }

  let passed = 0;
  let totalPoints = 0;
  let earnedPoints = 0;
  const results = [];

  for (const tc of testCases) {
    totalPoints += tc.points;

    let result;
    try {
      result = await compileCode(submission.code, submission.language, tc.input);
    } catch (err) {
      results.push({
        testCaseId: tc._id,
        description: tc.description,
        passed: false,
        points: 0,
        visible: tc.visible,
        ...(tc.visible && {
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: 'Compilation error: ' + err.message,
        }),
      });
      continue;
    }

    const actualOutput = result.output.trim();
    const expectedOutput = tc.expectedOutput.trim();
    const isPassed = actualOutput === expectedOutput && !result.isError;

    if (isPassed) {
      passed++;
      earnedPoints += tc.points;
    }

    results.push({
      testCaseId: tc._id,
      description: tc.description,
      passed: isPassed,
      points: isPassed ? tc.points : 0,
      visible: tc.visible,
      ...(tc.visible && {
        input: tc.input,
        expectedOutput,
        actualOutput,
      }),
    });
  }

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * lab.points) : 0;

  await Submission.findByIdAndUpdate(submissionId, {
    testResults: results,
    score,
    maxScore: lab.points,
  });

  return { passed, total: testCases.length, score, maxScore: lab.points, results };
};

module.exports = { runTests };
