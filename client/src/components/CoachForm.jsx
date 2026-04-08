import { useState } from 'react';

export default function CoachForm({
  initialValues,
  onSubmit,
  submitText = 'Save Coach'
}) {
  const [form, setForm] = useState({
    firstName: initialValues?.firstName || '',
    lastName: initialValues?.lastName || '',
    email: initialValues?.email || '',
    phone: initialValues?.phone || ''
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save coach');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px' }}>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First name</label>
          <br />
          <input name="firstName" value={form.firstName} onChange={handleChange} />
        </div>

        <div>
          <label>Last name</label>
          <br />
          <input name="lastName" value={form.lastName} onChange={handleChange} />
        </div>

        <div>
          <label>Email</label>
          <br />
          <input name="email" value={form.email} onChange={handleChange} />
        </div>

        <div>
          <label>Phone</label>
          <br />
          <input name="phone" value={form.phone} onChange={handleChange} />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : submitText}
        </button>
      </form>
    </div>
  );
}