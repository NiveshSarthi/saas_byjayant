import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import CustomSelect from '../../src/components/shared/CustomSelect';

const JDForm = ({ onSubmit = () => {} }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      // For now, using mock data. In production, this would come from the SetFields API
      setDepartments(['Sales', 'Marketing', 'HR', 'Administration', 'Accounts', 'IT', 'Operations']);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/hrms/recruitment', formData);
      onSubmit();
    } catch (error) {
      console.error('Error creating JD:', error);
    }
  };

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <Card style={{ padding: 'var(--space-2xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Create Job Description</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: '500' }}>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  style={{ width: '100%', padding: 'var(--space-sm)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                  required
                />
              </div>
              <CustomSelect
                label="Department *"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                options={departments.map(dept => ({ value: dept, label: dept }))}
                placeholder="Select Department"
                required
              />
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: '500' }}>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  style={{ width: '100%', padding: 'var(--space-sm)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 'var(--space-lg)' }}>
                <Button type="submit" variant="primary">
                  Create Job Description
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default JDForm;







