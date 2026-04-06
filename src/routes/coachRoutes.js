const express = require('express');

const {
  getAllCoaches,
  getCoachById,
  createCoach,
  updateCoach,
  deleteCoach
} = require('../controllers/coachController');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllCoaches);
router.get('/:id', getCoachById);
router.post('/', authMiddleware, createCoach);
router.put('/:id', authMiddleware, updateCoach);
router.delete('/:id', authMiddleware, deleteCoach);

module.exports = router;