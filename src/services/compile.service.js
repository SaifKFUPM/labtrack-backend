const axios = require('axios');

const languageMap = {
  'c++': 'cpp17',
  cpp17: 'cpp17',
  cpp: 'cpp17',
  c: 'c',
  java: 'java',
  python: 'python3',
  python3: 'python3',
  javascript: 'nodejs',
  js: 'nodejs',
  node: 'nodejs',
  nodejs: 'nodejs',
  go: 'go',
  golang: 'go',
  rust: 'rust',
};

const compileCode = async (code, language, input = '') => {
  const normalizedLanguage = String(language || '').trim().toLowerCase();
  const jdoodleLanguage = languageMap[normalizedLanguage];
  if (!jdoodleLanguage) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const response = await axios.post('https://api.jdoodle.com/v1/execute', {
    clientId: process.env.JDOODLE_CLIENT_ID,
    clientSecret: process.env.JDOODLE_CLIENT_SECRET,
    script: code,
    language: jdoodleLanguage,
    stdin: input,
    versionIndex: '0',
  });

  const { output, statusCode, memory, cpuTime } = response.data;

  return {
    output: output?.trim() || '',
    statusCode,
    memory,
    cpuTime,
    isError: statusCode !== '200' && statusCode !== 200,
  };
};

module.exports = { compileCode };
