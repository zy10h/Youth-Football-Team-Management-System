import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import CoachForm from '../components/CoachForm';

export default function CoachEditPage() {
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

  const handleUpdate = async (data) => {
    await api.put(`/coaches/${id}`, data);
    navigate(`/coaches/${id}`);
  };

  if (!coach) return <p>Loading...</p>;

  return (
    <div>
      <h1>Edit Coach</h1>
      <CoachForm
        initialValues={coach}
        onSubmit={handleUpdate}
        submitText="Update Coach"
      />
    </div>
  );
}