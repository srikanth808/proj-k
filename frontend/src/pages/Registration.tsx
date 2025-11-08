import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import styles from './Registration.module.css';

interface PlayerData {
  name: string;
  age: number;
  email?: string;
  phone?: string;
  country?: string;
  category: string;
}

const Registration = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    phone: '',
    country: '',
    category: 'MS'
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!formData.name.trim()) {
        setMessage('Name is required');
        setMessageType('error');
        setLoading(false);
        return;
      }

      if (!formData.age) {
        setMessage('Age is required');
        setMessageType('error');
        setLoading(false);
        return;
      }

      // Build payload with required fields first
      // Basic validations
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.age || parseInt(formData.age) < 8 || parseInt(formData.age) > 100) {
        throw new Error('Age must be between 8 and 100');
      }
      
      // Build required fields
      const payload: Record<string, any> = {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        category: formData.category
      };

      // Add optional fields only if they have values
      const email = formData.email.trim();
      const phone = formData.phone.trim();
      const country = formData.country.trim();

      if (email) {
        // Basic email format validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new Error('Invalid email format');
        }
        payload.email = email;
      }
      if (phone) payload.phone = phone;
      if (country) payload.country = country;

      // Only add optional fields if they have non-empty values
      const emailTrimmed = formData.email.trim();
      const phoneTrimmed = formData.phone.trim();
      const countryTrimmed = formData.country.trim();

      if (emailTrimmed) payload.email = emailTrimmed;
      if (phoneTrimmed) payload.phone = phoneTrimmed;
      if (countryTrimmed) payload.country = countryTrimmed;

      const res = await api.post('/players/', payload);
      console.log('Created player:', res.data);
      setMessage(`Player ${res.data.name} registered successfully!`);
      setMessageType('success');

      setFormData({
        name: '',
        age: '',
        email: '',
        phone: '',
        country: '',
        category: 'MS'
      });

    } catch (err: any) {
      console.error('Registration error:', err);
      const detail = err?.response?.data || err?.message || 'Network Error';
      setMessage(typeof detail === 'string' ? detail : JSON.stringify(detail));
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`card ${styles.registrationCard}`}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="card-header">
          <h2 className="mb-0 text-center">📝 Player Registration</h2>
          <p className="text-center text-muted mb-0 mt-2">
            Register new players for the tournament
          </p>
        </div>
        
        <div className="card-body">
          <form onSubmit={submit}>
            <div className={`grid grid-cols-2 ${styles.formGrid}`}>
              <motion.div className="form-group" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <label htmlFor="name" className="form-label">
                  Full Name <span className={styles.required}>*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Enter full name"
                />
              </motion.div>

              <motion.div className="form-group" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <label htmlFor="age" className="form-label">
                  Age <span className={styles.required}>*</span>
                </label>
                <input
                  id="age"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="8"
                  max="100"
                  required
                  className="form-input"
                  placeholder="Enter age"
                />
              </motion.div>

              <motion.div className="form-group" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter email (optional)"
                />
              </motion.div>

              <motion.div className="form-group" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                <label htmlFor="phone" className="form-label">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter phone (optional)"
                />
              </motion.div>

              <motion.div className="form-group" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                <label htmlFor="country" className="form-label">Country</label>
                <input
                  id="country"
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter country (optional)"
                />
              </motion.div>

              <motion.div className="form-group" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
                <label className="form-label">
                  Category <span className={styles.required}>*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`form-select ${styles.selectField}`}
                  aria-label="Select Tournament Category"
                >
                  <option value="MS">🏓 Men Singles</option>
                  <option value="WS">🏓 Women Singles</option>
                  <option value="MD">🏓 Men Doubles</option>
                  <option value="WD">🏓 Women Doubles</option>
                  <option value="XD">🏓 Mixed Doubles</option>
                </select>
              </motion.div>
            </div>

            <motion.div
              className="text-center mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                className={`btn ${styles.submitButton}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? '⏳ Registering...' : '🎾 Register Player'}
              </motion.button>
            </motion.div>

            {message && (
              <motion.div
                className={messageType === 'success' ? `success ${styles.messageContainer}` : `error ${styles.messageContainer}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <span className={styles.messageIcon}>
                  {messageType === 'success' ? '✅' : '❌'}
                </span>
                {message}
              </motion.div>
            )}
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Registration;