import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';

export default function TeamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [playerSort, setPlayerSort] = useState('positionAsc');

  useEffect(() => {
    async function fetchTeam() {
      try {
        const response = await api.get(`/teams/${id}`);
        setTeam(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load team');
      }
    }

    fetchTeam();
  }, [id]);

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

  const sortedPlayers = useMemo(() => {
    if (!team?.players) return [];

    const playersCopy = [...team.players];

    switch (playerSort) {
      case 'positionAsc':
        return playersCopy.sort((a, b) => {
          const aPos = positionOrder[a.preferredPosition] || 999;
          const bPos = positionOrder[b.preferredPosition] || 999;

          if (aPos !== bPos) return aPos - bPos;

          const aNum = a.jerseyNumber ?? 999;
          const bNum = b.jerseyNumber ?? 999;
          return aNum - bNum;
        });

      case 'positionDesc':
        return playersCopy.sort((a, b) => {
          const aPos = positionOrder[a.preferredPosition] || 0;
          const bPos = positionOrder[b.preferredPosition] || 0;

          if (aPos !== bPos) return bPos - aPos;

          const aNum = a.jerseyNumber ?? -1;
          const bNum = b.jerseyNumber ?? -1;
          return bNum - aNum;
        });

      case 'jerseyAsc':
        return playersCopy.sort((a, b) => {
          const aNum = a.jerseyNumber ?? 999;
          const bNum = b.jerseyNumber ?? 999;
          return aNum - bNum;
        });

      case 'jerseyDesc':
        return playersCopy.sort((a, b) => {
          const aNum = a.jerseyNumber ?? -1;
          const bNum = b.jerseyNumber ?? -1;
          return bNum - aNum;
        });

      case 'nameAsc':
        return playersCopy.sort((a, b) => {
          const aName = `${a.lastName} ${a.firstName}`;
          const bName = `${b.lastName} ${b.firstName}`;
          return aName.localeCompare(bName);
        });

      case 'nameDesc':
        return playersCopy.sort((a, b) => {
          const aName = `${a.lastName} ${a.firstName}`;
          const bName = `${b.lastName} ${b.firstName}`;
          return bName.localeCompare(aName);
        });

      case 'ageAsc':
        return playersCopy.sort((a, b) => (a.age ?? 999) - (b.age ?? 999));

      case 'ageDesc':
        return playersCopy.sort((a, b) => (b.age ?? -1) - (a.age ?? -1));

      default:
        return playersCopy;
    }
  }, [team, playerSort]);

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this team?');

    if (!confirmed) return;

    try {
      setDeleting(true);
      await api.delete(`/teams/${id}`);
      navigate('/teams');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete team');
    } finally {
      setDeleting(false);
    }
  };

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!team) {
    return <p>Loading team...</p>;
  }

  return (
    <div>
      <h1>{team.name}</h1>

      <p><strong>Maximum age:</strong> {team.maxAge}</p>
      <p>
        <strong>Training days:</strong>{' '}
        {team.trainingDays?.length ? team.trainingDays.join(', ') : 'N/A'}
      </p>
      <p>
        <strong>Coach:</strong>{' '}
        {team.coach
          ? `${team.coach.firstName} ${team.coach.lastName}`
          : 'Not assigned'}
      </p>

      <h2>Registered Players</h2>

      {team.players?.length ? (
        <>
          <div style={{ marginBottom: '12px' }}>
            <label>Sort players</label>
            <br />
            <select
              value={playerSort}
              onChange={(e) => setPlayerSort(e.target.value)}
            >
              <option value="positionAsc">Preferred Position (GK → DEF → MID → FW)</option>
              <option value="positionDesc">Preferred Position (FW → MID → DEF → GK)</option>
              <option value="jerseyAsc">Jersey number low-high</option>
              <option value="jerseyDesc">Jersey number high-low</option>
              <option value="nameAsc">Last name A-Z</option>
              <option value="nameDesc">Last name Z-A</option>
              <option value="ageAsc">Age low-high</option>
              <option value="ageDesc">Age high-low</option>
            </select>
          </div>

          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Name</th>
                <th>Jersey Number</th>
                <th>Age</th>
                <th>Preferred Position</th>
                <th>Alternative Positions</th>
              </tr>
            </thead>

            <tbody>
              {sortedPlayers.map((player) => (
                <tr key={player._id}>
                  <td>
                    <Link to={`/players/${player._id}`}>
                      {player.firstName} {player.lastName}
                    </Link>
                  </td>

                  <td>{player.jerseyNumber || 'N/A'}</td>

                  <td>{player.age ?? 'N/A'}</td>

                  <td>{player.preferredPosition || 'N/A'}</td>

                  <td>
                    {player.alternativePositions?.length
                      ? player.alternativePositions.join(', ')
                      : 'None'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>No players registered in this team.</p>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <Link to={`/teams/${team._id}/edit`}>
          <button>Edit Team</button>
        </Link>

        <button onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting...' : 'Delete Team'}
        </button>
      </div>
    </div>
  );
}