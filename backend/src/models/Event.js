import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  matchId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'Singles'
  },
  titleMatch: {
    type: Boolean,
    default: false
  },
  competitors: [{
    type: String,
    required: true
  }],
  winner: {
    type: String,
    default: null
  },
  multiplier: {
    type: Number,
    default: 1.0
  }
}, { _id: false });

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true
  },
  brand: {
    type: String,
    default: 'Wrestling'
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  matches: [matchSchema],
  locked: {
    type: Boolean,
    default: false
  },
  scored: {
    type: Boolean,
    default: false
  },
  scoredAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
eventSchema.index({ date: -1 });
eventSchema.index({ locked: 1 });
eventSchema.index({ scored: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
