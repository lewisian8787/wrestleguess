import mongoose from 'mongoose';

const choiceSchema = new mongoose.Schema({
  winner: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, { _id: false });

const pickSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  choices: {
    type: Map,
    of: choiceSchema,
    required: true
  },
  totalConfidence: {
    type: Number,
    required: true,
    validate: {
      validator: function(v) {
        return v === 100;
      },
      message: 'Total confidence must equal 100'
    }
  },
  version: {
    type: Number,
    default: 2
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for unique picks per user per event
pickSchema.index({ event: 1, user: 1 }, { unique: true });

const Pick = mongoose.model('Pick', pickSchema);

export default Pick;
