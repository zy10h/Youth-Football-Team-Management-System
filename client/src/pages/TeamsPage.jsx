import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await api.get('/teams');
        setTeams(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load teams');
      }
    }

    fetchTeams();
  }, []);

  return (
    <div>
      <h1>Teams</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {teams.length === 0 ? (
        <p>No teams found.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Team Name</th>
              <th>Number of Players</th>
              <th>Training Day(s)</th>
            </tr>
          </thead>

          <tbody>
            {teams.map((team) => (
              <tr key={team._id}>
                <td>
                  <Link to={`/teams/${team._id}`}>
                    {team.name}
                  </Link>
                </td>

                <td>{team.players?.length || 0}</td>

                <td>
                  {team.trainingDays?.length
                    ? team.trainingDays.join(', ')
                    : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}