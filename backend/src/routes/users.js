import express from 'express';
import User from '../models/User.js';
import League from '../models/League.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/leaderboard
// @desc    Get global leaderboard (top 100 users across all leagues)
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    // Get all leagues and aggregate user scores
    const leagues = await League.find();

    const userScores = {};

    for (const league of leagues) {
      for (const member of league.members) {
        const userId = member.user.toString();

        if (!userScores[userId]) {
          userScores[userId] = {
            userId,
            displayName: member.displayName,
            totalScore: 0,
            leagues: 0
          };
        }

        userScores[userId].totalScore += member.totalPoints;
        userScores[userId].leagues += 1;
      }
    }

    // Convert to array and sort by total score
    const leaderboard = Object.values(userScores)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 100); // Top 100

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
});

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('leagues', 'name joinCode');

    res.json({ user: user.toPublicJSON() });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

export default router;
