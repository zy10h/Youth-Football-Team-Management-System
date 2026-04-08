import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';

export default function PlayerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this player?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/players/${id}`);
      navigate('/players');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete player');
    } finally {
      setDeleting(false);
    }
  };

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!player) {
    return <p>Loading player...</p>;
  }

  return (
    <div>
      <h1>
        {player.firstName} {player.lastName}
      </h1>

      <p><strong>Age:</strong> {player.age}</p>
      <p><strong>Date of birth:</strong> {player.dateOfBirth?.slice(0, 10)}</p>
      <p><strong>Preferred position:</strong> {player.preferredPosition || 'N/A'}</p>
      <p>
        <strong>Alternative positions:</strong>{' '}
        {player.alternativePositions?.length
          ? player.alternativePositions.join(', ')
          : 'None'}
      </p>
      <p><strong>Jersey number:</strong> {player.jerseyNumber ?? 'N/A'}</p>
      <p><strong>Team:</strong> {player.team?.name || 'Unassigned'}</p>
      <p><strong>Guardian name:</strong> {player.guardianName || 'N/A'}</p>
      <p><strong>Guardian phone:</strong> {player.guardianPhone || 'N/A'}</p>
      <p><strong>Email:</strong> {player.email || 'N/A'}</p>

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <Link to={`/players/${player._id}/edit`}>
          <button>Edit Player</button>
        </Link>

        <button onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting...' : 'Delete Player'}
        </button>
      </div>
    </div>
  );
}