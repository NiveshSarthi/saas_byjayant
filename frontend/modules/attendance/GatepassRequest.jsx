import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import Badge from '../../src/components/shared/Badge';
import { Icons } from '../../src/components/shared/Icons';

const GatepassRequest = () => {
  const [gatepasses, setGatepasses] = useState([]);
  const [formData, setFormData] = useState({
    reason: '',
    destination: '',
    startTime: '',
    endTime: '',
    purpose: '',
    isSiteVisit: false,
    siteDetails: ''
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
    fetchGatepasses();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchGatepasses = async () => {
    try {
      const response = await axios.get('/api/gatepass');
      setGatepasses(response.data);
    } catch (error) {
      console.error('Error fetching gatepasses:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/gatepass', formData);
      fetchGatepasses();
      setFormData({
        reason: '',
        destination: '',
        startTime: '',
        endTime: '',
        purpose: '',
        isSiteVisit: false,
        siteDetails: ''
      });
      alert('Gatepass request submitted successfully!');
    } catch (error) {
      console.error('Error submitting gatepass:', error);
      alert('Failed to submit gatepass request');
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

  const isSalesEmployee = user?.position?.toLowerCase().includes('sales');

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
            Gatepass Request
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Request permission to leave office premises during work hours
          </p>
        </div>

        {/* Request Form */}
        <Card style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-2xl)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-xl)' }}>
            New Gatepass Request
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
              {/* Site Visit Toggle (for Sales employees) */}
              {isSalesEmployee && (
                <div style={{
                  padding: 'var(--space-lg)',
                  backgroundColor: 'var(--accent-primary-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--accent-primary)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <input
                      id="isSiteVisit"
                      type="checkbox"
                      name="isSiteVisit"
                      checked={formData.isSiteVisit}
                      onChange={handleChange}
                    />
                    <label htmlFor="isSiteVisit" style={{ margin: 0, cursor: 'pointer', fontWeight: '600' }}>
                      This is a Site Visit
                    </label>
                  </div>
                  {formData.isSiteVisit && (
                    <div className="input-group" style={{ marginTop: 'var(--space-md)' }}>
                      <label htmlFor="siteDetails">Site Visit Details</label>
                      <textarea
                        id="siteDetails"
                        name="siteDetails"
                        value={formData.siteDetails}
                        onChange={handleChange}
                        placeholder="Property address, client name, purpose of visit..."
                        rows="3"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Reason */}
              <div className="input-group">
                <label htmlFor="reason">Reason *</label>
                <input
                  id="reason"
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  placeholder="Brief reason for leaving"
                />
              </div>

              {/* Destination */}
              <div className="input-group">
                <label htmlFor="destination">Destination *</label>
                <input
                  id="destination"
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                  placeholder="Where are you going?"
                />
              </div>

              {/* Time Range */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="input-group">
                  <label htmlFor="startTime">Start Time *</label>
                  <input
                    id="startTime"
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="endTime">End Time *</label>
                  <input
                    id="endTime"
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Duration Display */}
              {formData.startTime && formData.endTime && (
                <div style={{
                  padding: 'var(--space-md)',
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)'
                }}>
                  <strong>Duration:</strong> {calculateDuration(formData.startTime, formData.endTime)}
                </div>
              )}

              {/* Purpose */}
              <div className="input-group">
                <label htmlFor="purpose">Purpose/Details</label>
                <textarea
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="Additional details about your request..."
                  rows="3"
                />
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-2xl)' }}>
              <Button type="submit" variant="primary">
                Submit Request
              </Button>
            </div>
          </form>
        </Card>

        {/* Gatepass History */}
        <Card style={{ padding: 'var(--space-2xl)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: 'var(--space-xl)' }}>
            My Gatepass Requests
          </h2>

          <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
            {gatepasses.map(gatepass => (
              <div
                key={gatepass._id}
                className="card-hover"
                style={{
                  padding: 'var(--space-lg)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-md)' }}>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 'var(--space-xs)' }}>
                      {gatepass.reason}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {gatepass.destination}
                    </div>
                  </div>
                  <Badge variant={getStatusColor(gatepass.status)}>
                    {gatepass.status.charAt(0).toUpperCase() + gatepass.status.slice(1)}
                  </Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                  <div>
                    <Icons.Clock style={{ display: 'inline', marginRight: '0.25rem' }} />
                    {new Date(gatepass.startTime).toLocaleString()} - {new Date(gatepass.endTime).toLocaleString()}
                  </div>
                  <div>
                    Duration: {calculateDuration(gatepass.startTime, gatepass.endTime)}
                  </div>
                  {gatepass.isSiteVisit && (
                    <div style={{ color: 'var(--accent-primary)' }}>
                      <Icons.Briefcase style={{ display: 'inline', marginRight: '0.25rem' }} />
                      Site Visit
                    </div>
                  )}
                </div>

                {gatepass.comments && (
                  <div style={{
                    marginTop: 'var(--space-md)',
                    padding: 'var(--space-md)',
                    backgroundColor: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem'
                  }}>
                    <strong>HR Comments:</strong> {gatepass.comments}
                  </div>
                )}

                {gatepass.status === 'rejected' && (
                  <div style={{ marginTop: 'var(--space-md)' }}>
                    <Button
                      onClick={() => {
                        setFormData({
                          reason: gatepass.reason,
                          destination: gatepass.destination,
                          startTime: gatepass.startTime,
                          endTime: gatepass.endTime,
                          purpose: gatepass.purpose,
                          isSiteVisit: gatepass.isSiteVisit || false,
                          siteDetails: gatepass.siteDetails || ''
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      Submit for Approval Again
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {gatepasses.length === 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-tertiary)' }}>
                No gatepass requests yet. Submit your first request above.
              </div>
            )}
          </div>
        </Card>

        {/* Info Box */}
        <Card style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-lg)', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <strong>Important:</strong> Unapproved gatepass time will result in salary deduction. Once approved by HR, the time will be added back to your payroll for that day/month.
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default GatepassRequest;
