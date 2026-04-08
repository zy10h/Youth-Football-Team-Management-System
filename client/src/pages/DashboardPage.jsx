import { useEffect, useState } from 'react';
import api from '../api/api';

export default function DashboardPage() {
  const [playerCount, setPlayerCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [coachCount, setCoachCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [playersRes, teamsRes, coachesRes] = await Promise.all([
          api.get('/players'),
          api.get('/teams'),
          api.get('/coaches')
        ]);

        setPlayerCount(playersRes.data.total || 0);
        setTeamCount(teamsRes.data.length || 0);
        setCoachCount(coachesRes.data.length || 0);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      }
    }

    fetchData();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ border: '1px solid #ccc', padding: '16px', minWidth: '180px' }}>
          <h3>Total Players</h3>
          <p>{playerCount}</p>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '16px', minWidth: '180px' }}>
          <h3>Total Teams</h3>
          <p>{teamCount}</p>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '16px', minWidth: '180px' }}>
          <h3>Total Coaches</h3>
          <p>{coachCount}</p>
        </div>
      </div>
    </div>
  );
}