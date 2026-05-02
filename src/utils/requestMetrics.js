const WINDOW_MS = 5 * 60 * 1000;
const samples = [];

function trimSamples(now = Date.now()) {
  while (samples.length && now - samples[0].ts > WINDOW_MS) {
    samples.shift();
  }
}

function requestMetrics(req, res, next) {
  const startedAt = Date.now();

  res.on('finish', () => {
    const now = Date.now();
    samples.push({
      ts: now,
      statusCode: res.statusCode,
      durationMs: now - startedAt,
    });
    trimSamples(now);
  });

  next();
}

requestMetrics.snapshot = () => {
  trimSamples();
  const count = samples.length;
  const errors = samples.filter((sample) => sample.statusCode >= 500).length;
  const totalDuration = samples.reduce((sum, sample) => sum + sample.durationMs, 0);

  return {
    requestsMin: Math.round(count / (WINDOW_MS / 60000)),
    avgLatencyMs: count ? Math.round(totalDuration / count) : 0,
    errorRate: count ? Number(((errors / count) * 100).toFixed(2)) : 0,
  };
};

module.exports = requestMetrics;
