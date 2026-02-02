import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import Badge from '../../src/components/shared/Badge';
import { Icons } from '../../src/components/shared/Icons';
import PIPForm from './PIPForm';

const PIPList = () => {
  const [pips, setPips] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedPIP, setSelectedPIP] = useState(null);

  useEffect(() => {
    fetchPIPs();
  }, []);

  const fetchPIPs = async () => {
    try {
      const response = await axios.get('/api/hrms/pip');
      setPips(response.data);
    } catch (error) {
      console.error('Error fetching PIPs:', error);
    }
  };

  const deletePIP = async (id) => {
    if (window.confirm('Are you sure you want to delete this PIP?')) {
      try {
        await axios.delete(`/api/hrms/pip/${id}`);
        fetchPIPs();
      } catch (error) {
        console.error('Error deleting PIP:', error);
        alert('Failed to delete PIP');
      }
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Active': return 'warning';
      case 'Completed': return 'success';
      case 'Terminated': return 'error';
      case 'Extended': return 'info';
      default: return 'neutral';
    }
  };

  const getReasonColor = (reason) => {
    switch (reason) {
      case 'Performance Issues': return 'var(--danger-primary)';
      case 'Attendance Issues': return 'var(--warning-primary)';
      case 'Behavioral Issues': return 'var(--accent-primary)';
      case 'Skill Gaps': return 'var(--info-primary)';
      default: return 'var(--text-secondary)';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (showForm) {
    return (
      <PIPForm
        employeeId={selectedEmployee}
        pipId={selectedPIP}
        onClose={() => {
          setShowForm(false);
          setSelectedEmployee(null);
          setSelectedPIP(null);
        }}
        onSave={fetchPIPs}
      />
    );
  }

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
              Performance Improvement Plans
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage employee performance improvement plans and track progress
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} variant="primary">
            Create PIP
          </Button>
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
          {pips.length === 0 ? (
            <Card style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
                No Performance Improvement Plans found
              </p>
              <Button onClick={() => setShowForm(true)} variant="primary">
                Create First PIP
              </Button>
            </Card>
          ) : (
            pips.map((pip) => (
              <Card key={pip._id} style={{ padding: 'var(--space-xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-xs)' }}>
                      {pip.employee?.user?.name} - {pip.employee?.position}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Initiated by: {pip.initiatedBy?.name} • Created: {formatDate(pip.createdAt)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                    <Badge variant={getStatusVariant(pip.status)}>{pip.status}</Badge>
                    <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                      <Button
                        onClick={() => {
                          setSelectedPIP(pip._id);
                          setShowForm(true);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => deletePIP(pip._id)}
                        variant="outline"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)' }}>
                      Reason
                    </p>
                    <p style={{ fontWeight: '500', color: getReasonColor(pip.reason) }}>
                      {pip.reason}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)' }}>
                      Duration
                    </p>
                    <p style={{ fontWeight: '500' }}>
                      {formatDate(pip.startDate)} - {formatDate(pip.endDate)}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)' }}>
                      Objectives
                    </p>
                    <p style={{ fontWeight: '500' }}>
                      {pip.objectives?.length || 0} objectives
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)' }}>
                      Progress
                    </p>
                    <p style={{ fontWeight: '500' }}>
                      {pip.objectives?.filter(obj => obj.status === 'Completed').length || 0} / {pip.objectives?.length || 0} completed
                    </p>
                  </div>
                </div>

                {pip.objectives && pip.objectives.length > 0 && (
                  <div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                      Recent Objectives
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                      {pip.objectives.slice(0, 3).map((objective, index) => (
                        <Badge
                          key={index}
                          variant={objective.status === 'Completed' ? 'success' : objective.status === 'In Progress' ? 'warning' : 'neutral'}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {objective.description.length > 30
                            ? `${objective.description.substring(0, 30)}...`
                            : objective.description
                          } ({objective.progress}%)
                        </Badge>
                      ))}
                      {pip.objectives.length > 3 && (
                        <Badge variant="neutral" style={{ fontSize: '0.75rem' }}>
                          +{pip.objectives.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PIPList;