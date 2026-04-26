const compileRoutes = require('./src/routes/compile.routes');
const authRoutes = require('./src/routes/auth.routes');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorMiddleware = require('./src/middleware/errorMiddleware');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'LabTrack API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/compile', compileRoutes);
// app.use('/api/labs', labRoutes);
// app.use('/api/submissions', submissionRoutes);
// app.use('/api/courses', courseRoutes);
app.use(errorMiddleware);

module.exports = app;
