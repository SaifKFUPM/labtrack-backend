const { compileCode } = require('../services/compile.service');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/compile
const runCode = asyncHandler(async (req, res) => {
  const { code, language, input } = req.body;

  if (!code || !language) {
    res.status(400);
    throw new Error('Code and language are required');
  }

  const result = await compileCode(code, language, input);

  res.json({ success: true, data: result });
});

module.exports = { runCode };
