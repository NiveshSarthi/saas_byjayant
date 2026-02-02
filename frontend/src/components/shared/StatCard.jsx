import React from 'react';

const StatCard = ({ icon, label, value, change, trend }) => {
    return (
        <div className="stat-card">
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-md)'
            }}>
                <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-primary-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                }}>
                    {icon}
                </div>
                {trend && (
                    <span className={`stat-change ${trend > 0 ? 'positive' : 'negative'}`}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            {change && (
                <div style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-tertiary)',
                    marginTop: 'var(--space-sm)'
                }}>
                    {change}
                </div>
            )}
        </div>
    );
};

export default StatCard;
