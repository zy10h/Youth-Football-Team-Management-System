const express = require('express');
const { body } = require('express-validator');

const {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam
} = require('../controllers/teamController');

const authMiddleware = require('../middleware/authMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');

const router = express.Router();

const validTrainingDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const teamValidation = [
  body('maxAge')
    .notEmpty()
    .withMessage('Maximum age is required')
    .isInt({ min: 1 })
    .withMessage('Maximum age must be a positive integer'),

  body('coach')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Coach must be a valid ID'),

  body('trainingDays')
    .optional()
    .isArray()
    .withMessage('Training days must be an array'),

  body('trainingDays.*')
    .optional()
    .isIn(validTrainingDays)
    .withMessage('Training day is invalid')
];

router.get('/', getAllTeams);
router.get('/:id', getTeamById);

router.post(
  '/',
  authMiddleware,
  teamValidation,
  validateMiddleware,
  createTeam
);

router.put(
  '/:id',
  authMiddleware,
  teamValidation,
  validateMiddleware,
  updateTeam
);

router.delete('/:id', authMiddleware, deleteTeam);

module.exports = router;