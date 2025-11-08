import React, { useState } from 'react';
import api from '../services/api';

const Registration: React.FC = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [category, setCategory] = useState('MS');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!name.trim()) {
        setMessage('❌ Name is required');
        setLoading(false);
        return;
      }

      if (!age) {
        setMessage('❌ Age is required');
        setLoading(false);
        return;
      }

      const payload = {
        name: name.trim(),
        age: typeof age === 'number' ? age : parseInt(String(age), 10),
        category
      };

      const res = await api.post('/api/players/', payload);
      console.log('Created player:', res.data);
      setMessage('✅ Player registered successfully');
      setName('');
      setAge('');
      setCategory('MS');

    } catch (err: any) {
      console.error('Registration error:', err);
      const detail = err?.response?.data || err?.message || 'Network Error';
      setMessage('❌ ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Player Registration</h2>
      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Age</label>
          <input
            type="number"
            className="form-control"
            value={age}
            onChange={e => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
            min="1"
            max="100"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Category</label>
          <select 
            className="form-control"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="MS">Men Singles</option>
            <option value="WS">Women Singles</option>
            <option value="MD">Men Doubles</option>
            <option value="WD">Women Doubles</option>
            <option value="XD">Mixed Doubles</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register Player'}
        </button>

        {message && (
          <div className={`alert mt-3 ${message.startsWith('✅') ? 'alert-success' : 'alert-danger'}`} role="alert">
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default Registration;