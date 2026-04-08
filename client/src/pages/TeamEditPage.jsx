import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import TeamForm from '../components/TeamForm';

export default function TeamEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [coaches, setCoaches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [teamResponse, coachesResponse] = await Promise.all([
          api.get(`/teams/${id}`),
          api.get('/coaches')
        ]);

        setTeam(teamResponse.data);
        setCoaches(coachesResponse.data || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load team');
      }
    }

    fetchData();
  }, [id]);

  const handleUpdate = async (formData) => {
    await api.put(`/teams/${id}`, formData);
    navigate(`/teams/${id}`);
  };

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!team) {
    return <p>Loading team...</p>;
  }

  return (
    <div>
      <h1>Edit Team</h1>
      <TeamForm
        initialValues={team}
        onSubmit={handleUpdate}
        submitText="Update Team"
        coaches={coaches}
      />
    </div>
  );
}