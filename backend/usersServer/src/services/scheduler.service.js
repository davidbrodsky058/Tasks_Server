const cron = require('node-cron');
const CurrentTask = require('../models/Task.model');
const logger = require('../config/logger');

function startScheduler() {
  cron.schedule('0 3 * * *', async () => {
    logger.info('Running daily recurring task job');
    // … הקוד שלך ליצירת מופעים ועדכון parent.recurrence.nextRun
  });
}

module.exports = startScheduler;
