import React, { useState } from 'react';
import Layout from '../src/components/shared/Layout';
import Card from '../src/components/shared/Card';
import Button from '../src/components/shared/Button';
import StatCard from '../src/components/shared/StatCard';
import Badge from '../src/components/shared/Badge';
import Toggle from '../src/components/shared/Toggle';

const AdministrationDashboard = () => {
  const [checklists, setChecklists] = useState([
    { id: 1, title: 'Office Maintenance', completed: 8, total: 12, dueDate: 'Today' },
    { id: 2, title: 'IT Equipment Audit', completed: 15, total: 20, dueDate: 'Tomorrow' },
    { id: 3, title: 'Safety Inspection', completed: 5, total: 8, dueDate: 'This Week' },
  ]);

  const stats = [
    { icon: '✅', label: 'Active Checklists', value: '12', trend: 8 },
    { icon: '📦', label: 'Inventory Items', value: '1,247', trend: -2 },
    { icon: '💳', label: 'Pending Expenses', value: '$8.4K', trend: 15 },
    { icon: '📋', label: 'Open Tasks', value: '34', trend: -12 }
  ];

  const inventoryAlerts = [
    { id: 1, item: 'Office Supplies', level: 'low', quantity: 12, threshold: 50, status: 'warning' },
    { id: 2, item: 'Printer Toner', level: 'critical', quantity: 3, threshold: 10, status: 'error' },
    { id: 3, item: 'Cleaning Supplies', level: 'low', quantity: 8, threshold: 20, status: 'warning' },
  ];

  const recentExpenses = [
    { id: 1, description: 'Office Furniture', amount: 2450, category: 'Equipment', date: 'Jan 28', status: 'approved' },
    { id: 2, description: 'Software Licenses', amount: 1200, category: 'IT', date: 'Jan 27', status: 'pending' },
    { id: 3, description: 'Cleaning Services', amount: 350, category: 'Maintenance', date: 'Jan 26', status: 'approved' },
    { id: 4, description: 'Utilities', amount: 890, category: 'Operations', date: 'Jan 25', status: 'pending' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'neutral';
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <h1 style={{ marginBottom: 'var(--space-sm)' }}>Administration</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Manage checklists, inventory, and operational tasks
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
        {/* Checklists */}
        <Card className="animate-fade-in-up">
          <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 style={{ fontSize: '1.125rem' }}>Active Checklists</h2>
            <Button variant="primary" size="sm">
              <span>➕</span> New Checklist
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {checklists.map((checklist) => {
              const progress = (checklist.completed / checklist.total) * 100;
              return (
                <div
                  key={checklist.id}
                  style={{
                    padding: 'var(--space-md)',
                    backgroundColor: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div className="flex-between" style={{ marginBottom: 'var(--space-md)' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                        {checklist.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        Due: {checklist.dueDate}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
                        {checklist.completed}/{checklist.total}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {Math.round(progress)}%
                      </div>
                    </div>
                  </div>
                  <div style={{
                    height: '6px',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: '9999px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${progress}%`,
                      backgroundColor: 'var(--accent-primary)',
                      transition: 'width var(--transition-slow)',
                      borderRadius: '9999px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Inventory Alerts */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 style={{ fontSize: '1.125rem' }}>Inventory Alerts</h2>
            <Button variant="ghost" size="sm">View All →</Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {inventoryAlerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  padding: 'var(--space-md)',
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${alert.status === 'error' ? '#EF4444' : '#EAB308'}`,
                  borderLeft: `4px solid ${alert.status === 'error' ? '#EF4444' : '#EAB308'}`
                }}
              >
                <div className="flex-between" style={{ marginBottom: 'var(--space-sm)' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                    {alert.item}
                  </div>
                  <Badge variant={getStatusColor(alert.status)}>
                    {alert.level}
                  </Badge>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Current: {alert.quantity} • Threshold: {alert.threshold}
                </div>
                <Button variant="secondary" size="sm" style={{ marginTop: 'var(--space-sm)', width: '100%' }}>
                  Reorder
                </Button>
              </div>
            ))}
          </div>

          <div className="divider" />

          <Button variant="primary" style={{ width: '100%' }}>
            <span>📦</span> Manage Inventory
          </Button>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card elevated style={{ marginTop: 'var(--space-2xl)' }} className="animate-fade-in-up">
        <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
          <h2 style={{ fontSize: '1.125rem' }}>Recent Expenses</h2>
          <Button variant="secondary" size="sm">
            <span>➕</span> Add Expense
          </Button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '0.875rem' }}>
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.description}</td>
                  <td>{expense.category}</td>
                  <td style={{ fontWeight: '600' }}>${expense.amount.toLocaleString()}</td>
                  <td>{expense.date}</td>
                  <td>
                    <Badge variant={getStatusColor(expense.status)}>
                      {expense.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  );
};

export default AdministrationDashboard;
