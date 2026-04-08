import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import CoachForm from '../components/CoachForm';

export default function CoachFormPage() {
  const navigate = useNavigate();

  const handleCreate = async (data) => {
    await api.post('/coaches', data);
    navigate('/coaches');
  };

  return (
    <div>
      <h1>Add Coach</h1>
      <CoachForm onSubmit={handleCreate} submitText="Create Coach" />
    </div>
  );
}