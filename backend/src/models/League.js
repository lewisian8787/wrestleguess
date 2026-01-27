import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  eventScores: {
    type: Map,
    of: {
      points: Number,
      correctPicks: Number,
      totalPicks: Number,
      scored: Boolean,
      scoredAt: Date
    },
    default: {}
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const leagueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'League name is required'],
    trim: true
  },
  joinCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [memberSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster lookups
leagueSchema.index({ joinCode: 1 });
leagueSchema.index({ 'members.user': 1 });

const League = mongoose.model('League', leagueSchema);

export default League;
