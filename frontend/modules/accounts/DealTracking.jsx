import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import Badge from '../../src/components/shared/Badge';
import StatCard from '../../src/components/shared/StatCard';
import { Icons } from '../../src/components/shared/Icons';

const DealTracking = () => {
  const [deals, setDeals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    clientName: '',
    project: '',
    unitNumber: '',
    cvAmount: 0,
    dealDate: new Date().toISOString().split('T')[0],
    isNPL: false,
    status: 'Confirmed'
  });
  const [stats, setStats] = useState({
    totalCV: 0,
    dealsCount: 0,
    pendingIncentives: 0
  });

  useEffect(() => {
    fetchDeals();
    fetchEmployees();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await axios.get('/api/accounts/deals');
      setDeals(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching deals:', error);
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

  const calculateStats = (data) => {
    const totalCV = data.reduce((acc, deal) => acc + (parseFloat(deal.cvAmount) || 0), 0);
    const pendingIncentives = data.filter(deal => deal.incentiveStatus === 'Locked' || deal.incentiveStatus === 'Unlocked').length;
    setStats({
      totalCV,
      dealsCount: data.length,
      pendingIncentives
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/accounts/deals', formData);
      fetchDeals();
      resetForm();
      alert('Deal recorded successfully!');
    } catch (error) {
      console.error('Error recording deal:', error);
      alert('Failed to record deal');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      clientName: '',
      project: '',
      unitNumber: '',
      cvAmount: 0,
      dealDate: new Date().toISOString().split('T')[0],
      isNPL: false,
      status: 'Confirmed'
    });
    setShowAddForm(false);
  };

  const updateBuilderPayment = async (dealId, status) => {
    try {
      await axios.put(`/api/accounts/deals/${dealId}/builder-payment`, { builderPaymentStatus: status });
      fetchDeals(); // This should trigger the unlock logic on backend as well
    } catch (error) {
      console.error('Error updating builder payment:', error);
    }
  };

  const releaseIncentive = async (dealId) => {
    try {
      await axios.post(`/api/accounts/deals/${dealId}/release-incentive`);
      fetchDeals();
      alert('Incentive released successfully!');
    } catch (error) {
      console.error('Error releasing incentive:', error);
      alert(error.response?.data?.message || 'Failed to release incentive');
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Released': return 'success';
      case 'Unlocked': return 'info';
      case 'Locked': return 'warning';
      default: return 'neutral';
    }
  };

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
              Deal & Incentive Tracking
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage sales closures, CV values, and policy-based incentive releases
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)} variant="primary">
            Record New Deal
          </Button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
          <StatCard
            icon="🏢"
            label="Total CV Volume"
            value={`₹${stats.totalCV.toLocaleString()}`}
            trend="positive"
          />
          <StatCard
            icon="🤝"
            label="Total Deals"
            value={stats.dealsCount}
            trend="neutral"
          />
          <StatCard
            icon="⏳"
            label="Incentives Pending"
            value={stats.pendingIncentives}
            trend="neutral"
          />
        </div>

        {/* Add Deal Form */}
        {showAddForm && (
          <Card style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-2xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Record New Sale closure</h2>
              <Button onClick={resetForm} variant="ghost">
                <Icons.ChevronLeft /> Back
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
                <div style={{ display: gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label htmlFor="employeeId">Sales Executive *</label>
                    <select id="employeeId" name="employeeId" value={formData.employeeId} onChange={handleChange} required>
                      <option value="">Select Executive</option>
                      {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.user?.name}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label htmlFor="clientName">Client Name *</label>
                    <input id="clientName" type="text" name="clientName" value={formData.clientName} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label htmlFor="cvAmount">CV (Consideration Value) *</label>
                    <input id="cvAmount" type="number" name="cvAmount" value={formData.cvAmount} onChange={handleChange} required min="0" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label htmlFor="project">Project *</label>
                    <input id="project" type="text" name="project" value={formData.project} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label htmlFor="unitNumber">Unit Number</label>
                    <input id="unitNumber" type="text" name="unitNumber" value={formData.unitNumber} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label htmlFor="dealDate">Closure Date *</label>
                    <input id="dealDate" type="date" name="dealDate" value={formData.dealDate} onChange={handleChange} required />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}>
                    <input type="checkbox" name="isNPL" checked={formData.isNPL} onChange={handleChange} />
                    <span>NPL Sale (0.10% Incentive)</span>
                  </label>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)' }}>
                <Button type="submit" variant="primary">Confirm Deal</Button>
                <Button type="button" onClick={resetForm} variant="secondary">Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Deal Inventory */}
        <Card style={{ padding: 'var(--space-2xl)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Deal Details</th>
                  <th>Executive</th>
                  <th>CV Amount</th>
                  <th>Builder Payment</th>
                  <th>Incentive Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal, index) => (
                  <tr key={deal._id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{deal.clientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{deal.project} - {deal.unitNumber}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-primary)' }}>Deal #{deals.length - index}</div>
                    </td>
                    <td>{deal.employee?.user?.name}</td>
                    <td>
                      <div style={{ fontWeight: '700' }}>₹{parseFloat(deal.cvAmount).toLocaleString()}</div>
                      {deal.isNPL && <Badge variant="warning">NPL</Badge>}
                    </td>
                    <td>
                      <select
                        value={deal.builderPaymentStatus}
                        onChange={(e) => updateBuilderPayment(deal._id, e.target.value)}
                        style={{
                          padding: 'var(--space-xs) var(--space-sm)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: deal.builderPaymentStatus === 'Received' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: deal.builderPaymentStatus === 'Received' ? 'var(--success-primary)' : 'var(--danger-primary)',
                          border: 'none',
                          fontWeight: '600'
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Received">Received</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'grid', gap: 'var(--space-xs)' }}>
                        <Badge variant={getStatusVariant(deal.incentiveStatus)}>
                          {deal.incentiveStatus}
                        </Badge>
                        {deal.incentiveStatus === 'Locked' && (
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                            Awaiting next sale confirmation
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {deal.incentiveStatus === 'Unlocked' ? (
                        <Button
                          onClick={() => releaseIncentive(deal._id)}
                          variant="primary"
                          size="sm"
                          disabled={deal.builderPaymentStatus !== 'Received'}
                        >
                          Release Incentive
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" disabled>
                          <Icons.Settings />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {deals.length === 0 && (
            <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No deals found. Record your first sale closure above.
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default DealTracking;
