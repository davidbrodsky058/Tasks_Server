const jwt = require('jsonwebtoken');
const Users = require('../data/users'); // או מיקום אחר של רשימת המשתמשים
const logger = require('../config/logger');

exports.login = (req, res) => {
  const { username, password } = req.body;
  const user = Users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  logger.info(`User logged in: ${username}`);
  res.json({ success: true, token });
};
