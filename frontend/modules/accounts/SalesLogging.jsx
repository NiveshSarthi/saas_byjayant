import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';

const SalesLogging = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employee: '',
    dealValue: '',
    cvCount: '',
    numberOfSales: '',
    type: 'Normal',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/hrms/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/accounts/deals', formData);
      alert('Sales deal logged successfully!');
      setFormData({
        employee: '',
        dealValue: '',
        cvCount: '',
        numberOfSales: '',
        type: 'Normal',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error logging deal:', error);
      alert('Failed to log sales deal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
              Log Sales Deal
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Record a new sales deal with employee details and metrics
            </p>
          </div>
        </div>

        <Card style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-2xl)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
              <div className="input-group">
                <label htmlFor="employee">Employee *</label>
                <select
                  id="employee"
                  name="employee"
                  value={formData.employee}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.user?.name || emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="dealValue">Deal Value *</label>
                <input
                  id="dealValue"
                  type="number"
                  name="dealValue"
                  value={formData.dealValue}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="input-group">
                <label htmlFor="cvCount">CV (Curriculum Vitae) *</label>
                <input
                  id="cvCount"
                  type="number"
                  name="cvCount"
                  value={formData.cvCount}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </div>

              <div className="input-group">
                <label htmlFor="numberOfSales">Number of Sales *</label>
                <input
                  id="numberOfSales"
                  type="number"
                  name="numberOfSales"
                  value={formData.numberOfSales}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>

              <div className="input-group">
                <label htmlFor="type">Sale Type *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="Normal">Normal</option>
                  <option value="NPL">NPL</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="date">Date *</label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)' }}>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Logging...' : 'Log Sales Deal'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => window.history.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default SalesLogging;