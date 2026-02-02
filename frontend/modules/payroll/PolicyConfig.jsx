import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@shared/Layout';
import Card from '@shared/Card';
import Button from '@shared/Button';
import Badge from '@shared/Badge';

const PolicyConfig = () => {
  const [policies, setPolicies] = useState([]);
  const [formData, setFormData] = useState({
    role: 'Sales Executive',
    minSales: 1,
    maxSales: 1,
    incentivePercentage: 25,
    salaryRewardPercentage: 0,
    nplIncentive: 0.10,
    normalIncentive: 0.25,
    supportiveSplit: 50,
    incentiveUnlockSequence: '1st unlocked after 2nd, 2nd after 3rd',
    monthEndLocking: true,
    ownershipDays: 60
  });
  const [editingId, setEditingId] = useState(null);
  const [showPresets, setShowPresets] = useState(true);

  // Predefined policy presets based on requirements
  const policyPresets = {
    'Sales Executive - 3S': {
      role: 'Sales Executive',
      minSales: 3,
      maxSales: 999,
      incentivePercentage: 25,
      salaryRewardPercentage: 50,
      nplIncentive: 0.10,
      normalIncentive: 0.25,
      supportiveSplit: 50,
      incentiveUnlockSequence: '1st unlocked after 2nd, 2nd after 3rd',
      monthEndLocking: true,
      ownershipDays: 60
    },
    'Sales Executive - 2S': {
      role: 'Sales Executive',
      minSales: 2,
      maxSales: 2,
      incentivePercentage: 25,
      salaryRewardPercentage: 0,
      nplIncentive: 0.10,
      normalIncentive: 0.25,
      supportiveSplit: 50,
      incentiveUnlockSequence: '1st unlocked after 2nd, 2nd after 3rd',
      monthEndLocking: true,
      ownershipDays: 60
    },
    'Sales Executive - 1S': {
      role: 'Sales Executive',
      minSales: 1,
      maxSales: 1,
      incentivePercentage: 25,
      salaryRewardPercentage: 0,
      nplIncentive: 0.10,
      normalIncentive: 0.25,
      supportiveSplit: 50,
      incentiveUnlockSequence: '1st unlocked after 2nd, 2nd after 3rd',
      monthEndLocking: true,
      ownershipDays: 60
    },
    'Sales Manager - 3S Per Executive': {
      role: 'Manager',
      minSales: 3,
      maxSales: 999,
      incentivePercentage: 25,
      salaryRewardPercentage: 50,
      nplIncentive: 0.10,
      normalIncentive: 0.25,
      supportiveSplit: 50,
      incentiveUnlockSequence: '1st unlocked after 2nd, 2nd after 3rd',
      monthEndLocking: true,
      ownershipDays: 60
    },
    'Sales Manager - 2S Per Executive': {
      role: 'Manager',
      minSales: 2,
      maxSales: 2,
      incentivePercentage: 25,
      salaryRewardPercentage: 0,
      nplIncentive: 0.10,
      normalIncentive: 0.25,
      supportiveSplit: 50,
      incentiveUnlockSequence: '1st unlocked after 2nd, 2nd after 3rd',
      monthEndLocking: true,
      ownershipDays: 60
    },
    'Sales Manager - 1S Per Executive': {
      role: 'Manager',
      minSales: 1,
      maxSales: 1,
      incentivePercentage: 10,
      salaryRewardPercentage: 0,
      nplIncentive: 0.10,
      normalIncentive: 0.10,
      supportiveSplit: 50,
      incentiveUnlockSequence: '1st unlocked after 2nd, 2nd after 3rd',
      monthEndLocking: true,
      ownershipDays: 60
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await axios.get('/api/sales-policy');
      setPolicies(response.data);
    } catch (error) {
      console.error('Error fetching policies:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const loadPreset = (presetName) => {
    setFormData(policyPresets[presetName]);
    setShowPresets(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/sales-policy/${editingId}`, formData);
      } else {
        await axios.post('/api/sales-policy', formData);
      }
      fetchPolicies();
      resetForm();
    } catch (error) {
      console.error('Error saving policy:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      role: 'Sales Executive',
      minSales: 1,
      maxSales: 1,
      incentivePercentage: 25,
      salaryRewardPercentage: 0,
      nplIncentive: 0.10,
      normalIncentive: 0.25,
      supportiveSplit: 50,
      incentiveUnlockSequence: '1st unlocked after 2nd, 2nd after 3rd',
      monthEndLocking: true,
      ownershipDays: 60
    });
    setEditingId(null);
    setShowPresets(true);
  };

  const handleEdit = (policy) => {
    setFormData(policy);
    setEditingId(policy._id);
    setShowPresets(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await axios.delete(`/api/sales-policy/${id}`);
        fetchPolicies();
      } catch (error) {
        console.error('Error deleting policy:', error);
      }
    }
  };

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
            Sales Policy Configuration
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Configure sales incentive policies for Executives and Managers
          </p>
        </div>

        {/* Policy Presets */}
        {showPresets && (
          <Card style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-2xl)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-lg)' }}>
              Quick Presets
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
              {Object.keys(policyPresets).map(presetName => (
                <button
                  key={presetName}
                  onClick={() => loadPreset(presetName)}
                  className="card-hover"
                  style={{
                    padding: 'var(--space-lg)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ fontSize: '0.9375rem', fontWeight: '600', marginBottom: 'var(--space-sm)' }}>
                    {presetName}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                    {policyPresets[presetName].normalIncentive}% Normal | {policyPresets[presetName].nplIncentive}% NPL
                    {policyPresets[presetName].salaryRewardPercentage > 0 && ` | +${policyPresets[presetName].salaryRewardPercentage}% Reward`}
                  </div>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 'var(--space-lg)', textAlign: 'center' }}>
              <Button onClick={() => setShowPresets(false)} variant="ghost">
                Create Custom Policy
              </Button>
            </div>
          </Card>
        )}

        {/* Policy Form */}
        {!showPresets && (
          <Card style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-2xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                {editingId ? 'Edit Policy' : 'Create New Policy'}
              </h2>
              <Button onClick={resetForm} variant="ghost">
                Cancel
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
                {/* Role */}
                <div className="input-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Manager">Sales Manager</option>
                  </select>
                </div>

                {/* Sales Range */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label htmlFor="minSales">Minimum Sales</label>
                    <input
                      id="minSales"
                      type="number"
                      name="minSales"
                      value={formData.minSales}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="maxSales">Maximum Sales</label>
                    <input
                      id="maxSales"
                      type="number"
                      name="maxSales"
                      value={formData.maxSales}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                </div>

                {/* Incentive Rates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label htmlFor="normalIncentive">Normal Sale Incentive (%)</label>
                    <input
                      id="normalIncentive"
                      type="number"
                      step="0.01"
                      name="normalIncentive"
                      value={formData.normalIncentive}
                      onChange={handleChange}
                    />
                    <small style={{ color: 'var(--text-tertiary)' }}>For revenue &gt; 0.5% of CV</small>
                  </div>
                  <div className="input-group">
                    <label htmlFor="nplIncentive">NPL Sale Incentive (%)</label>
                    <input
                      id="nplIncentive"
                      type="number"
                      step="0.01"
                      name="nplIncentive"
                      value={formData.nplIncentive}
                      onChange={handleChange}
                    />
                    <small style={{ color: 'var(--text-tertiary)' }}>For revenue &lt; 0.5% of CV</small>
                  </div>
                </div>

                {/* Salary Reward */}
                <div className="input-group">
                  <label htmlFor="salaryRewardPercentage">Salary Reward (%)</label>
                  <input
                    id="salaryRewardPercentage"
                    type="number"
                    step="0.01"
                    name="salaryRewardPercentage"
                    value={formData.salaryRewardPercentage}
                    onChange={handleChange}
                  />
                  <small style={{ color: 'var(--text-tertiary)' }}>Bonus percentage of basic salary</small>
                </div>

                {/* Supportive Split */}
                <div className="input-group">
                  <label htmlFor="supportiveSplit">Supportive Sale Split (%)</label>
                  <input
                    id="supportiveSplit"
                    type="number"
                    step="0.01"
                    name="supportiveSplit"
                    value={formData.supportiveSplit}
                    onChange={handleChange}
                  />
                  <small style={{ color: 'var(--text-tertiary)' }}>Percentage split for joint sales</small>
                </div>

                {/* Ownership Days */}
                <div className="input-group">
                  <label htmlFor="ownershipDays">Ownership Transfer Days</label>
                  <input
                    id="ownershipDays"
                    type="number"
                    name="ownershipDays"
                    value={formData.ownershipDays}
                    onChange={handleChange}
                  />
                  <small style={{ color: 'var(--text-tertiary)' }}>Days before credit transfers to new holder</small>
                </div>

                {/* Incentive Unlock Sequence */}
                <div className="input-group">
                  <label htmlFor="incentiveUnlockSequence">Incentive Unlock Sequence</label>
                  <input
                    id="incentiveUnlockSequence"
                    type="text"
                    name="incentiveUnlockSequence"
                    value={formData.incentiveUnlockSequence}
                    onChange={handleChange}
                  />
                  <small style={{ color: 'var(--text-tertiary)' }}>E.g., "1st unlocked after 2nd, 2nd after 3rd"</small>
                </div>

                {/* Month End Locking */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <input
                    id="monthEndLocking"
                    type="checkbox"
                    name="monthEndLocking"
                    checked={formData.monthEndLocking}
                    onChange={handleChange}
                  />
                  <label htmlFor="monthEndLocking" style={{ margin: 0, cursor: 'pointer' }}>
                    Lock rewards at month-end (10-day grace period for targets only)
                  </label>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)' }}>
                <Button type="submit" variant="primary">
                  {editingId ? 'Update Policy' : 'Create Policy'}
                </Button>
                <Button type="button" onClick={resetForm} variant="secondary">
                  Reset
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Existing Policies */}
        <Card style={{ padding: 'var(--space-2xl)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: 'var(--space-xl)' }}>
            Active Policies
          </h2>
          <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
            {policies.map(policy => (
              <div
                key={policy._id}
                className="card-hover"
                style={{
                  padding: 'var(--space-lg)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                    <Badge variant={policy.role === 'Sales Executive' ? 'primary' : 'info'}>
                      {policy.role}
                    </Badge>
                    <span style={{ fontSize: '0.9375rem', fontWeight: '600' }}>
                      {policy.minSales} - {policy.maxSales === 999 ? '∞' : policy.maxSales} Sales
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Normal: {policy.normalIncentive}% | NPL: {policy.nplIncentive}%
                    {policy.salaryRewardPercentage > 0 && ` | Reward: +${policy.salaryRewardPercentage}%`}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: 'var(--space-xs)' }}>
                    {policy.incentiveUnlockSequence}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <Button onClick={() => handleEdit(policy)} variant="secondary" size="sm">
                    Edit
                  </Button>
                  <Button onClick={() => handleDelete(policy._id)} variant="ghost" size="sm">
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {policies.length === 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-tertiary)' }}>
                No policies configured yet. Create your first policy above.
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default PolicyConfig;
