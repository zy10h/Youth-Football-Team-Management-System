import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import TeamForm from '../components/TeamForm';

export default function TeamFormPage() {
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCoaches() {
      try {
        const response = await api.get('/coaches');
        setCoaches(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load coaches');
      }
    }

    fetchCoaches();
  }, []);

  const handleCreate = async (formData) => {
    await api.post('/teams', formData);
    navigate('/teams');
  };

  return (
    <div>
      <h1>Add Team</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <TeamForm
        onSubmit={handleCreate}
        submitText="Create Team"
        coaches={coaches}
      />
    </div>
  );
}