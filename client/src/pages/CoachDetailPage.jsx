import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';

export default function CoachDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [coach, setCoach] = useState(null);

  useEffect(() => {
    async function fetchCoach() {
      const response = await api.get(`/coaches/${id}`);
      setCoach(response.data);
    }

    fetchCoach();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this coach?')) return;

    await api.delete(`/coaches/${id}`);
    navigate('/coaches');
  };

  if (!coach) return <p>Loading...</p>;

  return (
    <div>
      <h1>{coach.firstName} {coach.lastName}</h1>

      <p><strong>Email:</strong> {coach.email || 'N/A'}</p>
      <p><strong>Phone:</strong> {coach.phone || 'N/A'}</p>

      <div style={{ marginTop: '20px' }}>
        <Link to={`/coaches/${coach._id}/edit`}>
          <button>Edit</button>
        </Link>

        <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
}