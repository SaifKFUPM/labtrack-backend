const axios = require('axios');

const languageMap = {
  cpp: 'cpp17',
  c: 'c',
  java: 'java',
  python: 'python3',
};

const compileCode = async (code, language, input = '') => {
  const jdoodleLanguage = languageMap[language];
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
