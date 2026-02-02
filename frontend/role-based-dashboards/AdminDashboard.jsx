import React, { useState } from 'react';
import Layout from '../src/components/shared/Layout';
import Card from '../src/components/shared/Card';
import Button from '../src/components/shared/Button';
import StatCard from '../src/components/shared/StatCard';
import Badge from '../src/components/shared/Badge';
import Toggle from '../src/components/shared/Toggle';

const AdminDashboard = () => {
  const [features, setFeatures] = useState([
    {
      id: 1,
      name: 'WhatsApp Integration',
      category: 'Communication',
      status: true,
      usage: 1247,
      limit: 2000,
      tier: 'Business',
      subFeatures: [
        { name: 'Unified Inbox', enabled: true },
        { name: 'AI Suggestions', enabled: true },
        { name: 'Auto-Reply', enabled: false }
      ]
    },
    {
      id: 2,
      name: 'Real Estate Module',
      category: 'Premium',
      status: true,
      usage: 342,
      limit: 500,
      tier: 'Enterprise',
      subFeatures: [
        { name: 'Property Matching', enabled: true },
        { name: 'Site Visit Scheduler', enabled: true },
        { name: 'Document Verification', enabled: true }
      ]
    },
    {
      id: 3,
      name: 'Automation Flows',
      category: 'Productivity',
      status: true,
      usage: 89,
      limit: 100,
      tier: 'Pro',
      subFeatures: [
        { name: 'Visual Builder', enabled: true },
        { name: 'Conditional Logic', enabled: true },
        { name: 'API Webhooks', enabled: false }
      ]
    },
    {
      id: 4,
      name: 'Advanced Analytics',
      category: 'Insights',
      status: false,
      usage: 0,
      limit: 1000,
      tier: 'Enterprise',
      subFeatures: [
        { name: 'Custom Reports', enabled: false },
        { name: 'Data Export', enabled: false },
        { name: 'Predictive Analytics', enabled: false }
      ]
    },
    {
      id: 5,
      name: 'Team Collaboration',
      category: 'Productivity',
      status: true,
      usage: 567,
      limit: 1000,
      tier: 'Business',
      subFeatures: [
        { name: 'Shared Workspaces', enabled: true },
        { name: 'Real-time Sync', enabled: true },
        { name: 'Version Control', enabled: true }
      ]
    },
    {
      id: 6,
      name: 'API Access',
      category: 'Developer',
      status: true,
      usage: 12453,
      limit: 50000,
      tier: 'Enterprise',
      subFeatures: [
        { name: 'REST API', enabled: true },
        { name: 'Webhooks', enabled: true },
        { name: 'GraphQL', enabled: false }
      ]
    }
  ]);

  const [expandedFeature, setExpandedFeature] = useState(null);

  const toggleFeature = (id) => {
    setFeatures(features.map(f =>
      f.id === id ? { ...f, status: !f.status } : f
    ));
  };

  const toggleExpanded = (id) => {
    setExpandedFeature(expandedFeature === id ? null : id);
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Enterprise': return 'primary';
      case 'Business': return 'warning';
      case 'Pro': return 'success';
      default: return 'neutral';
    }
  };

  const getUsagePercentage = (usage, limit) => {
    return Math.round((usage / limit) * 100);
  };

  const stats = [
    { icon: '🎛️', label: 'Active Features', value: features.filter(f => f.status).length, trend: 12 },
    { icon: '👥', label: 'Total Users', value: '2,847', trend: 8 },
    { icon: '📊', label: 'API Calls Today', value: '45.2K', trend: -3 },
    { icon: '⚡', label: 'System Health', value: '99.8%', trend: 0.2 }
  ];

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <h1 style={{ marginBottom: 'var(--space-sm)' }}>Feature Control Center</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Manage and monitor all platform features, usage, and quotas
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid-4 stagger-children" style={{ marginBottom: 'var(--space-2xl)' }}>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Feature Grid */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Features</h2>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <Button variant="secondary" size="sm">
              <span>🔍</span> Filter
            </Button>
            <Button variant="primary" size="sm">
              <span>➕</span> Add Feature
            </Button>
          </div>
        </div>

        <div className="grid-2" style={{ gap: 'var(--space-lg)' }}>
          {features.map((feature) => {
            const isExpanded = expandedFeature === feature.id;
            const usagePercent = getUsagePercentage(feature.usage, feature.limit);

            return (
              <Card
                key={feature.id}
                className="animate-fade-in-up"
                style={{
                  borderLeft: feature.status ? '3px solid var(--accent-primary)' : '3px solid var(--border-subtle)'
                }}
              >
                {/* Feature Header */}
                <div className="flex-between" style={{ marginBottom: 'var(--space-md)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-md)',
                      marginBottom: 'var(--space-xs)'
                    }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>
                        {feature.name}
                      </h3>
                      <Badge variant={getTierColor(feature.tier)}>
                        {feature.tier}
                      </Badge>
                    </div>
                    <div style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-tertiary)'
                    }}>
                      {feature.category}
                    </div>
                  </div>
                  <Toggle
                    checked={feature.status}
                    onChange={() => toggleFeature(feature.id)}
                  />
                </div>

                {/* Usage Metrics */}
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <div className="flex-between" style={{ marginBottom: 'var(--space-xs)' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      Usage
                    </span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: '600' }}>
                      {feature.usage.toLocaleString()} / {feature.limit.toLocaleString()}
                    </span>
                  </div>
                  <div style={{
                    height: '6px',
                    backgroundColor: 'var(--bg-elevated)',
                    borderRadius: '9999px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${usagePercent}%`,
                      backgroundColor: usagePercent > 80 ? '#EF4444' : 'var(--accent-primary)',
                      transition: 'width var(--transition-slow)',
                      borderRadius: '9999px'
                    }} />
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-tertiary)',
                    marginTop: 'var(--space-xs)'
                  }}>
                    {usagePercent}% utilized
                  </div>
                </div>

                {/* Expand/Collapse */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(feature.id)}
                  style={{ width: '100%', marginTop: 'var(--space-sm)' }}
                >
                  {isExpanded ? '▼' : '▶'} {isExpanded ? 'Hide' : 'Show'} Sub-features
                </Button>

                {/* Sub-features */}
                {isExpanded && (
                  <div
                    className="animate-fade-in-up"
                    style={{
                      marginTop: 'var(--space-md)',
                      paddingTop: 'var(--space-md)',
                      borderTop: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-sm)'
                    }}>
                      Sub-features
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                      {feature.subFeatures.map((sub, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 'var(--space-sm)',
                            backgroundColor: 'var(--bg-elevated)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8125rem'
                          }}
                        >
                          <span style={{ color: 'var(--text-primary)' }}>{sub.name}</span>
                          <Badge variant={sub.enabled ? 'success' : 'neutral'}>
                            {sub.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <Card elevated style={{ marginTop: 'var(--space-2xl)' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-lg)' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <Button variant="secondary">
            <span>📥</span> Export Configuration
          </Button>
          <Button variant="secondary">
            <span>📊</span> View Analytics
          </Button>
          <Button variant="secondary">
            <span>🔔</span> Set Alerts
          </Button>
          <Button variant="secondary">
            <span>⚙️</span> System Settings
          </Button>
        </div>
      </Card>
    </Layout>
  );
};

export default AdminDashboard;
