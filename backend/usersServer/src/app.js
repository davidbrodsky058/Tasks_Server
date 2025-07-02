const express = require('express');
const limiter = require('./middlewares/rateLimiter.middleware');
const requestLogger = require('./middlewares/requestLogger.middleware');
const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const startScheduler = require('./services/scheduler.service');

const app = express();
app.use(limiter);
app.use(express.json());
app.use(requestLogger);

app.use('/', authRoutes);
app.use('/', taskRoutes);

startScheduler();

module.exports = app;
