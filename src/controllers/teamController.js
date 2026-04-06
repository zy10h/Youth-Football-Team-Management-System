const Team = require('../models/Team');

async function getAllTeams(req, res, next) {
  try {
    const teams = await Team.find().populate('coach');
    res.status(200).json(teams);
  } catch (error) {
    next(error);
  }
}

async function getTeamById(req, res, next) {
  try {
    const team = await Team.findById(req.params.id).populate('coach');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.status(200).json(team);
  } catch (error) {
    next(error);
  }
}

async function createTeam(req, res, next) {
  try {
    const team = await Team.create(req.body);
    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
}

async function updateTeam(req, res, next) {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.status(200).json(team);
  } catch (error) {
    next(error);
  }
}

async function deleteTeam(req, res, next) {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam
};