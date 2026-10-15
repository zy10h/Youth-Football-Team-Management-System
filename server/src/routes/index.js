const express = require('express');

const authRoutes = require('./authRoutes');
const playerRoutes = require('./playerRoutes');
const teamRoutes = require('./teamRoutes');
const coachRoutes = require('./coachRoutes');
const reportRoutes = require('./reportRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/players', playerRoutes);
router.use('/teams', teamRoutes);
router.use('/coaches', coachRoutes);

// Asynchronous academy reports.
router.use('/reports', reportRoutes);

module.exports = router;