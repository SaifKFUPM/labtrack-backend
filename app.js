const compileRoutes = require("./src/routes/compile.routes");
const authRoutes = require("./src/routes/auth.routes");
const studentRoutes = require("./src/routes/student.routes");
const progressRoutes = require("./src/routes/progress.routes");
const adminRoutes = require("./src/routes/admin.routes");
const instructorRoutes = require("./src/routes/instructor.routes");
const peerRoutes = require("./src/routes/peer.routes");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const errorMiddleware = require("./src/middleware/errorMiddleware");
const requestMetrics = require("./src/utils/requestMetrics");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(requestMetrics);

// health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "LabTrack API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/compile", compileRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/peer-reviews", peerRoutes);
app.use("/api/admin", adminRoutes);
app.use(errorMiddleware);

module.exports = app;
