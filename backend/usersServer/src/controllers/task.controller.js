const CurrentTask = require('../models/Task.model');
const logger = require('../config/logger');

// GET /tasks
exports.getAll = async (req, res) => {
  const tasks = await CurrentTask.find({
    $or: [{ ownerId: req.userId }, { sharedWith: req.userId }]
  });
  logger.info(`Fetched ${tasks.length} tasks for user ${req.userId}`);
  res.json({ tasks });
};

// POST /tasks
exports.create = async (req, res) => {
  try {
    const {
      title,
      description = '',
      due,
      isRecurring = false,
      recurrence = {}
    } = req.body;

    if (!title || !due) {
      return res.status(400).json({ error: 'Missing required fields: title and due.' });
    }

    const taskData = {
      title, description, due,
      ownerId: req.userId,
      sharedWith: [],
      isRecurring
    };
    if (isRecurring) {
      const { frequency, interval = 1, nextRun } = recurrence;
      if (!frequency) {
        return res.status(400)
          .json({ error: 'When isRecurring is true, recurrence.frequency is required.' });
      }
      taskData.recurrence = {
        frequency,
        interval,
        nextRun: nextRun || due
      };
    }
    const newTask = new CurrentTask(taskData);
    const saved = await newTask.save();
    res.status(201).json({ task: saved });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(400).json({ error: err.message });
  }
};

// PUT /tasks/:id
exports.update = async (req, res) => {
  try {
    const taskId = req.params.id;
    const updatedData = req.body;
    const task = await CurrentTask.findByIdAndUpdate(taskId, updatedData, { new: true });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ task: task });
    logger.info(`Task updated: ${task._id}`);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// DELETE /tasks/:id
exports.remove = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await CurrentTask.findByIdAndDelete(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
    logger.info(`Task deleted: ${task._id}`);
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

// POST /tasks/:id/share
exports.share = async (req, res) => {
  const { userIdToShare } = req.body;
  const task = await CurrentTask.findById(req.params.id);
  if (task.ownerId !== req.userId) return res.status(403).end();

  if (!task.sharedWith.includes(userIdToShare)) {
    task.sharedWith.push(userIdToShare);
    await task.save();
  }
  res.json(task);
}

// POST /tasks/:id/unshare
exports.unshare = async (req, res) => {
  const { userIdToUnshare } = req.body;
  const task = await CurrentTask.findById(req.params.id);
  if (task.ownerId !== req.userId) return res.status(403).end();

  task.sharedWith = task.sharedWith.filter(id => id !== userIdToUnshare);
  await task.save();
  res.json(task);
};
