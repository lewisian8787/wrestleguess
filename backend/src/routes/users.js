import express from 'express';
import { body, validationResult } from 'express-validator';
import * as userRepository from '../repositories/userRepository.js';
import * as leagueRepository from '../repositories/leagueRepository.js';
import * as followRepository from '../repositories/followRepository.js';
import { protect } from '../middleware/auth.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { query } from '../config/postgres.js';

const router = express.Router();

// @route   GET /api/users/leaderboard
// @desc    Get global leaderboard (top 100 users across all leagues)
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const [leaderboard, seasonResult, upcomingResult] = await Promise.all([
      leagueRepository.getGlobalLeaderboard(500),
      query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE scored = true) as scored FROM events`),
      query(`SELECT id, name, brand, date FROM events WHERE scored = false ORDER BY date ASC LIMIT 2`),
    ]);

    const totalEvents  = parseInt(seasonResult.rows[0].total);
    const scoredEvents = parseInt(seasonResult.rows[0].scored);

    res.json({
      leaderboard: leaderboard.map(entry => ({
        userId: entry.userId,
        displayName: entry.displayName,
        totalScore: parseFloat(entry.totalScore),
        eventsPlayed: parseInt(entry.eventsPlayed)
      })),
      season: {
        totalEvents,
        scoredEvents,
        remainingEvents: totalEvents - scoredEvents,
        finalEvent: 'WrestleMania 42',
        upcoming: upcomingResult.rows.map(e => ({
          id: e.id,
          name: e.name,
          brand: e.brand,
          date: e.date,
        })),
      },
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update current user's display name
// @access  Private
router.put('/profile', protect,
  [body('displayName').trim().isLength({ min: 2, max: 50 }).withMessage('Display name must be 2–50 characters')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const updated = await userRepository.updateDisplayName(req.user.id, req.body.displayName);
      res.json({ message: 'Profile updated', user: userRepository.toPublicJSON(updated) });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error updating profile' });
    }
  }
);

// @route   PUT /api/users/password
// @desc    Change current user's password
// @access  Private
router.put('/password', protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;
      const user = await userRepository.findUserById(req.user.id, true);
      const isMatch = await comparePassword(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      const hashed = await hashPassword(newPassword);
      await userRepository.updatePassword(req.user.id, hashed);
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Server error changing password' });
    }
  }
);

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

// @route   GET /api/users/stats
// @desc    Get current user's career stats with global rank
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await userRepository.getUserStats(req.user.id);
    if (!stats) return res.status(404).json({ message: 'User not found' });

    res.json({
      stats: {
        userId: stats.id,
        displayName: stats.display_name,
        totalScore: parseFloat(stats.total_score),
        eventsPlayed: parseInt(stats.events_played),
        avgPerEvent: parseFloat(stats.avg_per_event),
        globalRank: parseInt(stats.global_rank)
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// @route   GET /api/users/following
// @desc    Get all users the current user follows, with their career stats
// @access  Private
router.get('/following', protect, async (req, res) => {
  try {
    const following = await followRepository.getFollowing(req.user.id);

    res.json({
      following: following.map(row => ({
        userId: row.user_id,
        displayName: row.display_name,
        totalScore: parseFloat(row.total_score),
        eventsPlayed: parseInt(row.events_played),
        avgPerEvent: parseFloat(row.avg_per_event),
        globalRank: parseInt(row.global_rank)
      }))
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error fetching following' });
  }
});

// @route   POST /api/users/follow/:userId
// @desc    Follow a user
// @access  Private
router.post('/follow/:userId', protect, async (req, res) => {
  try {
    if (req.params.userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const target = await userRepository.findUserById(req.params.userId);
    if (!target) return res.status(404).json({ message: 'Player not found' });

    await followRepository.followUser(req.user.id, req.params.userId);
    res.json({ message: 'Followed' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error following user' });
  }
});

// @route   DELETE /api/users/follow/:userId
// @desc    Unfollow a user
// @access  Private
router.delete('/follow/:userId', protect, async (req, res) => {
  try {
    await followRepository.unfollowUser(req.user.id, req.params.userId);
    res.json({ message: 'Unfollowed' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Server error unfollowing user' });
  }
});

// @route   GET /api/users/leaderboard/monthly
// @desc    Get monthly leaderboard for a given year and month
// @access  Public
router.get('/leaderboard/monthly', async (req, res) => {
  try {
    const now = new Date();
    const year  = parseInt(req.query.year)  || now.getFullYear();
    const month = parseInt(req.query.month) || (now.getMonth() + 1);

    if (month < 1 || month > 12 || year < 2020 || year > 2100) {
      return res.status(400).json({ message: 'Invalid year or month' });
    }

    const result = await query(`
      SELECT
        u.id as "userId",
        u.display_name as "displayName",
        SUM(p.points_earned) as "totalScore",
        COUNT(p.id) as "eventsPlayed"
      FROM users u
      JOIN picks p ON p.user_id = u.id
      JOIN events e ON e.id = p.event_id
      WHERE e.scored = true
        AND EXTRACT(YEAR FROM e.date) = $1
        AND EXTRACT(MONTH FROM e.date) = $2
        AND p.points_earned IS NOT NULL
      GROUP BY u.id, u.display_name
      ORDER BY SUM(p.points_earned) DESC
    `, [year, month]);

    res.json({
      leaderboard: result.rows.map(row => ({
        userId: row.userId,
        displayName: row.displayName,
        totalScore: parseFloat(row.totalScore),
        eventsPlayed: parseInt(row.eventsPlayed),
      })),
      month: { year, month },
    });
  } catch (error) {
    console.error('Get monthly leaderboard error:', error);
    res.status(500).json({ message: 'Server error fetching monthly leaderboard' });
  }
});

// @route   GET /api/users/:userId
// @desc    Get any user's public profile with career stats
// @access  Public
router.get('/:userId', async (req, res) => {
  try {
    const stats = await userRepository.getUserStats(req.params.userId);
    if (!stats) return res.status(404).json({ message: 'Player not found' });

    res.json({
      user: {
        userId: stats.id,
        displayName: stats.display_name,
        totalScore: parseFloat(stats.total_score),
        eventsPlayed: parseInt(stats.events_played),
        avgPerEvent: parseFloat(stats.avg_per_event),
        globalRank: parseInt(stats.global_rank)
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// @route   GET /api/users/:userId/history
// @desc    Get any user's scored event history
// @access  Public
router.get('/:userId/history', async (req, res) => {
  try {
    const history = await userRepository.getUserHistory(req.params.userId);

    res.json({
      history: history.map(row => ({
        eventId: row.event_id,
        eventName: row.event_name,
        brand: row.brand,
        date: row.date,
        pointsEarned: parseFloat(row.points_earned),
        correctPicks: parseInt(row.correct_picks),
        totalMatches: parseInt(row.total_matches)
      }))
    });
  } catch (error) {
    console.error('Get user history error:', error);
    res.status(500).json({ message: 'Server error fetching history' });
  }
});

export default router;
