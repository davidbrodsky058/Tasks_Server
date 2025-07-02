const mongoose = require('mongoose');

function connectDB(uri) {
  return mongoose.connect(uri, {
    serverApi: { version: '1', strict: true, deprecationErrors: true }
  });
}

module.exports = connectDB;
