import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    async function fetchTeams() {
      const res = await api.get('/teams');
      setTeams(res.data);
    }
    fetchTeams();
  }, []);

  return (
    <div>
      <h1>Teams</h1>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Max Age</th>
            <th>Training Days</th>
            <th>Players</th>
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
              <td>{team.maxAge}</td>
              <td>{team.trainingDays?.join(', ') || 'N/A'}</td>

              <td>
                {team.players?.length ? (
                  team.players.map((p) => (
                    <div key={p._id}>
                      {p.firstName} {p.lastName} (#{p.jerseyNumber})
                    </div>
                  ))
                ) : (
                  'No players'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}