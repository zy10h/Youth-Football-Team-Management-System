const express = require('express');
const { body } = require('express-validator');

const {
  getAllCoaches,
  getCoachById,
  createCoach,
  updateCoach,
  deleteCoach
} = require('../controllers/coachController');

const authMiddleware = require('../middleware/authMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');

const router = express.Router();

const coachValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),

  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail()
    .withMessage('Email must be valid'),

  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('Phone must be a string')
];

router.get('/', getAllCoaches);
router.get('/:id', getCoachById);

router.post(
  '/',
  authMiddleware,
  coachValidation,
  validateMiddleware,
  createCoach
);

router.put(
  '/:id',
  authMiddleware,
  coachValidation,
  validateMiddleware,
  updateCoach
);

router.delete('/:id', authMiddleware, deleteCoach);

module.exports = router;