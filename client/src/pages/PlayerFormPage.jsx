import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import PlayerForm from '../components/PlayerForm';

export default function PlayerFormPage() {
  const navigate = useNavigate();

  const handleCreate = async (formData) => {
    await api.post('/players', formData);
    navigate('/players');
  };

  return (
    <div>
      <h1>Add Player</h1>
      <PlayerForm onSubmit={handleCreate} submitText="Create Player" />
    </div>
  );
}