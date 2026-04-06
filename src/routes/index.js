const express = require('express');

const authRoutes = require('./authRoutes');
const playerRoutes = require('./playerRoutes');
const teamRoutes = require('./teamRoutes');
const coachRoutes = require('./coachRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/players', playerRoutes);
router.use('/teams', teamRoutes);
router.use('/coaches', coachRoutes);

module.exports = router;