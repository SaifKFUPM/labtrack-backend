const WINDOW_MS = 5 * 60 * 1000;
const measurements = [];

function trimSamples(now = Date.now()) {
  while (measurements.length && now - measurements[0].ts > WINDOW_MS) {
    measurements.shift();
  }
}

function requestMetrics(req, res, next) {
  const startedAt = Date.now();

  res.on('finish', () => {
    const now = Date.now();
    measurements.push({
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
  const count = measurements.length;
  const errors = measurements.filter((measurement) => measurement.statusCode >= 500).length;
  const totalDuration = measurements.reduce((sum, measurement) => sum + measurement.durationMs, 0);

  return {
    requestsMin: Math.round(count / (WINDOW_MS / 60000)),
    avgLatencyMs: count ? Math.round(totalDuration / count) : 0,
    errorRate: count ? Number(((errors / count) * 100).toFixed(2)) : 0,
  };
};

module.exports = requestMetrics;
