import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import CustomSelect from '../../src/components/shared/CustomSelect';
import { Icons } from '../../src/components/shared/Icons';

const AppraisalForm = ({ employeeId, onClose, onSave }) => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employee: employeeId || '',
    reviewer: '',
    period: 'Annual',
    startDate: '',
    endDate: '',
    ratings: {
      performance: 3,
      skills: 3,
      attitude: 3,
      overall: 3
    },
    achievements: [''],
    areasForImprovement: [''],
    goals: [{ description: '', targetDate: '', status: 'Pending' }],
    comments: ''
  });

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

  const handleRatingChange = (field, value) => {
    setFormData({
      ...formData,
      ratings: { ...formData.ratings, [field]: parseInt(value) }
    });
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleGoalChange = (index, field, value) => {
    const newGoals = [...formData.goals];
    newGoals[index][field] = value;
    setFormData({ ...formData, goals: newGoals });
  };

  const addGoal = () => {
    setFormData({
      ...formData,
      goals: [...formData.goals, { description: '', targetDate: '', status: 'Pending' }]
    });
  };

  const removeGoal = (index) => {
    const newGoals = formData.goals.filter((_, i) => i !== index);
    setFormData({ ...formData, goals: newGoals });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Filter out empty achievements and areas for improvement
      const cleanData = {
        ...formData,
        achievements: formData.achievements.filter(a => a.trim()),
        areasForImprovement: formData.areasForImprovement.filter(a => a.trim()),
        goals: formData.goals.filter(g => g.description.trim())
      };

      await axios.post('/api/hrms/appraisals', cleanData);
      onSave && onSave();
      onClose();
    } catch (error) {
      console.error('Error saving appraisal:', error);
      alert('Failed to save appraisal');
    }
  };

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <Card style={{ padding: 'var(--space-2xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Create Performance Appraisal</h1>
            <Button onClick={onClose} variant="ghost">
              <Icons.ChevronLeft /> Back
            </Button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: 'var(--space-xl)' }}>
              {/* Basic Information */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
                <CustomSelect
                  label="Employee"
                  id="employee"
                  name="employee"
                  value={formData.employee}
                  onChange={handleChange}
                  options={employees.map(emp => ({ value: emp._id, label: `${emp.user?.name} - ${emp.position}` }))}
                  placeholder="Select Employee"
                />

                <CustomSelect
                  label="Appraisal Period"
                  id="period"
                  name="period"
                  value={formData.period}
                  onChange={handleChange}
                  options={[
                    { value: 'Quarterly', label: 'Quarterly' },
                    { value: 'Half-Yearly', label: 'Half-Yearly' },
                    { value: 'Annual', label: 'Annual' }
                  ]}
                />

                <div className="input-group">
                  <label htmlFor="startDate">Start Date *</label>
                  <input
                    id="startDate"
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="endDate">End Date *</label>
                  <input
                    id="endDate"
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Performance Ratings */}
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-lg)' }}>
                  Performance Ratings (1-5 Scale)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                  {Object.entries(formData.ratings).map(([key, value]) => (
                    <CustomSelect
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      id={key}
                      value={value}
                      onChange={(e) => handleRatingChange(key, e.target.value)}
                      options={[1, 2, 3, 4, 5].map(num => ({ value: num, label: num.toString() }))}
                    />
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-lg)' }}>
                  Achievements
                </h3>
                {formData.achievements.map((achievement, index) => (
                  <div key={index} style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                    <input
                      type="text"
                      value={achievement}
                      onChange={(e) => handleArrayChange('achievements', index, e.target.value)}
                      placeholder="Describe key achievement..."
                      style={{ flex: 1 }}
                    />
                    {formData.achievements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('achievements', index)}
                        className="btn-ghost"
                        style={{ minWidth: 'auto', color: 'var(--danger-primary)' }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => addArrayItem('achievements')}
                  variant="ghost"
                  size="sm"
                >
                  + Add Achievement
                </Button>
              </div>

              {/* Areas for Improvement */}
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-lg)' }}>
                  Areas for Improvement
                </h3>
                {formData.areasForImprovement.map((area, index) => (
                  <div key={index} style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => handleArrayChange('areasForImprovement', index, e.target.value)}
                      placeholder="Area that needs improvement..."
                      style={{ flex: 1 }}
                    />
                    {formData.areasForImprovement.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('areasForImprovement', index)}
                        className="btn-ghost"
                        style={{ minWidth: 'auto', color: 'var(--danger-primary)' }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => addArrayItem('areasForImprovement')}
                  variant="ghost"
                  size="sm"
                >
                  + Add Area
                </Button>
              </div>

              {/* Future Goals */}
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-lg)' }}>
                  Future Goals & Objectives
                </h3>
                {formData.goals.map((goal, index) => (
                  <div key={index} style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                      <input
                        type="text"
                        value={goal.description}
                        onChange={(e) => handleGoalChange(index, 'description', e.target.value)}
                        placeholder="Goal description..."
                      />
                      <input
                        type="date"
                        value={goal.targetDate}
                        onChange={(e) => handleGoalChange(index, 'targetDate', e.target.value)}
                      />
                      <CustomSelect
                        value={goal.status}
                        onChange={(e) => handleGoalChange(index, 'status', e.target.value)}
                        options={[
                          { value: 'Pending', label: 'Pending' },
                          { value: 'In Progress', label: 'In Progress' },
                          { value: 'Completed', label: 'Completed' }
                        ]}
                      />
                      {formData.goals.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGoal(index)}
                          className="btn-ghost"
                          style={{ minWidth: 'auto', color: 'var(--danger-primary)' }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addGoal}
                  variant="ghost"
                  size="sm"
                >
                  + Add Goal
                </Button>
              </div>

              {/* Comments */}
              <div className="input-group">
                <label htmlFor="comments">Additional Comments</label>
                <textarea
                  id="comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Any additional feedback or comments..."
                />
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)' }}>
              <Button type="submit" variant="primary">
                Save Appraisal
              </Button>
              <Button type="button" onClick={onClose} variant="secondary">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default AppraisalForm;