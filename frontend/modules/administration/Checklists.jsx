import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import Badge from '../../src/components/shared/Badge';
import { Icons } from '../../src/components/shared/Icons';

const Checklists = () => {
  const [checklists, setChecklists] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'daily',
    items: ['']
  });
  const [activeTab, setActiveTab] = useState('daily');



  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    try {
      const response = await axios.get('/api/administration/checklists');
      setChecklists(response.data);
    } catch (error) {
      console.error('Error fetching checklists:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleItemChange = (index, value) => {
    const newItems = [...formData.items];
    newItems[index] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItemField = () => {
    setFormData({ ...formData, items: [...formData.items, ''] });
  };

  const removeItemField = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        items: formData.items.filter(item => item.trim() !== '')
      };
      await axios.post('/api/administration/checklists', payload);
      fetchChecklists();
      resetForm();
      alert('Checklist created successfully!');
    } catch (error) {
      console.error('Error creating checklist:', error);
      alert('Failed to create checklist');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'daily',
      items: ['']
    });
    setShowAddForm(false);
  };

  const toggleItem = async (checklistId, itemIndex) => {
    try {
      const checklist = checklists.find(c => c._id === checklistId);
      const newItems = [...checklist.items];
      newItems[itemIndex].completed = !newItems[itemIndex].completed;

      await axios.put(`/api/administration/checklists/${checklistId}`, { items: newItems });
      fetchChecklists();
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  const deleteChecklist = async (id) => {
    if (window.confirm('Delete this checklist?')) {
      try {
        await axios.delete(`/api/administration/checklists/${id}`);
        fetchChecklists();
      } catch (error) {
        console.error('Error deleting checklist:', error);
      }
    }
  };

  const filteredChecklists = checklists.filter(c => c.type === activeTab);

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
              Checklist System
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage daily routines and one-time tasks for the administration team
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)} variant="primary">
            New Checklist
          </Button>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
          <Button
            onClick={() => setActiveTab('daily')}
            variant={activeTab === 'daily' ? 'primary' : 'secondary'}
          >
            Daily Routines
          </Button>
          <Button
            onClick={() => setActiveTab('one-time')}
            variant={activeTab === 'one-time' ? 'primary' : 'secondary'}
          >
            One-time Tasks
          </Button>
        </div>

        {/* Add Checklist Form */}
        {showAddForm && (
          <Card style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-2xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Create {formData.type} Checklist</h2>
              <Button onClick={resetForm} variant="ghost">
                <Icons.ChevronLeft /> Back
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label htmlFor="title">Checklist Title *</label>
                    <input
                      id="title"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Morning Floor Audit"
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="type">Frequency *</label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="daily">Daily</option>
                      <option value="one-time">One-time Task</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="description">Description</label>
                  <input
                    id="description"
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Briefly describe the purpose of this checklist"
                  />
                </div>

                <div className="input-group">
                  <label>Checklist Items *</label>
                  <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                    {formData.items.map((item, index) => (
                      <div key={index} style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleItemChange(index, e.target.value)}
                          placeholder={`Item ${index + 1}`}
                          required
                        />
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemField(index)}
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
                      onClick={addItemField}
                      variant="ghost"
                      size="sm"
                      style={{ marginTop: 'var(--space-sm)', alignSelf: 'start' }}
                    >
                      + Add Another Item
                    </Button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)' }}>
                <Button type="submit" variant="primary">
                  Save Checklist
                </Button>
                <Button type="button" onClick={resetForm} variant="secondary">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Checklists Display */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--space-xl)' }}>
          {filteredChecklists.map(checklist => (
            <Card key={checklist._id} style={{ padding: 'var(--space-xl)', height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-md)' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: 'var(--space-xs)' }}>{checklist.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{checklist.description}</p>
                </div>
                <button
                  onClick={() => deleteChecklist(checklist._id)}
                  className="btn-ghost"
                  style={{ minWidth: 'auto', padding: 'var(--space-xs)' }}
                >
                  <Icons.Settings />
                </button>
              </div>

              <div style={{ marginTop: 'var(--space-lg)', display: 'grid', gap: 'var(--space-xs)' }}>
                {checklist.items.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => toggleItem(checklist._id, index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-md)',
                      padding: 'var(--space-sm)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      backgroundColor: item.completed ? 'rgba(34, 197, 94, 0.05)' : 'transparent',
                      transition: 'all var(--transition-fast)'
                    }}
                    className="checkbox-item"
                  >
                    <div style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      border: '2px solid',
                      borderColor: item.completed ? 'var(--success-primary)' : 'var(--border-default)',
                      borderRadius: 'var(--radius-xs)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: item.completed ? 'var(--success-primary)' : 'transparent',
                      color: 'white',
                      fontSize: '0.75rem'
                    }}>
                      {item.completed && '✓'}
                    </div>
                    <span style={{
                      fontSize: '0.9375rem',
                      color: item.completed ? 'var(--text-tertiary)' : 'var(--text-primary)',
                      textDecoration: item.completed ? 'line-through' : 'none'
                    }}>
                      {item.item}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: 'var(--space-xl)',
                paddingTop: 'var(--space-md)',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)'
              }}>
                <div>
                  Progress: {checklist.items.filter(i => i.completed).length} / {checklist.items.length}
                </div>
                <div>
                  Last Updated: {new Date(checklist.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </Card>
          ))}

          {filteredChecklists.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              padding: 'var(--space-2xl)',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-subtle)'
            }}>
              No {activeTab.toLowerCase()} checklists found. Create one to get started.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Checklists;
