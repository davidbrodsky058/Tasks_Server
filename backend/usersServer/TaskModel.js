const mongoose = require('mongoose');
const { Schema } = mongoose;

const RecurrenceSchema = new Schema({
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  interval: {
    type: Number,
    default: 1
  },
  nextRun: {
    type: Date,
    required: true
  }
});

const TaskSchema = new Schema({
  title:       { type: String, required: true },
  description: String,
  due:         Date,
  completed:   { type: Boolean, default: false },
  ownerId:     {
    type: String,
    required: true
  },
  sharedWith:  {
    type: [ String ],
    default: []
  },
  isRecurring: { type: Boolean, default: false },
  recurrence:  RecurrenceSchema,
  parentTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CurrentTask',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('CurrentTask', TaskSchema);
