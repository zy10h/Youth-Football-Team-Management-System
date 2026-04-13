const express = require('express');
const { body } = require('express-validator');

const {
  getAllPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer
} = require('../controllers/playerController');

const authMiddleware = require('../middleware/authMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');

const router = express.Router();

const jerseyValidation = body('jerseyNumber')
  .optional()
  .isInt({ min: 1, max: 99 })
  .withMessage('Jersey number must be between 1 and 99');

router.get('/', getAllPlayers);
router.get('/:id', getPlayerById);

router.post(
  '/',
  authMiddleware,
  [jerseyValidation],
  validateMiddleware,
  createPlayer
);

router.put(
  '/:id',
  authMiddleware,
  [jerseyValidation],
  validateMiddleware,
  updatePlayer
);

router.delete('/:id', authMiddleware, deletePlayer);

module.exports = router;