import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../src/components/shared/Layout';
import Card from '../src/components/shared/Card';
import Button from '../src/components/shared/Button';
import StatCard from '../src/components/shared/StatCard';
import Badge from '../src/components/shared/Badge';

const AccountsDashboard = () => {
  const navigate = useNavigate();
  const stats = [
    { icon: '💰', label: 'Total Revenue', value: '$124.5K', trend: 12, change: '+$14K this month' },
    { icon: '🤝', label: 'Active Deals', value: '23', trend: 8 },
    { icon: '✅', label: 'Pending Approvals', value: '7', trend: -15 },
    { icon: '📈', label: 'Profit Margin', value: '32.4%', trend: 5 }
  ];

  const activeDeals = [
    { id: 1, client: 'TechCorp Inc', value: 45000, stage: 'Negotiation', probability: 75, closeDate: 'Feb 15' },
    { id: 2, client: 'StartupXYZ', value: 28000, stage: 'Proposal', probability: 60, closeDate: 'Feb 20' },
    { id: 3, client: 'Enterprise Co', value: 120000, stage: 'Contract', probability: 90, closeDate: 'Feb 10' },
    { id: 4, client: 'Digital Agency', value: 35000, stage: 'Discovery', probability: 40, closeDate: 'Mar 01' },
  ];

  const pendingApprovals = [
    { id: 1, type: 'Invoice', description: 'Q1 Software License', amount: 12500, requestedBy: 'John Doe', date: 'Jan 28' },
    { id: 2, type: 'Expense', description: 'Team Offsite', amount: 8400, requestedBy: 'Jane Smith', date: 'Jan 27' },
    { id: 3, type: 'Payment', description: 'Vendor Payment', amount: 15000, requestedBy: 'Mike Johnson', date: 'Jan 26' },
  ];

  const recentIncentives = [
    { id: 1, employee: 'Sarah Johnson', type: 'Sales Bonus', amount: 2500, period: 'Q1 2024', status: 'paid' },
    { id: 2, employee: 'Michael Chen', type: 'Performance', amount: 1800, period: 'Q1 2024', status: 'pending' },
    { id: 3, employee: 'Emily Rodriguez', type: 'Referral', amount: 500, period: 'Jan 2024', status: 'paid' },
  ];

  const getStageColor = (stage) => {
    switch (stage) {
      case 'Contract': return 'success';
      case 'Negotiation': return 'primary';
      case 'Proposal': return 'warning';
      case 'Discovery': return 'neutral';
      default: return 'neutral';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      default: return 'neutral';
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <h1 style={{ marginBottom: 'var(--space-sm)' }}>Accounts & Finance</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Manage deals, approvals, incentives, and financial operations
        </p>
      </div>

      {/* Stats */}
      <div className="grid-4 stagger-children" style={{ marginBottom: 'var(--space-2xl)' }}>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid-2" style={{ gap: 'var(--space-xl)', alignItems: 'flex-start' }}>
        {/* Active Deals */}
        <Card className="animate-fade-in-up">
          <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 style={{ fontSize: '1.125rem' }}>Active Deals</h2>
            <Button variant="primary" size="sm" onClick={() => navigate('/accounts/log-sales')}>
              <span>➕</span> Log Sales Deal
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {activeDeals.map((deal) => (
              <div
                key={deal.id}
                style={{
                  padding: 'var(--space-md)',
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer'
                }}
                className="hover-lift"
              >
                <div className="flex-between" style={{ marginBottom: 'var(--space-sm)' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                      {deal.client}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      Close Date: {deal.closeDate}
                    </div>
                  </div>
                  <Badge variant={getStageColor(deal.stage)}>
                    {deal.stage}
                  </Badge>
                </div>

                <div className="flex-between" style={{ marginBottom: 'var(--space-sm)' }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
                    ${deal.value.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                    {deal.probability}% probability
                  </span>
                </div>

                <div style={{
                  height: '4px',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: '9999px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${deal.probability}%`,
                    backgroundColor: 'var(--accent-primary)',
                    transition: 'width var(--transition-slow)',
                    borderRadius: '9999px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending Approvals */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 style={{ fontSize: '1.125rem' }}>Pending Approvals</h2>
            <Button variant="ghost" size="sm">View All →</Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {pendingApprovals.map((approval) => (
              <div
                key={approval.id}
                style={{
                  padding: 'var(--space-md)',
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div className="flex-between" style={{ marginBottom: 'var(--space-sm)' }}>
                  <Badge variant="warning">{approval.type}</Badge>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {approval.date}
                  </span>
                </div>

                <div style={{ fontWeight: '600', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                  {approval.description}
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                  Requested by {approval.requestedBy}
                </div>

                <div className="flex-between" style={{ alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
                    ${approval.amount.toLocaleString()}
                  </span>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <Button variant="ghost" size="sm">
                      ✗
                    </Button>
                    <Button variant="primary" size="sm">
                      ✓ Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Incentives */}
      <Card elevated style={{ marginTop: 'var(--space-2xl)' }} className="animate-fade-in-up">
        <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
          <h2 style={{ fontSize: '1.125rem' }}>Recent Incentives</h2>
          <Button variant="secondary" size="sm">
            <span>➕</span> Add Incentive
          </Button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '0.875rem' }}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Period</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentIncentives.map((incentive) => (
                <tr key={incentive.id}>
                  <td>{incentive.employee}</td>
                  <td>{incentive.type}</td>
                  <td style={{ fontWeight: '600' }}>${incentive.amount.toLocaleString()}</td>
                  <td>{incentive.period}</td>
                  <td>
                    <Badge variant={getStatusColor(incentive.status)}>
                      {incentive.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card elevated style={{ marginTop: 'var(--space-2xl)' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-lg)' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <Button variant="secondary">
            <span>📊</span> View Ledger
          </Button>
          <Button variant="secondary">
            <span>📥</span> Export Reports
          </Button>
          <Button variant="secondary">
            <span>💳</span> Process Payments
          </Button>
          <Button variant="secondary">
            <span>📈</span> Analytics
          </Button>
        </div>
      </Card>
    </Layout>
  );
};

export default AccountsDashboard;
