import React, { useState } from 'react';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import Badge from '../../src/components/shared/Badge';
import { Icons } from '../../src/components/shared/Icons';

const BackendLinking = () => {
    const [links, setLinks] = useState([
        {
            id: 'hrms_accounts',
            from: 'HRMS (Payroll)',
            to: 'Accounts (Payments)',
            description: 'Automatically link salary calculations to employee bank accounts for disbursement.',
            status: 'Active',
            type: 'Data Flow'
        },
        {
            id: 'admin_accounts',
            from: 'Administration (Expenses)',
            to: 'Accounts (Petty Cash)',
            description: 'Approved office expenses automatically debit the petty cash ledger.',
            status: 'Active',
            type: 'Automation'
        },
        {
            id: 'hrms_admin',
            from: 'HRMS (Employees)',
            to: 'Administration (Assets)',
            description: 'Assign company assets like laptops and mobile cards during onboarding.',
            status: 'In-active',
            type: 'Relationship'
        },
        {
            id: 'recruitment_hrms',
            from: 'Recruitment',
            to: 'HRMS (Onboarding)',
            description: 'Closed job positions automatically trigger onboarding documents and email creation.',
            status: 'Active',
            type: 'Workflow'
        },
        {
            id: 'deals_incentives',
            from: 'Accounts (Deals)',
            to: 'HRMS (Payroll)',
            description: 'Confirmed sales deals calculate incentives based on HRMS policies.',
            status: 'Active',
            type: 'Calculation'
        }
    ]);

    const [activeConfig, setActiveConfig] = useState(null);

    const toggleLink = (id) => {
        setLinks(links.map(link =>
            link.id === id ? { ...link, status: link.status === 'Active' ? 'In-active' : 'Active' } : link
        ));
    };

    return (
        <Layout>
            <div style={{ padding: 'var(--space-2xl)' }}>
                <div style={{ marginBottom: 'var(--space-2xl)' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
                        Backend Linking & Customization
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Configure no-code relationships and automated data flows between system modules.
                    </p>
                </div>

                {/* Visual Map / Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-xl)' }}>
                    {links.map(link => (
                        <Card key={link.id} style={{
                            padding: 'var(--space-xl)',
                            border: link.status === 'Active' ? '1px solid var(--accent-primary-subtle)' : '1px solid var(--border-subtle)',
                            opacity: link.status === 'Active' ? 1 : 0.7
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                                <Badge variant={link.status === 'Active' ? 'success' : 'neutral'}>{link.status}</Badge>
                                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                                    {link.type}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                                <div style={{
                                    padding: 'var(--space-sm)',
                                    backgroundColor: 'var(--bg-elevated)',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: '600',
                                    fontSize: '0.875rem',
                                    flex: 1,
                                    textAlign: 'center',
                                    border: '1px solid var(--border-subtle)'
                                }}>
                                    {link.from}
                                </div>
                                <Icons.ChevronLeft style={{ transform: 'rotate(180deg)', color: 'var(--accent-primary)' }} />
                                <div style={{
                                    padding: 'var(--space-sm)',
                                    backgroundColor: 'var(--bg-elevated)',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: '600',
                                    fontSize: '0.875rem',
                                    flex: 1,
                                    textAlign: 'center',
                                    border: '1px solid var(--border-subtle)'
                                }}>
                                    {link.to}
                                </div>
                            </div>

                            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', lineHeight: '1.5' }}>
                                {link.description}
                            </p>

                            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                                <Button
                                    onClick={() => setActiveConfig(link)}
                                    variant="primary"
                                    size="sm"
                                    style={{ flex: 1 }}
                                >
                                    Configure Rules
                                </Button>
                                <Button
                                    onClick={() => toggleLink(link.id)}
                                    variant="secondary"
                                    size="sm"
                                    style={{ flex: 1 }}
                                >
                                    {link.status === 'Active' ? 'Disable' : 'Enable'}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Configuration Modal (Simulation) */}
                {activeConfig && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(8px)'
                    }}>
                        <Card style={{ width: '100%', maxWidth: '700px', padding: 'var(--space-2xl)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Rule Configuration</h2>
                                <Button onClick={() => setActiveConfig(null)} variant="ghost">×</Button>
                            </div>

                            <div style={{ display: 'grid', gap: 'var(--space-xl)' }}>
                                <div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 'var(--space-md)' }}>Trigger conditions</h4>
                                    <div style={{ padding: 'var(--space-lg)', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                                            <input type="checkbox" checked readOnly />
                                            <span>When object state changes to <b>"Approved"</b></span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                            <input type="checkbox" checked readOnly />
                                            <span>If field <b>"Is_Recurring"</b> is <b>False</b></span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 'var(--space-md)' }}>Action Mapping</h4>
                                    <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-sm) var(--space-md)', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                                            <span style={{ color: 'var(--text-tertiary)' }}>Source: Amount</span>
                                            <Icons.ChevronLeft style={{ transform: 'rotate(180deg)' }} />
                                            <span style={{ fontWeight: '600' }}>Target: Debit_Value</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-sm) var(--space-md)', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                                            <span style={{ color: 'var(--text-tertiary)' }}>Source: Department</span>
                                            <Icons.ChevronLeft style={{ transform: 'rotate(180deg)' }} />
                                            <span style={{ fontWeight: '600' }}>Target: Ledger_Tag</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                                <Button onClick={() => setActiveConfig(null)} variant="secondary">Cancel</Button>
                                <Button onClick={() => { alert('Configuration saved!'); setActiveConfig(null); }} variant="primary">Save Configuration</Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default BackendLinking;
