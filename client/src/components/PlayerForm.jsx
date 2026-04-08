import { useEffect, useMemo, useState } from 'react';
import api from '../api/api';

const positions = [
  'Goalkeeper',
  'Centre Back',
  'Fullback',
  'Defensive Midfielder',
  'Central Midfielder',
  'Attacking Midfielder',
  'Winger/Wide Midfielder',
  'Striker'
];

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;

  const today = new Date();
  const dob = new Date(dateOfBirth);

  let age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
}

export default function PlayerForm({
  initialValues,
  onSubmit,
  submitText = 'Save Player'
}) {
  const [form, setForm] = useState({
    firstName: initialValues?.firstName || '',
    lastName: initialValues?.lastName || '',
    dateOfBirth: initialValues?.dateOfBirth
      ? initialValues.dateOfBirth.slice(0, 10)
      : '',
    preferredPosition: initialValues?.preferredPosition || '',
    alternativePositions: initialValues?.alternativePositions || [],
    jerseyNumber:
      initialValues?.jerseyNumber !== undefined &&
      initialValues?.jerseyNumber !== null
        ? String(initialValues.jerseyNumber)
        : '',
    guardianName: initialValues?.guardianName || '',
    guardianPhone: initialValues?.guardianPhone || '',
    email: initialValues?.email || '',
    assignmentMode: initialValues?.team ? 'manual' : 'auto',
    team: initialValues?.team?._id || initialValues?.team || ''
  });

  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await api.get('/teams');
        setTeams(response.data || []);
      } catch (err) {
        console.error('Failed to load teams', err);
      }
    }

    fetchTeams();
  }, []);

  const age = useMemo(() => calculateAge(form.dateOfBirth), [form.dateOfBirth]);

  const recommendedTeam = useMemo(() => {
    if (age === null) return null;

    return (
      teams
        .filter((team) => age <= team.maxAge)
        .sort((a, b) => a.maxAge - b.maxAge)[0] || null
    );
  }, [age, teams]);

  const selectedTeam = useMemo(() => {
    return teams.find((team) => team._id === form.team) || null;
  }, [form.team, teams]);

  const isOverridingRecommendedTeam =
    form.assignmentMode === 'manual' &&
    selectedTeam &&
    recommendedTeam &&
    selectedTeam._id !== recommendedTeam._id;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'assignmentMode' && value === 'auto' ? { team: '' } : {})
    }));
  };

  const handleAlternativePositionChange = (position) => {
    const exists = form.alternativePositions.includes(position);

    setForm((prev) => ({
      ...prev,
      alternativePositions: exists
        ? prev.alternativePositions.filter((item) => item !== position)
        : [...prev.alternativePositions, position]
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.dateOfBirth ||
      !form.preferredPosition
    ) {
      setError(
        'First name, last name, date of birth, and preferred position are required.'
      );
      return;
    }

    if (form.jerseyNumber) {
      const jersey = Number(form.jerseyNumber);

      if (!Number.isInteger(jersey) || jersey < 1 || jersey > 99) {
        setError('Jersey number must be between 1 and 99.');
        return;
      }
    }

    if (form.assignmentMode === 'manual' && !form.team) {
      setError('Please select a team when using manual assignment.');
      return;
    }

    if (form.assignmentMode === 'manual') {
      const chosenTeam = teams.find((team) => team._id === form.team);

      if (!chosenTeam) {
        setError('Selected team was not found.');
        return;
      }

      if (age !== null && age > chosenTeam.maxAge) {
        setError('Player is too old for the selected team.');
        return;
      }
    }

    try {
      setSubmitting(true);

      await onSubmit({
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        preferredPosition: form.preferredPosition,
        alternativePositions: form.alternativePositions,
        jerseyNumber: form.jerseyNumber ? Number(form.jerseyNumber) : undefined,
        guardianName: form.guardianName,
        guardianPhone: form.guardianPhone,
        email: form.email,
        assignmentMode: form.assignmentMode,
        team:
          form.assignmentMode === 'manual'
            ? form.team
            : recommendedTeam?._id
      });
    } catch (err) {
      console.log('save player error:', err.response?.data || err);

      const responseData = err.response?.data;

      if (
        responseData?.errors &&
        Array.isArray(responseData.errors) &&
        responseData.errors.length > 0
      ) {
        setError(responseData.errors[0].msg);
      } else {
        setError(responseData?.message || 'Failed to save player');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '560px' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="firstName">First name</label>
          <br />
          <input
            id="firstName"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="lastName">Last name</label>
          <br />
          <input
            id="lastName"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="dateOfBirth">Date of birth</label>
          <br />
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={handleChange}
          />
        </div>

        {age !== null && (
          <div style={{ marginBottom: '12px' }}>
            <strong>Calculated age:</strong> {age}
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="preferredPosition">Preferred position</label>
          <br />
          <select
            id="preferredPosition"
            name="preferredPosition"
            value={form.preferredPosition}
            onChange={handleChange}
          >
            <option value="">Select a preferred position</option>
            {positions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <p>Alternative positions</p>
          {positions.map((position) => (
            <label key={position} style={{ display: 'block' }}>
              <input
                type="checkbox"
                checked={form.alternativePositions.includes(position)}
                onChange={() => handleAlternativePositionChange(position)}
                disabled={form.preferredPosition === position}
              />
              {position}
            </label>
          ))}
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="assignmentMode">Team assignment mode</label>
          <br />
          <select
            id="assignmentMode"
            name="assignmentMode"
            value={form.assignmentMode}
            onChange={handleChange}
          >
            <option value="auto">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        {form.assignmentMode === 'auto' && (
          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="autoAssignedTeam">Assigned team (auto)</label>
            <br />
            <input
              id="autoAssignedTeam"
              type="text"
              value={recommendedTeam ? recommendedTeam.name : ''}
              disabled
              style={{
                backgroundColor: '#f0f0f0',
                cursor: 'not-allowed'
              }}
            />
          </div>
        )}

        {form.assignmentMode === 'manual' && (
          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="team">Select team</label>
            <br />
            <select
              id="team"
              name="team"
              value={form.team}
              onChange={handleChange}
            >
              <option value="">Select a team</option>
              {teams.map((team) => {
                const isTooOldForTeam = age !== null && age > team.maxAge;

                return (
                  <option
                    key={team._id}
                    value={team._id}
                    disabled={isTooOldForTeam}
                  >
                    {team.name}
                    {isTooOldForTeam ? ' - Not allowed' : ''}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {isOverridingRecommendedTeam && (
          <div style={{ marginBottom: '12px' }}>
            ⚠️ You are overriding the recommended team assignment.
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="jerseyNumber">Jersey number</label>
          <br />
          <input
            id="jerseyNumber"
            name="jerseyNumber"
            type="number"
            min="1"
            max="99"
            value={form.jerseyNumber}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="guardianName">Guardian name</label>
          <br />
          <input
            id="guardianName"
            name="guardianName"
            value={form.guardianName}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="guardianPhone">Guardian phone</label>
          <br />
          <input
            id="guardianPhone"
            name="guardianPhone"
            value={form.guardianPhone}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="email">Email</label>
          <br />
          <input
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : submitText}
        </button>
      </form>
    </div>
  );
}