import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import Badge from '../../src/components/shared/Badge';
import CustomSelect from '../../src/components/shared/CustomSelect';
import { Icons } from '../../src/components/shared/Icons';
import FNFManagement from './FNFManagement';

const ResignationApprovals = () => {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [resignations, setResignations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResignations();
    fetchEmployees();
  }, []);

  const fetchResignations = async () => {
    try {
      setLoading(true);
      // For now, we'll use FNF data as resignation data
      // In a full implementation, you'd have a separate Resignation model
      const response = await axios.get('/api/hrms/fnf');
      setResignations(response.data);
    } catch (error) {
      console.error('Error fetching resignations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/hrms/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const updateResignationStatus = async (fnfId, newStatus) => {
    try {
      await axios.put(`/api/hrms/fnf/${fnfId}/status`, { status: newStatus });
      fetchResignations();
      alert(`Resignation ${newStatus.toLowerCase()} successfully!`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      case 'Under Review': return 'warning';
      case 'Completed': return 'success';
      case 'Paid': return 'success';
      default: return 'neutral';
    }
  };

  const tabs = [
    { key: 'pending', label: 'Pending Approvals', count: resignations.filter(r => r.status === 'Initiated' || r.status === 'Under Review').length },
    { key: 'approved', label: 'Approved', count: resignations.filter(r => r.status === 'Approved').length },
    { key: 'fnf', label: 'FNF Processing', count: resignations.filter(r => r.status === 'Approved' || r.status === 'Paid' || r.status === 'Completed').length },
    { key: 'completed', label: 'Completed', count: resignations.filter(r => r.status === 'Completed' || r.status === 'Paid').length }
  ];

  const filteredResignations = resignations.filter(resignation => {
    switch (selectedTab) {
      case 'pending':
        return resignation.status === 'Initiated' || resignation.status === 'Under Review';
      case 'approved':
        return resignation.status === 'Approved';
      case 'fnf':
        return ['Approved', 'Paid', 'Completed'].includes(resignation.status);
      case 'completed':
        return resignation.status === 'Completed' || resignation.status === 'Paid';
      default:
        return true;
    }
  });

  const renderChecklist = (resignation) => {
    const checklistItems = [
      { label: 'Resignation Letter Submitted', completed: true },
      { label: 'Notice Period Review', completed: resignation.status !== 'Initiated' },
      { label: 'Manager Approval', completed: resignation.status === 'Approved' || resignation.status === 'Under Review' },
      { label: 'HR Approval', completed: resignation.status === 'Approved' },
      { label: 'FNF Calculation', completed: resignation.finalPayroll },
      { label: 'Exit Interview', completed: resignation.status === 'Completed' },
      { label: 'Asset Recovery', completed: resignation.status === 'Completed' },
      { label: 'Final Payment', completed: resignation.paymentDate }
    ];

    return (
      <div style={{ marginTop: 'var(--space-lg)' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 'var(--space-md)' }}>
          Resignation Checklist
        </h4>
        <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
          {checklistItems.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: item.completed ? 'var(--success-primary)' : 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {item.completed && <Icons.Check style={{ width: '10px', height: '10px', color: 'white' }} />}
              </div>
              <span style={{
                fontSize: '0.875rem',
                color: item.completed ? 'var(--text-primary)' : 'var(--text-secondary)',
                textDecoration: item.completed ? 'line-through' : 'none'
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
              Resignation Approvals
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage employee resignation requests and full & final settlements
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xl)',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 'var(--space-sm)'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              style={{
                padding: 'var(--space-sm) var(--space-md)',
                backgroundColor: selectedTab === tab.key ? 'var(--bg-accent)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: selectedTab === tab.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: selectedTab === tab.key ? '600' : '500',
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)'
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <Badge variant={selectedTab === tab.key ? 'primary' : 'neutral'} style={{ fontSize: '0.75rem' }}>
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {selectedTab === 'fnf' ? (
          <FNFManagement />
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
            {filteredResignations.map(resignation => (
              <Card key={resignation._id} style={{ padding: 'var(--space-xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-lg)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                        {resignation.employee?.user?.name}
                      </h3>
                      <Badge variant={getStatusVariant(resignation.status)}>
                        {resignation.status}
                      </Badge>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {resignation.employee?.position} • {resignation.employee?.department}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                      Resigned: {new Date(resignation.resignationDate).toLocaleDateString()} •
                      Last Day: {new Date(resignation.lastWorkingDate).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                      Reason: {resignation.reason}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    {resignation.status === 'Initiated' && (
                      <>
                        <Button
                          onClick={() => updateResignationStatus(resignation._id, 'Under Review')}
                          variant="warning"
                          size="sm"
                        >
                          Review
                        </Button>
                        <Button
                          onClick={() => updateResignationStatus(resignation._id, 'Rejected')}
                          variant="danger"
                          size="sm"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {resignation.status === 'Under Review' && (
                      <Button
                        onClick={() => updateResignationStatus(resignation._id, 'Approved')}
                        variant="success"
                        size="sm"
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress and Checklist */}
                {renderChecklist(resignation)}

                {/* Additional Details */}
                {resignation.status === 'Approved' && (
                  <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Ready for FNF processing. Notice period served: {resignation.noticePeriodServed ? 'Yes' : 'No'}
                      {resignation.buyoutAmount > 0 && ` • Buyout amount: ₹${resignation.buyoutAmount.toLocaleString()}`}
                    </div>
                  </div>
                )}
              </Card>
            ))}

            {filteredResignations.length === 0 && (
              <Card style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-tertiary)' }}>
                  No resignations in this category.
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ResignationApprovals;