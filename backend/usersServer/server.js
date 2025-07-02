const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CurrentTask = require('./TaskModel');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
const cron = require('node-cron');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

const Users = [
    { username: "David", id: "1", password: "Aa123456" },
    { username: "Shani", id: "2", password: "q1w2e3r4t5" },
    { username: "Shlomi", id: "3", password: "12345678" }
];
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.'
});
const logger = pino(
    { level: 'info' },
    pino.destination('app.log')
)

cron.schedule('0 3 * * *', async () => {// This cron job runs every day at 3 AM
    logger.info('Running daily task to create recurring task instances');
    const now = new Date();

    const parents = await CurrentTask.find({// Find tasks that are recurring and due for the next run
        isRecurring: true,
        'recurrence.nextRun': { $lte: now }
    });

    for (const parent of parents) {// For each parent task, create a new instance
        logger.info(`Creating instance for task: ${parent.title}`);
        // Create a new instance of CurrentTask with the parent's details
        // and set the due date to the next run time
        // Also, set the parentTaskId to link it to the parent task
        // This will allow us to track the relationship between the parent and child tasks
        // The new instance will have the same title, description, userId, and completed status
        // The due date will be set to the next run time specified in the parent's recurrence
        // The parentTaskId will be set to the parent's _id to maintain the relationship
        // The new instance will be saved to the database
        const instance = new CurrentTask({
            title: parent.title,
            description: parent.description,
            due: parent.recurrence.nextRun,
            userId: parent.userId,
            completed: false,
            parentTaskId: parent._id
        });
        await instance.save();

        let next = new Date(parent.recurrence.nextRun);// Set the next run time for the parent task
        const { frequency, interval } = parent.recurrence;

        if (frequency === 'daily') {// If the frequency is daily, add the interval in days
            next.setDate(next.getDate() + interval);
        } else if (frequency === 'weekly') {// If the frequency is weekly, add the interval in weeks
            next.setDate(next.getDate() + 7 * interval);
        } else if (frequency === 'monthly') {// If the frequency is monthly, add the interval in months
            next.setMonth(next.getMonth() + interval);
        }

        parent.recurrence.nextRun = next;// Update the parent's next run time
        await parent.save();
    }
});


app.use(limiter);
app.use(express.json());

app.use((req, res, next) => {// Middleware to log requests
    req.log = logger;
    logger.info(`Received request: ${req.method} ${req.url}`);
    next();
});

const verifyUser = (req, res, next) => {
    try {
        const auth = req.headers.authorization;
        const [type, token] = auth ? auth.split(' ') : [];
        if (type !== 'Bearer' || !token) {
            throw new Error('Unauthorized');
        }
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = data.userId;
    } catch (error) {
        console.error('Error in verifyUser middleware:', error);
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

async function authorizeTask(req, res, next) {
  const task = await CurrentTask.findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const me = req.userId;
  if (task.ownerId !== me && !task.sharedWith.includes(me)) {
    return res.status(403).json({ error: 'You do not have access to this task' });
  }
  req.task = task;
  next();
}

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!Users.find(user => user.username === username && user.password === password)) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
    const token = jwt.sign({ userId: username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ success: true, token: token });
    logger.info(`User logged in: ${username}`);
})

app.get('/tasks', verifyUser, async (req, res) => {
    try {
        const tasks = await CurrentTask.find({
            $or: [
                { ownerId: req.userId },
                { sharedWith: req.userId }
            ]
        });
        res.json({ tasks: tasks });
        logger.info(`Fetched ${tasks.length} tasks`);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
})
app.post('/tasks', verifyUser, async (req, res) => {
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

            const newTask = new CurrentTask(taskData);
            const saved = await newTask.save();
            res.status(201).json({ task: saved });
        }
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(400).json({ error: err.message });
    }
});

app.put('/tasks/:id', verifyUser, authorizeTask, async (req, res) => {
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
});

app.delete('/tasks/:id', verifyUser, authorizeTask, async (req, res) => {
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
});

app.post('/tasks/:id/share', verifyUser, async (req, res) => {
  const { userIdToShare } = req.body;
  const task = await CurrentTask.findById(req.params.id);
  if (task.ownerId !== req.userId) return res.status(403).end();

  if (!task.sharedWith.includes(userIdToShare)) {
    task.sharedWith.push(userIdToShare);
    await task.save();
  }
  res.json(task);
});

app.post('/tasks/:id/unshare', verifyUser, async (req, res) => {
  const { userIdToUnshare } = req.body;
  const task = await CurrentTask.findById(req.params.id);
  if (task.ownerId !== req.userId) return res.status(403).end();

  task.sharedWith = task.sharedWith.filter(id => id !== userIdToUnshare);
  await task.save();
  res.json(task);
});

function run() {
    mongoose.connect(MONGO_URI, clientOptions)
        .then(() => {
            console.log('Connected to MongoDB');
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        })
        .catch(err => {
            console.error('Error connecting to MongoDB:', err);
            process.exit(1);
        });
}
run();