const Team = require('../models/Team');
const Player = require('../models/Player');

async function checkCoachScheduleConflict({ coachId, trainingDays, currentTeamId = null }) {
  if (!coachId || !trainingDays || trainingDays.length === 0) {
    return null;
  }

  const query = { coach: coachId };

  if (currentTeamId) {
    query._id = { $ne: currentTeamId };
  }

  const existingTeams = await Team.find(query);

  for (const team of existingTeams) {
    const overlappingDays = (team.trainingDays || []).filter((day) =>
      trainingDays.includes(day)
    );

    if (overlappingDays.length > 0) {
      return {
        teamName: team.name,
        overlappingDays
      };
    }
  }

  return null;
}

async function getAllTeams(req, res, next) {
  try {
    const teams = await Team.find().populate('coach').sort({ maxAge: 1 });

    const result = await Promise.all(
      teams.map(async (team) => {
        const players = await Player.find({ team: team._id })
          .select('firstName lastName jerseyNumber')
          .sort({ jerseyNumber: 1 });

        return {
          ...team.toObject(),
          players
        };
      })
    );

    res.status(200).json(result);
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

    const players = await Player.find({ team: team._id })
      .select('firstName lastName jerseyNumber age preferredPosition alternativePositions')
      .sort({ jerseyNumber: 1, lastName: 1 });

    res.status(200).json({
      ...team.toObject(),
      players
    });
  } catch (error) {
    next(error);
  }
}

async function createTeam(req, res, next) {
  try {
    const { maxAge } = req.body;

    if (!maxAge) {
      return res.status(400).json({ message: 'Maximum age is required' });
    }

    const numericMaxAge = Number(maxAge);

    const existingTeam = await Team.findOne({ maxAge: numericMaxAge });

    if (existingTeam) {
      return res.status(409).json({
        message: `A team with maximum age ${numericMaxAge} already exists`
      });
    }

    const conflict = await checkCoachScheduleConflict({
      coachId: req.body.coach,
      trainingDays: req.body.trainingDays
    });

    if (conflict) {
      return res.status(400).json({
        message: `Coach is already assigned to ${conflict.teamName} on ${conflict.overlappingDays.join(', ')}.`
      });
    }

    const teamData = {
      ...req.body,
      name: `U${numericMaxAge}`,
      maxAge: numericMaxAge
    };

    const team = await Team.create(teamData);
    const populatedTeam = await Team.findById(team._id).populate('coach');

    res.status(201).json(populatedTeam);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'A team with this maximum age already exists'
      });
    }
    next(error);
  }
}

async function updateTeam(req, res, next) {
  try {
    const { maxAge } = req.body;

    if (maxAge === undefined || maxAge === null || maxAge === '') {
      return res.status(400).json({ message: 'Maximum age is required' });
    }

    const numericMaxAge = Number(maxAge);

    const existingTeam = await Team.findOne({
      maxAge: numericMaxAge,
      _id: { $ne: req.params.id }
    });

    if (existingTeam) {
      return res.status(409).json({
        message: `A team with maximum age ${numericMaxAge} already exists`
      });
    }

    const conflict = await checkCoachScheduleConflict({
      coachId: req.body.coach,
      trainingDays: req.body.trainingDays,
      currentTeamId: req.params.id
    });

    if (conflict) {
      return res.status(400).json({
        message: `Coach is already assigned to ${conflict.teamName} on ${conflict.overlappingDays.join(', ')}.`
      });
    }

    const updatedData = {
      ...req.body,
      name: `U${numericMaxAge}`,
      maxAge: numericMaxAge
    };

    const team = await Team.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true
    }).populate('coach');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.status(200).json(team);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'A team with this maximum age already exists'
      });
    }
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

async function getTeamsByCoach(req, res, next) {
  try {
    const { coachId } = req.params;

    const teams = await Team.find({ coach: coachId })
      .select("name trainingDays")
      .sort({ maxAge: 1 });

    res.status(200).json(teams);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamsByCoach 
};