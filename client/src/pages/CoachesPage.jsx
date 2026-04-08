import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function CoachesPage() {
  const [coaches, setCoaches] = useState([]);

  useEffect(() => {
    async function fetchCoaches() {
      const response = await api.get('/coaches');
      setCoaches(response.data || []);
    }

    fetchCoaches();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Coaches</h1>
        <Link to="/coaches/new">
          <button>Add Coach</button>
        </Link>
      </div>

      {coaches.length === 0 ? (
        <p>No coaches found.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {coaches.map((coach) => (
              <tr key={coach._id}>
                <td>
                  <Link to={`/coaches/${coach._id}`}>
                    {coach.firstName} {coach.lastName}
                  </Link>
                </td>
                <td>{coach.email || 'N/A'}</td>
                <td>{coach.phone || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}