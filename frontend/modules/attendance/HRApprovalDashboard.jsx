import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import Badge from '../../src/components/shared/Badge';
import StatCard from '../../src/components/shared/StatCard';
import { Icons } from '../../src/components/shared/Icons';

const HRApprovalDashboard = () => {
  const [gatepasses, setGatepasses] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [selectedGatepass, setSelectedGatepass] = useState(null);
  const [comments, setComments] = useState('');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    today: 0
  });

  useEffect(() => {
    fetchGatepasses();
    fetchStats();
  }, [filter]);

  const fetchGatepasses = async () => {
    try {
      const response = await axios.get(`/api/gatepass/hr?status=${filter}`);
      setGatepasses(response.data);
    } catch (error) {
      console.error('Error fetching gatepasses:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/gatepass/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async (gatepassId) => {
    try {
      await axios.put(`/api/gatepass/${gatepassId}/approve`, { comments });
      fetchGatepasses();
      fetchStats();
      setSelectedGatepass(null);
      setComments('');
      alert('Gatepass approved! Salary will be adjusted accordingly.');
    } catch (error) {
      console.error('Error approving gatepass:', error);
      alert('Failed to approve gatepass');
    }
  };

  const handleReject = async (gatepassId) => {
    if (!comments.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    try {
      await axios.put(`/api/gatepass/${gatepassId}/reject`, { comments });
      fetchGatepasses();
      fetchStats();
      setSelectedGatepass(null);
      setComments('');
      alert('Gatepass rejected. Employee will be notified.');
    } catch (error) {
      console.error('Error rejecting gatepass:', error);
      alert('Failed to reject gatepass');
    }
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return '0 hours';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = Math.abs(endDate - startDate);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'warning';
    }
  };

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
            Gatepass Approvals
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Review and approve employee gatepass requests
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
          <StatCard
            icon="⏳"
            label="Pending Requests"
            value={stats.pending}
            trend="neutral"
          />
          <StatCard
            icon="✅"
            label="Approved Today"
            value={stats.today}
            trend="positive"
          />
          <StatCard
            icon="📊"
            label="Total Approved"
            value={stats.approved}
            trend="neutral"
          />
          <StatCard
            icon="❌"
            label="Total Rejected"
            value={stats.rejected}
            trend="neutral"
          />
        </div>

        {/* Filter Tabs */}
        <div style={{ marginBottom: 'var(--space-xl)', display: 'flex', gap: 'var(--space-sm)' }}>
          <Button
            onClick={() => setFilter('pending')}
            variant={filter === 'pending' ? 'primary' : 'secondary'}
          >
            Pending ({stats.pending})
          </Button>
          <Button
            onClick={() => setFilter('approved')}
            variant={filter === 'approved' ? 'primary' : 'secondary'}
          >
            Approved
          </Button>
          <Button
            onClick={() => setFilter('rejected')}
            variant={filter === 'rejected' ? 'primary' : 'secondary'}
          >
            Rejected
          </Button>
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'primary' : 'secondary'}
          >
            All
          </Button>
        </div>

        {/* Gatepass List */}
        <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
          {gatepasses.map(gatepass => (
            <Card
              key={gatepass._id}
              style={{
                padding: 'var(--space-lg)',
                border: selectedGatepass?._id === gatepass._id ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-md)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                      {gatepass.employee?.user?.name || 'Unknown Employee'}
                    </div>
                    <Badge variant={getStatusColor(gatepass.status)}>
                      {gatepass.status.charAt(0).toUpperCase() + gatepass.status.slice(1)}
                    </Badge>
                    {gatepass.isSiteVisit && (
                      <Badge variant="info">Site Visit</Badge>
                    )}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {gatepass.employee?.position} • {gatepass.employee?.department}
                  </div>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                  Requested: {new Date(gatepass.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div style={{ marginBottom: 'var(--space-md)' }}>
                <div style={{ fontSize: '0.9375rem', fontWeight: '600', marginBottom: 'var(--space-xs)' }}>
                  {gatepass.reason}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Destination: {gatepass.destination}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-md)',
                padding: 'var(--space-md)',
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-md)'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-xs)' }}>Start Time</div>
                  <div style={{ fontSize: '0.875rem' }}>{new Date(gatepass.startTime).toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-xs)' }}>End Time</div>
                  <div style={{ fontSize: '0.875rem' }}>{new Date(gatepass.endTime).toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-xs)' }}>Duration</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--accent-primary)' }}>
                    {calculateDuration(gatepass.startTime, gatepass.endTime)}
                  </div>
                </div>
              </div>

              {gatepass.purpose && (
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: 'var(--space-xs)' }}>Purpose:</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{gatepass.purpose}</div>
                </div>
              )}

              {gatepass.isSiteVisit && gatepass.siteDetails && (
                <div style={{
                  marginBottom: 'var(--space-md)',
                  padding: 'var(--space-md)',
                  backgroundColor: 'var(--accent-primary-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--accent-primary)'
                }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: 'var(--space-xs)', color: 'var(--accent-primary)' }}>
                    Site Visit Details:
                  </div>
                  <div style={{ fontSize: '0.875rem' }}>{gatepass.siteDetails}</div>
                </div>
              )}

              {gatepass.status === 'pending' && (
                <div>
                  {selectedGatepass?._id === gatepass._id ? (
                    <div style={{ marginTop: 'var(--space-md)' }}>
                      <div className="input-group" style={{ marginBottom: 'var(--space-md)' }}>
                        <label htmlFor="comments">Comments (required for rejection)</label>
                        <textarea
                          id="comments"
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          placeholder="Add your comments here..."
                          rows="3"
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                        <Button onClick={() => handleApprove(gatepass._id)} variant="primary">
                          Approve
                        </Button>
                        <Button onClick={() => handleReject(gatepass._id)} variant="secondary">
                          Reject
                        </Button>
                        <Button onClick={() => { setSelectedGatepass(null); setComments(''); }} variant="ghost">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                      <Button onClick={() => setSelectedGatepass(gatepass)} variant="primary">
                        Review
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {gatepass.comments && gatepass.status !== 'pending' && (
                <div style={{
                  marginTop: 'var(--space-md)',
                  padding: 'var(--space-md)',
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: 'var(--space-xs)' }}>HR Comments:</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{gatepass.comments}</div>
                </div>
              )}
            </Card>
          ))}

          {gatepasses.length === 0 && (
            <Card style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-tertiary)' }}>
                No {filter !== 'all' ? filter : ''} gatepass requests found.
              </div>
            </Card>
          )}
        </div>

        {/* Info Box */}
        <Card style={{ marginTop: 'var(--space-2xl)', padding: 'var(--space-lg)', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <strong>Salary Impact:</strong> Approved gatepasses will automatically add the time back to employee payroll. Unapproved or rejected requests will result in salary deductions for the specified duration.
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default HRApprovalDashboard;
