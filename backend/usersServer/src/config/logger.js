const pino = require('pino');

const logger = pino(
  { level: 'info' },
  pino.destination('app.log')
);

module.exports = logger;
