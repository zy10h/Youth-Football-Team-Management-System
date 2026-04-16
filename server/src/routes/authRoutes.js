const express = require('express');
const { body } = require('express-validator');

const { register, login } = require('../controllers/authController');
const validateMiddleware = require('../middleware/validateMiddleware');

const router = express.Router();

router.post(
  '/register',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  validateMiddleware,
  register
);

router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validateMiddleware,
  login
);

module.exports = router;