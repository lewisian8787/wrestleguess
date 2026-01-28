import express from 'express';
import * as userRepository from '../repositories/userRepository.js';
import * as leagueRepository from '../repositories/leagueRepository.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/leaderboard
// @desc    Get global leaderboard (top 100 users across all leagues)
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await leagueRepository.getGlobalLeaderboard(100);

    res.json({
      leaderboard: leaderboard.map(entry => ({
        userId: entry.userId,
        displayName: entry.displayName,
        totalScore: parseFloat(entry.totalScore),
        leagues: parseInt(entry.leagues)
      }))
    });
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
    const user = await userRepository.getUserWithLeagues(req.user.id);

    res.json({ user: userRepository.toPublicJSON(user) });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

export default router;
