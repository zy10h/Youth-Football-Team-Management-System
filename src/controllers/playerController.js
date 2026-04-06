const Player = require('../models/Player');
const Team = require('../models/Team');

function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

async function getAllPlayers(req, res, next) {
  try {
    const { search, position, sort = 'lastName', page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    if (position) {
      query.preferredPositions = position;
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Player.countDocuments(query);

    const players = await Player.find(query)
      .populate('team')
      .populate('createdBy', 'username role')
      .sort(sort)
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      total,
      page: pageNumber,
      limit: limitNumber,
      players
    });
  } catch (error) {
    next(error);
  }
}

async function getPlayerById(req, res, next) {
  try {
    const player = await Player.findById(req.params.id)
      .populate('team')
      .populate('createdBy', 'username role');

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    res.status(200).json(player);
  } catch (error) {
    next(error);
  }
}

async function createPlayer(req, res, next) {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      preferredPositions,
      jerseyNumber,
      guardianName,
      guardianPhone,
      email
    } = req.body;

    const age = calculateAge(dateOfBirth);

    const matchedTeam = await Team.findOne({
      minAge: { $lte: age },
      maxAge: { $gte: age }
    });

    const player = await Player.create({
      firstName,
      lastName,
      dateOfBirth,
      age,
      preferredPositions,
      jerseyNumber,
      guardianName,
      guardianPhone,
      email,
      team: matchedTeam ? matchedTeam._id : null,
      createdBy: req.user ? req.user.id : null
    });

    const populatedPlayer = await Player.findById(player._id).populate('team');

    res.status(201).json(populatedPlayer);
  } catch (error) {
    next(error);
  }
}

async function updatePlayer(req, res, next) {
  try {
    const updatedData = { ...req.body };

    if (updatedData.dateOfBirth) {
      const age = calculateAge(updatedData.dateOfBirth);
      updatedData.age = age;

      const matchedTeam = await Team.findOne({
        minAge: { $lte: age },
        maxAge: { $gte: age }
      });

      updatedData.team = matchedTeam ? matchedTeam._id : null;
    }

    const player = await Player.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true
    }).populate('team');

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    res.status(200).json(player);
  } catch (error) {
    next(error);
  }
}

async function deletePlayer(req, res, next) {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    res.status(200).json({ message: 'Player deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer
};