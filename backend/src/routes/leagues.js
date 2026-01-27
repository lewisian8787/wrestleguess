import express from 'express';
import { body, validationResult } from 'express-validator';
import League from '../models/League.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper function to generate join code
function generateJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// @route   POST /api/leagues
// @desc    Create a new league
// @access  Private
router.post('/', protect,
  [body('name').trim().notEmpty().withMessage('League name is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name } = req.body;

      // Generate unique join code
      let joinCode;
      let codeExists = true;
      while (codeExists) {
        joinCode = generateJoinCode();
        const existing = await League.findOne({ joinCode });
        if (!existing) codeExists = false;
      }

      // Create league with creator as first member
      const league = await League.create({
        name: name.trim(),
        joinCode,
        createdBy: req.user._id,
        members: [{
          user: req.user._id,
          displayName: req.user.displayName,
          totalPoints: 0,
          eventScores: {},
          joinedAt: new Date()
        }]
      });

      // Add league to user's leagues array
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { leagues: league._id }
      });

      res.status(201).json({
        message: 'League created successfully',
        league
      });
    } catch (error) {
      console.error('Create league error:', error);
      res.status(500).json({ message: 'Server error creating league' });
    }
  }
);

// @route   POST /api/leagues/join
// @desc    Join a league by join code
// @access  Private
router.post('/join',
  [body('joinCode').trim().notEmpty().withMessage('Join code is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { joinCode } = req.body;

      // Find league by join code
      const league = await League.findOne({ joinCode: joinCode.toUpperCase() });
      if (!league) {
        return res.status(404).json({ message: 'No league found with that code' });
      }

      // Check if user is already a member
      const isMember = league.members.some(m => m.user.toString() === req.user._id.toString());
      if (isMember) {
        return res.status(400).json({ message: 'You are already a member of this league' });
      }

      // Add user to league members
      league.members.push({
        user: req.user._id,
        displayName: req.user.displayName,
        totalPoints: 0,
        eventScores: {},
        joinedAt: new Date()
      });
      await league.save();

      // Add league to user's leagues array
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { leagues: league._id }
      });

      res.json({
        message: 'Successfully joined league',
        league
      });
    } catch (error) {
      console.error('Join league error:', error);
      res.status(500).json({ message: 'Server error joining league' });
    }
  }
);

// @route   GET /api/leagues
// @desc    Get all leagues for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const leagues = await League.find({ 'members.user': req.user._id })
      .populate('createdBy', 'displayName email')
      .sort({ createdAt: -1 });

    res.json({ leagues });
  } catch (error) {
    console.error('Get leagues error:', error);
    res.status(500).json({ message: 'Server error fetching leagues' });
  }
});

// @route   GET /api/leagues/:id
// @desc    Get league by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const league = await League.findById(req.params.id)
      .populate('createdBy', 'displayName email')
      .populate('members.user', 'displayName email');

    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    // Check if user is a member
    const isMember = league.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this league' });
    }

    res.json({ league });
  } catch (error) {
    console.error('Get league error:', error);
    res.status(500).json({ message: 'Server error fetching league' });
  }
});

// @route   GET /api/leagues/:id/standings
// @desc    Get league standings
// @access  Private
router.get('/:id/standings', protect, async (req, res) => {
  try {
    const league = await League.findById(req.params.id)
      .populate('members.user', 'displayName email');

    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    // Check if user is a member
    const isMember = league.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this league' });
    }

    // Sort members by totalPoints descending
    const standings = league.members
      .map(m => ({
        userId: m.user._id,
        displayName: m.displayName,
        totalPoints: m.totalPoints,
        eventScores: m.eventScores,
        joinedAt: m.joinedAt
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    res.json({
      league: {
        id: league._id,
        name: league.name,
        joinCode: league.joinCode
      },
      standings
    });
  } catch (error) {
    console.error('Get standings error:', error);
    res.status(500).json({ message: 'Server error fetching standings' });
  }
});

export default router;
