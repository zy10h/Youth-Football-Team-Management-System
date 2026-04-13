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

async function validateJerseyNumber(teamId, jerseyNumber, excludeId = null) {
  if (!teamId || jerseyNumber === undefined || jerseyNumber === null || jerseyNumber === '') {
    return null;
  }

  const query = {
    team: teamId,
    jerseyNumber: Number(jerseyNumber)
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existingPlayer = await Player.findOne(query);

  if (existingPlayer) {
    return 'This kit number is already taken in the selected team';
  }

  return null;
}

async function getAllPlayers(req, res, next) {
  try {
    const { search, sort = 'lastName', page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const positionOrder = {
      Goalkeeper: 1,
      'Centre Back': 2,
      Fullback: 2,
      'Defensive Midfielder': 3,
      'Central Midfielder': 3,
      'Attacking Midfielder': 3,
      'Winger/Wide Midfielder': 4,
      Striker: 4
    };

    let total = 0;
    let players = [];

    if (sort === 'position' || sort === '-position') {
      const allPlayers = await Player.find(query)
        .populate('team')
        .populate('createdBy', 'username role');

      allPlayers.sort((a, b) => {
        const orderA = positionOrder[a.preferredPosition] || 999;
        const orderB = positionOrder[b.preferredPosition] || 999;

        if (orderA !== orderB) {
          return sort === 'position' ? orderA - orderB : orderB - orderA;
        }

        const jerseyA =
          a.jerseyNumber !== undefined && a.jerseyNumber !== null
            ? a.jerseyNumber
            : 999;
        const jerseyB =
          b.jerseyNumber !== undefined && b.jerseyNumber !== null
            ? b.jerseyNumber
            : 999;

        if (jerseyA !== jerseyB) {
          return jerseyA - jerseyB;
        }

        return (a.lastName || '').localeCompare(b.lastName || '');
      });

      total = allPlayers.length;
      players = allPlayers.slice(skip, skip + limitNumber);
    } else {
      total = await Player.countDocuments(query);

      players = await Player.find(query)
        .populate('team')
        .populate('createdBy', 'username role')
        .sort(sort)
        .skip(skip)
        .limit(limitNumber);
    }

    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    const links = [];

    const makeUrl = (targetPage) => {
      const params = new URLSearchParams();

      params.set('page', targetPage);
      params.set('limit', limitNumber);

      if (search) {
        params.set('search', search);
      }

      if (sort) {
        params.set('sort', sort);
      }

      return `${baseUrl}?${params.toString()}`;
    };

    if (pageNumber > 1) {
      links.push(`<${makeUrl(pageNumber - 1)}>; rel="prev"`);
    }

    if (pageNumber * limitNumber < total) {
      links.push(`<${makeUrl(pageNumber + 1)}>; rel="next"`);
    }

    if (links.length > 0) {
      res.setHeader('Link', links.join(', '));
    }

    return res.status(200).json({
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
      preferredPosition,
      alternativePositions,
      jerseyNumber,
      guardianName,
      guardianPhone,
      email,
      assignmentMode,
      team
    } = req.body;

    const age = calculateAge(dateOfBirth);

    let assignedTeam = null;

    if (assignmentMode === 'manual' && team) {
      const selectedTeam = await Team.findById(team);

      if (!selectedTeam) {
        return res.status(400).json({ message: 'Selected team not found' });
      }

      if (age > selectedTeam.maxAge) {
        return res.status(400).json({
          message: 'Player is too old for the selected team'
        });
      }

      assignedTeam = selectedTeam._id;
    } else {
      const matchedTeam = await Team.findOne({
        maxAge: { $gte: age }
      }).sort({ maxAge: 1 });

      assignedTeam = matchedTeam ? matchedTeam._id : null;
    }

    if (jerseyNumber !== undefined && jerseyNumber !== null && jerseyNumber !== '') {
      const jerseyError = await validateJerseyNumber(assignedTeam, jerseyNumber);

      if (jerseyError) {
        return res.status(409).json({ message: jerseyError });
      }
    }

    const player = await Player.create({
      firstName,
      lastName,
      dateOfBirth,
      age,
      preferredPosition,
      alternativePositions,
      jerseyNumber,
      guardianName,
      guardianPhone,
      email,
      team: assignedTeam,
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
    const existingPlayer = await Player.findById(req.params.id);

    if (!existingPlayer) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const updatedData = { ...req.body };

    let ageToUse = existingPlayer.age;

    if (updatedData.dateOfBirth) {
      ageToUse = calculateAge(updatedData.dateOfBirth);
      updatedData.age = ageToUse;
    }

    if (updatedData.assignmentMode === 'manual' && updatedData.team) {
      const selectedTeam = await Team.findById(updatedData.team);

      if (!selectedTeam) {
        return res.status(400).json({ message: 'Selected team not found' });
      }

      if (ageToUse > selectedTeam.maxAge) {
        return res.status(400).json({
          message: 'Player is too old for the selected team'
        });
      }
    } else {
      const matchedTeam = await Team.findOne({
        maxAge: { $gte: ageToUse }
      }).sort({ maxAge: 1 });

      updatedData.team = matchedTeam ? matchedTeam._id : null;
    }

    const teamToUse = updatedData.team || existingPlayer.team;
    const jerseyNumberToUse =
      updatedData.jerseyNumber !== undefined
        ? updatedData.jerseyNumber
        : existingPlayer.jerseyNumber;

    if (
      jerseyNumberToUse !== undefined &&
      jerseyNumberToUse !== null &&
      jerseyNumberToUse !== ''
    ) {
      const jerseyError = await validateJerseyNumber(
        teamToUse,
        jerseyNumberToUse,
        req.params.id
      );

      if (jerseyError) {
        return res.status(409).json({ message: jerseyError });
      }
    }

    delete updatedData.assignmentMode;

    const player = await Player.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true
    }).populate('team');

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
