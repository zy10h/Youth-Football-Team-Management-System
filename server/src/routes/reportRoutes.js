const express = require('express');

const {
  createReport,
  getReport
} = require('../controllers/reportController');

const authMiddleware =
  require('../middleware/authMiddleware');

const router = express.Router();

// Both endpoints require a valid JWT.
router.use(authMiddleware);

router.post('/', createReport);

router.get('/:jobId', getReport);

module.exports = router;