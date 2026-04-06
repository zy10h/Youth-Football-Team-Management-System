const express = require('express');

const {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam
} = require('../controllers/teamController');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllTeams);
router.get('/:id', getTeamById);
router.post('/', authMiddleware, createTeam);
router.put('/:id', authMiddleware, updateTeam);
router.delete('/:id', authMiddleware, deleteTeam);

module.exports = router;