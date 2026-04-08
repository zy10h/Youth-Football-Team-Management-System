import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import PlayerForm from '../components/PlayerForm';

export default function PlayerEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPlayer() {
      try {
        const response = await api.get(`/players/${id}`);
        setPlayer(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load player');
      }
    }

    fetchPlayer();
  }, [id]);

  const handleUpdate = async (formData) => {
    await api.put(`/players/${id}`, formData);
    navigate(`/players/${id}`);
  };

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!player) {
    return <p>Loading player...</p>;
  }

  return (
    <div>
      <h1>Edit Player</h1>
      <PlayerForm
        initialValues={player}
        onSubmit={handleUpdate}
        submitText="Update Player"
      />
    </div>
  );
}