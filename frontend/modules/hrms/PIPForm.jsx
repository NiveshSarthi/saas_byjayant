import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import CustomSelect from '../../src/components/shared/CustomSelect';
import { Icons } from '../../src/components/shared/Icons';

const PIPForm = ({ employeeId, pipId, onClose, onSave }) => {
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    employee: employeeId || '',
    initiatedBy: '',
    reason: 'Performance Issues',
    startDate: '',
    endDate: '',
    objectives: [{ description: '', targetDate: '', status: 'Not Started', progress: 0 }],
    supportProvided: [{ type: '', description: '', date: '' }],
    status: 'Active'
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchUsers();
    if (pipId) {
      fetchPIP();
      setIsEditing(true);
    }
  }, [pipId]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/hrms/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/hrms/employees'); // Assuming users are employees
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPIP = async () => {
    try {
      const response = await axios.get(`/api/hrms/pip/${pipId}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching PIP:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleArrayChange = (field, index, key, value) => {
    const newArray = [...formData[field]];
    newArray[index][key] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    const defaultItem = field === 'objectives'
      ? { description: '', targetDate: '', status: 'Not Started', progress: 0 }
      : { type: '', description: '', date: '' };
    setFormData({ ...formData, [field]: [...formData[field], defaultItem] });
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Filter out empty objectives and support
      const cleanData = {
        ...formData,
        objectives: formData.objectives.filter(obj => obj.description.trim()),
        supportProvided: formData.supportProvided.filter(support => support.description.trim())
      };

      if (isEditing) {
        await axios.put(`/api/hrms/pip/${pipId}`, cleanData);
      } else {
        await axios.post('/api/hrms/pip', cleanData);
      }
      onSave && onSave();
      onClose();
    } catch (error) {
      console.error('Error saving PIP:', error);
      alert('Failed to save PIP');
    }
  };

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <Card style={{ padding: 'var(--space-2xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>
              {isEditing ? 'Edit Performance Improvement Plan' : 'Create Performance Improvement Plan'}
            </h1>
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
                  label="Initiated By"
                  id="initiatedBy"
                  name="initiatedBy"
                  value={formData.initiatedBy}
                  onChange={handleChange}
                  options={users.map(user => ({ value: user._id, label: user.user?.name }))}
                  placeholder="Select Initiator"
                />

                <CustomSelect
                  label="Reason"
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  options={[
                    { value: 'Performance Issues', label: 'Performance Issues' },
                    { value: 'Attendance Issues', label: 'Attendance Issues' },
                    { value: 'Behavioral Issues', label: 'Behavioral Issues' },
                    { value: 'Skill Gaps', label: 'Skill Gaps' },
                    { value: 'Other', label: 'Other' }
                  ]}
                />

                <CustomSelect
                  label="Status"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Completed', label: 'Completed' },
                    { value: 'Terminated', label: 'Terminated' },
                    { value: 'Extended', label: 'Extended' }
                  ]}
                />
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
                <div className="input-group">
                  <label htmlFor="startDate">Start Date *</label>
                  <input
                    id="startDate"
                    type="date"
                    name="startDate"
                    value={formData.startDate ? formData.startDate.split('T')[0] : ''}
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
                    value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Objectives */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Objectives</h3>
                  <Button type="button" onClick={() => addArrayItem('objectives')} variant="outline" size="sm">
                    Add Objective
                  </Button>
                </div>
                {formData.objectives.map((objective, index) => (
                  <Card key={index} style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                    <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontWeight: '500' }}>Objective {index + 1}</h4>
                        {formData.objectives.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('objectives', index)}
                            className="btn-ghost"
                            style={{ minWidth: 'auto', color: 'var(--danger-primary)' }}
                          >
                            ×
                          </button>
                        )}
                      </div>

                      <div className="input-group">
                        <label>Description *</label>
                        <textarea
                          value={objective.description}
                          onChange={(e) => handleArrayChange('objectives', index, 'description', e.target.value)}
                          rows={3}
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                        <div className="input-group">
                          <label>Target Date</label>
                          <input
                            type="date"
                            value={objective.targetDate ? objective.targetDate.split('T')[0] : ''}
                            onChange={(e) => handleArrayChange('objectives', index, 'targetDate', e.target.value)}
                          />
                        </div>

                        <CustomSelect
                          label="Status"
                          value={objective.status}
                          onChange={(e) => handleArrayChange('objectives', index, 'status', e.target.value)}
                          options={[
                            { value: 'Not Started', label: 'Not Started' },
                            { value: 'In Progress', label: 'In Progress' },
                            { value: 'Completed', label: 'Completed' },
                            { value: 'Failed', label: 'Failed' }
                          ]}
                        />

                        <div className="input-group">
                          <label>Progress (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={objective.progress}
                            onChange={(e) => handleArrayChange('objectives', index, 'progress', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Support Provided */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Support Provided</h3>
                  <Button type="button" onClick={() => addArrayItem('supportProvided')} variant="outline" size="sm">
                    Add Support
                  </Button>
                </div>
                {formData.supportProvided.map((support, index) => (
                  <Card key={index} style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                    <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontWeight: '500' }}>Support {index + 1}</h4>
                        {formData.supportProvided.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('supportProvided', index)}
                            className="btn-ghost"
                            style={{ minWidth: 'auto', color: 'var(--danger-primary)' }}
                          >
                            ×
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                        <div className="input-group">
                          <label>Type</label>
                          <input
                            type="text"
                            value={support.type}
                            onChange={(e) => handleArrayChange('supportProvided', index, 'type', e.target.value)}
                            placeholder="e.g., Training, Mentoring"
                          />
                        </div>

                        <div className="input-group">
                          <label>Date</label>
                          <input
                            type="date"
                            value={support.date ? support.date.split('T')[0] : ''}
                            onChange={(e) => handleArrayChange('supportProvided', index, 'date', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="input-group">
                        <label>Description</label>
                        <textarea
                          value={support.description}
                          onChange={(e) => handleArrayChange('supportProvided', index, 'description', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                <Button type="button" onClick={onClose} variant="outline">
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {isEditing ? 'Update PIP' : 'Create PIP'}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default PIPForm;