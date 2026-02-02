import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import Badge from '../../src/components/shared/Badge';
import { Icons } from '../../src/components/shared/Icons';
import AppraisalForm from './AppraisalForm';

const AppraisalList = () => {
  const [appraisals, setAppraisals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchAppraisals();
  }, []);

  const fetchAppraisals = async () => {
    try {
      const response = await axios.get('/api/hrms/appraisals');
      setAppraisals(response.data);
    } catch (error) {
      console.error('Error fetching appraisals:', error);
    }
  };

  const generateAppraisalLetter = async (appraisalId) => {
    try {
      const response = await axios.get(`/api/hrms/appraisals/${appraisalId}/generate-letter`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `appraisal-letter-${appraisalId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error generating letter:', error);
      alert('Failed to generate appraisal letter');
    }
  };

  const deleteAppraisal = async (id) => {
    if (window.confirm('Are you sure you want to delete this appraisal?')) {
      try {
        await axios.delete(`/api/hrms/appraisals/${id}`);
        fetchAppraisals();
      } catch (error) {
        console.error('Error deleting appraisal:', error);
        alert('Failed to delete appraisal');
      }
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Reviewed': return 'info';
      case 'Submitted': return 'warning';
      default: return 'neutral';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'var(--success-primary)';
    if (rating >= 3) return 'var(--accent-primary)';
    return 'var(--danger-primary)';
  };

  if (showForm) {
    return (
      <AppraisalForm
        employeeId={selectedEmployee}
        onClose={() => {
          setShowForm(false);
          setSelectedEmployee(null);
        }}
        onSave={fetchAppraisals}
      />
    );
  }

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
              Performance Appraisals
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage employee performance reviews and appraisals
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} variant="primary">
            Create Appraisal
          </Button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
          <Card style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
              {appraisals.length}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Total Appraisals
            </div>
          </Card>
          <Card style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success-primary)' }}>
              {appraisals.filter(a => a.status === 'Approved').length}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Approved
            </div>
          </Card>
          <Card style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--warning-primary)' }}>
              {appraisals.filter(a => a.status === 'Draft').length}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Draft
            </div>
          </Card>
        </div>

        {/* Appraisals List */}
        <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
          {appraisals.map(appraisal => (
            <Card key={appraisal._id} style={{ padding: 'var(--space-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-lg)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                      {appraisal.employee?.user?.name}
                    </h3>
                    <Badge variant={getStatusVariant(appraisal.status)}>
                      {appraisal.status}
                    </Badge>
                    <Badge variant="info">
                      {appraisal.period}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                    {appraisal.employee?.position} • {appraisal.employee?.department}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                    {new Date(appraisal.startDate).toLocaleDateString()} - {new Date(appraisal.endDate).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <Button
                    onClick={() => generateAppraisalLetter(appraisal._id)}
                    variant="secondary"
                    size="sm"
                  >
                    <Icons.FileText /> Letter
                  </Button>
                  <Button
                    onClick={() => deleteAppraisal(appraisal._id)}
                    variant="ghost"
                    size="sm"
                  >
                    <Icons.Settings />
                  </Button>
                </div>
              </div>

              {/* Ratings */}
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 'var(--space-md)' }}>
                  Performance Ratings
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-md)' }}>
                  {Object.entries(appraisal.ratings).map(([key, value]) => (
                    <div key={key} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: getRatingColor(value) }}>
                        {value}/5
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                        {key}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements and Improvements */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                {appraisal.achievements.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', marginBottom: 'var(--space-sm)', color: 'var(--success-primary)' }}>
                      Achievements
                    </h4>
                    <ul style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {appraisal.achievements.map((achievement, index) => (
                        <li key={index} style={{ marginBottom: 'var(--space-xs)' }}>
                          • {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {appraisal.areasForImprovement.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', marginBottom: 'var(--space-sm)', color: 'var(--warning-primary)' }}>
                      Areas for Improvement
                    </h4>
                    <ul style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {appraisal.areasForImprovement.map((area, index) => (
                        <li key={index} style={{ marginBottom: 'var(--space-xs)' }}>
                          • {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Goals */}
              {appraisal.goals.length > 0 && (
                <div style={{ marginTop: 'var(--space-lg)' }}>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', marginBottom: 'var(--space-sm)' }}>
                    Future Goals
                  </h4>
                  <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                    {appraisal.goals.map((goal, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-sm)', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                        <span style={{ fontSize: '0.875rem' }}>{goal.description}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                          <Badge variant={goal.status === 'Completed' ? 'success' : goal.status === 'In Progress' ? 'info' : 'neutral'}>
                            {goal.status}
                          </Badge>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                            {new Date(goal.targetDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              {appraisal.comments && (
                <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', marginBottom: 'var(--space-sm)' }}>
                    Comments
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {appraisal.comments}
                  </p>
                </div>
              )}
            </Card>
          ))}

          {appraisals.length === 0 && (
            <Card style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-tertiary)' }}>
                No appraisals found. Create your first performance appraisal above.
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AppraisalList;