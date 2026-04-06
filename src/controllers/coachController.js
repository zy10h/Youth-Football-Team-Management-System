const Coach = require('../models/Coach');

async function getAllCoaches(req, res, next) {
  try {
    const coaches = await Coach.find().populate('assignedTeams');
    res.status(200).json(coaches);
  } catch (error) {
    next(error);
  }
}

async function getCoachById(req, res, next) {
  try {
    const coach = await Coach.findById(req.params.id).populate('assignedTeams');

    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    res.status(200).json(coach);
  } catch (error) {
    next(error);
  }
}

async function createCoach(req, res, next) {
  try {
    const coach = await Coach.create(req.body);
    res.status(201).json(coach);
  } catch (error) {
    next(error);
  }
}

async function updateCoach(req, res, next) {
  try {
    const coach = await Coach.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    res.status(200).json(coach);
  } catch (error) {
    next(error);
  }
}

async function deleteCoach(req, res, next) {
  try {
    const coach = await Coach.findByIdAndDelete(req.params.id);

    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    res.status(200).json({ message: 'Coach deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllCoaches,
  getCoachById,
  createCoach,
  updateCoach,
  deleteCoach
};