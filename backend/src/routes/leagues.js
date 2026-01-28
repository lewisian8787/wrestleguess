import express from 'express';
import { body, validationResult } from 'express-validator';
import * as leagueRepository from '../repositories/leagueRepository.js';
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
        const existing = await leagueRepository.findLeagueByJoinCode(joinCode);
        if (!existing) codeExists = false;
      }

      // Create league with creator as first member (transaction inside repository)
      const league = await leagueRepository.createLeague({
        name,
        joinCode,
        createdBy: req.user.id,
        creatorDisplayName: req.user.displayName
      });

      res.status(201).json({
        message: 'League created successfully',
        league: {
          id: league.id,
          name: league.name,
          joinCode: league.join_code,
          createdBy: league.created_by,
          createdAt: league.created_at
        }
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
      const league = await leagueRepository.findLeagueByJoinCode(joinCode);
      if (!league) {
        return res.status(404).json({ message: 'No league found with that code' });
      }

      // Add user to league (transaction inside repository, checks if already member)
      try {
        await leagueRepository.addUserToLeague({
          leagueId: league.id,
          userId: req.user.id,
          displayName: req.user.displayName
        });
      } catch (error) {
        if (error.message.includes('already a member')) {
          return res.status(400).json({ message: 'You are already a member of this league' });
        }
        throw error;
      }

      res.json({
        message: 'Successfully joined league',
        league: {
          id: league.id,
          name: league.name,
          joinCode: league.join_code,
          createdBy: league.created_by,
          createdAt: league.created_at
        }
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
    const leagues = await leagueRepository.getUserLeagues(req.user.id);

    // Transform to match expected API format
    const transformedLeagues = leagues.map(l => ({
      id: l.id,
      name: l.name,
      joinCode: l.join_code,
      createdBy: l.created_by_user,
      createdAt: l.created_at
    }));

    res.json({ leagues: transformedLeagues });
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
    const league = await leagueRepository.getLeagueWithMembers(req.params.id);

    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    // Check if user is a member
    const isMember = league.members.some(m => m.user_id === req.user.id);
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this league' });
    }

    // Transform to match expected API format
    const transformedLeague = {
      id: league.id,
      name: league.name,
      joinCode: league.join_code,
      createdBy: league.created_by_user,
      createdAt: league.created_at,
      members: league.members.map(m => ({
        user: m.user,
        displayName: m.display_name,
        totalPoints: parseFloat(m.total_points),
        eventScores: m.event_scores,
        joinedAt: m.joined_at
      }))
    };

    res.json({ league: transformedLeague });
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
    const league = await leagueRepository.findLeagueById(req.params.id);

    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    // Check if user is a member
    const isMember = await leagueRepository.isUserMemberOfLeague(req.user.id, league.id);
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this league' });
    }

    // Get standings
    const standings = await leagueRepository.getLeagueStandings(league.id);

    res.json({
      league: {
        id: league.id,
        name: league.name,
        joinCode: league.join_code
      },
      standings: standings.map(s => ({
        userId: s.userId,
        displayName: s.displayName,
        totalPoints: parseFloat(s.totalPoints),
        eventScores: s.eventScores,
        joinedAt: s.joinedAt
      }))
    });
  } catch (error) {
    console.error('Get standings error:', error);
    res.status(500).json({ message: 'Server error fetching standings' });
  }
});

export default router;
