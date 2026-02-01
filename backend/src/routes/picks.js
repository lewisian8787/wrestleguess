import express from 'express';
import { body, validationResult } from 'express-validator';
import * as pickRepository from '../repositories/pickRepository.js';
import * as eventRepository from '../repositories/eventRepository.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/picks
// @desc    Create or update user's picks for an event
// @access  Private
router.post('/', protect,
  [
    body('eventId').notEmpty().withMessage('Event ID is required'),
    body('choices').isObject().withMessage('Choices must be an object'),
    body('totalConfidence').equals('100').withMessage('Total confidence must equal 100')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { eventId, choices, totalConfidence } = req.body;

      // Check if event exists
      const event = await eventRepository.findEventById(eventId, true);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if event is locked
      if (event.locked) {
        return res.status(400).json({ message: 'Event is locked. Cannot submit or update picks.' });
      }

      // Validate choices format and total confidence
      let calculatedTotal = 0;

      for (const [matchId, choice] of Object.entries(choices)) {
        if (!choice.winner || typeof choice.confidence !== 'number') {
          return res.status(400).json({ message: 'Invalid choice format' });
        }
        calculatedTotal += choice.confidence;
      }

      if (calculatedTotal !== 100) {
        return res.status(400).json({
          message: `Total confidence must equal 100. Current total: ${calculatedTotal}`
        });
      }

      // Check if all matches have picks
      if (Object.keys(choices).length !== event.matches.length) {
        return res.status(400).json({
          message: 'You must make a pick for every match'
        });
      }

      // Create or update pick
      const pickId = await pickRepository.createOrUpdatePick({
        eventId,
        userId: req.user.id,
        choices,
        totalConfidence
      });

      const pick = await pickRepository.findPickById(pickId, true);

      res.json({
        message: 'Picks saved successfully',
        pick
      });
    } catch (error) {
      console.error('Save picks error:', error);
      res.status(500).json({ message: 'Server error saving picks' });
    }
  }
);

// @route   GET /api/picks/event/:eventId
// @desc    Get user's picks for an event
// @access  Private
router.get('/event/:eventId', protect, async (req, res) => {
  try {
    const pick = await pickRepository.findPickByEventAndUser(
      req.params.eventId,
      req.user.id
    );

    if (!pick) {
      return res.status(404).json({ message: 'No picks found for this event' });
    }

    res.json({ pick });
  } catch (error) {
    console.error('Get picks error:', error);
    res.status(500).json({ message: 'Server error fetching picks' });
  }
});

// @route   GET /api/picks/user
// @desc    Get all picks for current user
// @access  Private
router.get('/user', protect, async (req, res) => {
  try {
    const picks = await pickRepository.findPicksByUser(req.user.id);

    res.json({ picks });
  } catch (error) {
    console.error('Get user picks error:', error);
    res.status(500).json({ message: 'Server error fetching picks' });
  }
});

// @route   DELETE /api/picks/event/:eventId
// @desc    Delete user's picks for an event
// @access  Private
router.delete('/event/:eventId', protect, async (req, res) => {
  try {
    // Check if event is locked
    const event = await eventRepository.findEventById(req.params.eventId, false);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.locked) {
      return res.status(400).json({ message: 'Event is locked. Cannot delete picks.' });
    }

    await pickRepository.deletePickByEventAndUser(req.params.eventId, req.user.id);

    res.json({ message: 'Picks deleted successfully' });
  } catch (error) {
    console.error('Delete picks error:', error);
    res.status(500).json({ message: 'Server error deleting picks' });
  }
});

export default router;
