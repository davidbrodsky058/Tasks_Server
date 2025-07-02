const CurrentTask = require('../models/Task.model');

async function authorizeTask(req, res, next) {
  const task = await CurrentTask.findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const me = req.userId;
  if (task.ownerId !== me && !task.sharedWith.includes(me)) {
    return res.status(403).json({ error: 'אין לך גישה' });
  }

  req.task = task;
  next();
}

module.exports = authorizeTask;
