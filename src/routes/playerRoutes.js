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

router.get('/', getAllPlayers);
router.get('/:id', getPlayerById);

router.post(
  '/',
  authMiddleware,
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('dateOfBirth').notEmpty().withMessage('Date of birth is required')
  ],
  validateMiddleware,
  createPlayer
);

router.put('/:id', authMiddleware, updatePlayer);
router.delete('/:id', authMiddleware, deletePlayer);

module.exports = router;