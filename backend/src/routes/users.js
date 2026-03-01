import express from 'express';
import * as userRepository from '../repositories/userRepository.js';
import * as leagueRepository from '../repositories/leagueRepository.js';
import * as followRepository from '../repositories/followRepository.js';
import { protect } from '../middleware/auth.js';
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
