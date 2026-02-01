import express from 'express';
import { body, validationResult } from 'express-validator';
import * as eventRepository from '../repositories/eventRepository.js';
import * as pickRepository from '../repositories/pickRepository.js';
import * as leagueRepository from '../repositories/leagueRepository.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const events = await eventRepository.findAllEvents({ includeMatches: true });

    res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error fetching events' });
  }
});

// @route   GET /api/events/:id
// @desc    Get event by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const event = await eventRepository.findEventById(req.params.id, true);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error fetching event' });
  }
});

// @route   POST /api/events
// @desc    Create a new event (admin only)
// @access  Private/Admin
router.post('/', protect, admin,
  [
    body('name').trim().notEmpty().withMessage('Event name is required'),
    body('date').isISO8601().withMessage('Valid event date is required'),
    body('matches').isArray({ min: 1 }).withMessage('At least one match is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, brand, date, matches } = req.body;

      const event = await eventRepository.createEvent({
        name: name.trim(),
        brand: brand || 'Wrestling',
        date: new Date(date),
        matches: matches.map((m, idx) => ({ ...m, match_order: idx })),
        createdBy: req.user.id
      });

      res.status(201).json({
        message: 'Event created successfully',
        event
      });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ message: 'Server error creating event' });
    }
  }
);

// @route   PUT /api/events/:id
// @desc    Update event (admin only)
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, brand, date, matches, locked } = req.body;

    // Don't allow editing if event is scored
    if (await eventRepository.isEventScored(req.params.id)) {
      return res.status(400).json({ message: 'Cannot edit a scored event' });
    }

    const updates = {};
    if (name) updates.name = name.trim();
    if (brand) updates.brand = brand;
    if (date) updates.date = new Date(date);
    if (typeof locked === 'boolean') updates.locked = locked;

    await eventRepository.updateEvent(req.params.id, updates);

    if (matches) {
      const formattedMatches = matches.map((m, idx) => ({ ...m, match_order: idx }));
      await eventRepository.updateMatches(req.params.id, formattedMatches);
    }

    const updatedEvent = await eventRepository.findEventById(req.params.id, true);

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error updating event' });
  }
});

// @route   POST /api/events/:id/score
// @desc    Score an event and update league standings (admin only)
// @access  Private/Admin
router.post('/:id/score', protect, admin, async (req, res) => {
  try {
    const event = await eventRepository.findEventById(req.params.id, true);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.scored) {
      return res.status(400).json({ message: 'Event has already been scored' });
    }

    // Ensure all matches have winners
    const allMatchesHaveWinners = event.matches.every(m => m.winner);
    if (!allMatchesHaveWinners) {
      return res.status(400).json({ message: 'All matches must have winners before scoring' });
    }

    // Get all picks for this event
    const picks = await pickRepository.findPicksByEvent(event.id);

    // Calculate scores for each user
    const userScores = {};

    for (const pick of picks) {
      let totalPoints = 0;
      let correctPicks = 0;
      const totalPicks = event.matches.length;

      // Calculate points for each match
      for (const match of event.matches) {
        const userChoice = pick.choices.find(c => c.matchId === match.matchId);
        if (userChoice && userChoice.winner === match.winner) {
          const points = userChoice.confidence * match.multiplier;
          totalPoints += points;
          correctPicks++;
        }
      }

      userScores[pick.userId] = {
        points: totalPoints,
        correctPicks,
        totalPicks
      };
    }

    // Update all league standings
    for (const [userId, scoreData] of Object.entries(userScores)) {
      // Get all leagues for this user from PostgreSQL
      const userLeagues = await leagueRepository.getUserLeagues(userId);

      for (const league of userLeagues) {
        // Update event score in PostgreSQL
        const eventScoreData = {
          points: scoreData.points,
          correctPicks: scoreData.correctPicks,
          totalPicks: scoreData.totalPicks,
          scored: true,
          scoredAt: new Date().toISOString()
        };

        await leagueRepository.updateMemberEventScore({
          leagueId: league.id,
          userId: userId,
          eventId: event.id,
          scoreData: eventScoreData
        });
      }
    }

    // Mark event as scored
    await eventRepository.scoreEvent(event.id);

    const scoredEvent = await eventRepository.findEventById(event.id, true);

    res.json({
      message: 'Event scored successfully',
      usersScored: Object.keys(userScores).length,
      event: scoredEvent
    });
  } catch (error) {
    console.error('Score event error:', error);
    res.status(500).json({ message: 'Server error scoring event' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event (admin only)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const event = await eventRepository.findEventById(req.params.id, false);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Don't allow deleting if event is scored
    if (event.scored) {
      return res.status(400).json({ message: 'Cannot delete a scored event' });
    }

    // Delete event (CASCADE will delete matches, picks, and pick_choices)
    await eventRepository.deleteEvent(event.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error deleting event' });
  }
});

export default router;
