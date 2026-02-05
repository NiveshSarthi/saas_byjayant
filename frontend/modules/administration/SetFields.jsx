import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import Badge from '../../src/components/shared/Badge';
import { Icons } from '../../src/components/shared/Icons';

const SetFields = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [levels, setLevels] = useState([]);

  // Form states
  const [newDepartment, setNewDepartment] = useState('');
  const [newPosition, setNewPosition] = useState({ name: '', department: '', level: '' });
  const [newLevel, setNewLevel] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch data from backend
      const [deptRes, levelRes, posRes] = await Promise.all([
        axios.get('/api/administration/field-config/departments'),
        axios.get('/api/administration/field-config/levels'),
        axios.get('/api/administration/field-config/positions')
      ]);

      setDepartments(deptRes.data.values || []);
      setLevels(levelRes.data.values || []);
      setPositions(posRes.data.positions || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data from server');

      // Fallback to default values if API fails
      setDepartments(['Sales', 'Marketing', 'HR', 'Administration', 'Accounts', 'IT', 'Operations']);
      setLevels(['Intern', 'Junior Level', 'Mid Level', 'Senior Level', 'Manager', 'Director', 'VP', 'CEO']);
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  const addDepartment = async () => {
    if (newDepartment.trim() && !departments.includes(newDepartment.trim())) {
      try {
        await axios.post('/api/administration/field-config/departments/values', {
          value: newDepartment.trim()
        });
        setDepartments([...departments, newDepartment.trim()]);
        setNewDepartment('');
      } catch (error) {
        console.error('Error adding department:', error);
        setError('Failed to add department');
      }
    }
  };

  const removeDepartment = async (dept) => {
    try {
      await axios.delete('/api/administration/field-config/departments/values', {
        data: { value: dept }
      });
      setDepartments(departments.filter(d => d !== dept));
    } catch (error) {
      console.error('Error removing department:', error);
      setError('Failed to remove department');
    }
  };

  const addPosition = () => {
    if (newPosition.name.trim() && newPosition.department && newPosition.level) {
      const position = {
        id: Date.now(),
        name: newPosition.name.trim(),
        department: newPosition.department,
        level: newPosition.level
      };
      setPositions([...positions, position]);
      setNewPosition({ name: '', department: '', level: '' });
    }
  };

  const removePosition = (id) => {
    setPositions(positions.filter(p => p.id !== id));
  };

  const addLevel = () => {
    if (newLevel.trim() && !levels.includes(newLevel.trim())) {
      setLevels([...levels, newLevel.trim()]);
      setNewLevel('');
    }
  };

  const removeLevel = (level) => {
    setLevels(levels.filter(l => l !== level));
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
          Loading field settings...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
              Set Fields Management
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage departments, positions, and organizational levels
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xl)',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 'var(--space-sm)'
        }}>
          {[
            { key: 'departments', label: 'Departments' },
            { key: 'positions', label: 'Positions' },
            { key: 'levels', label: 'Levels' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: 'var(--space-sm) var(--space-md)',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: activeTab === tab.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.key ? '600' : '500',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                textTransform: 'capitalize'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <Card style={{ padding: 'var(--space-xl)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-lg)' }}>
              Manage Departments
            </h3>

            {/* Add Department */}
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
              <input
                type="text"
                placeholder="Enter department name"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                style={{
                  flex: 1,
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)'
                }}
              />
              <Button onClick={addDepartment} variant="primary">
                Add Department
              </Button>
            </div>

            {/* Department List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
              {departments.map((dept) => (
                <Card key={dept} style={{ padding: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '500' }}>{dept}</span>
                  <Button
                    onClick={() => removeDepartment(dept)}
                    variant="ghost"
                    size="sm"
                    style={{ color: 'var(--danger-primary)' }}
                  >
                    <Icons.Trash />
                  </Button>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Positions Tab */}
        {activeTab === 'positions' && (
          <Card style={{ padding: 'var(--space-xl)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-lg)' }}>
              Manage Positions
            </h3>

            {/* Add Position */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
              <input
                type="text"
                placeholder="Position name"
                value={newPosition.name}
                onChange={(e) => setNewPosition({ ...newPosition, name: e.target.value })}
                style={{
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)'
                }}
              />
              <select
                value={newPosition.department}
                onChange={(e) => setNewPosition({ ...newPosition, department: e.target.value })}
                style={{
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select
                value={newPosition.level}
                onChange={(e) => setNewPosition({ ...newPosition, level: e.target.value })}
                style={{
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <option value="">Select Level</option>
                {levels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <Button onClick={addPosition} variant="primary">
                Add Position
              </Button>
            </div>

            {/* Position List */}
            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
              {positions.map((position) => (
                <Card key={position.id} style={{ padding: 'var(--space-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-xs)' }}>
                        {position.name}
                      </h4>
                      <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                        <Badge variant="info">{position.department}</Badge>
                        <Badge variant="neutral">{position.level}</Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => removePosition(position.id)}
                      variant="ghost"
                      size="sm"
                      style={{ color: 'var(--danger-primary)' }}
                    >
                      <Icons.Trash />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Levels Tab */}
        {activeTab === 'levels' && (
          <Card style={{ padding: 'var(--space-xl)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-lg)' }}>
              Manage Organizational Levels
            </h3>

            {/* Add Level */}
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
              <input
                type="text"
                placeholder="Enter level name (e.g., Senior Manager)"
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value)}
                style={{
                  flex: 1,
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)'
                }}
              />
              <Button onClick={addLevel} variant="primary">
                Add Level
              </Button>
            </div>

            {/* Level List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
              {levels.map((level) => (
                <Card key={level} style={{ padding: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '500' }}>{level}</span>
                  <Button
                    onClick={() => removeLevel(level)}
                    variant="ghost"
                    size="sm"
                    style={{ color: 'var(--danger-primary)' }}
                  >
                    <Icons.Trash />
                  </Button>
                </Card>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default SetFields;