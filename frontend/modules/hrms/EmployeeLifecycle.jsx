import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import Badge from '../../src/components/shared/Badge';
import CustomSelect from '../../src/components/shared/CustomSelect';
import { Icons } from '../../src/components/shared/Icons';

const EmployeeLifecycle = () => {
    const [employees, setEmployees] = useState([]);
    const [activeTab, setActiveTab] = useState('Appraisal');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: '',
        effectiveDate: new Date().toISOString().split('T')[0],
        newSalary: 0,
        performanceRating: 'Exceeds Expectations',
        remarks: '',
        pipDuration: '30 Days',
        reason: '',
        noticePeriod: '30 Days',
        finalWorkingDay: ''
    });

    const ratings = ['Exceeds Expectations', 'Meets Expectations', 'Needs Improvement', 'Unsatisfactory'];
    const pips = ['30 Days', '60 Days', '90 Days'];

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('/api/hrms/employees');
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let endpoint = '';
            if (activeTab === 'Appraisal') endpoint = '/api/hrms/lifecycle/appraisal';
            else if (activeTab === 'PIP') endpoint = '/api/hrms/lifecycle/pip';
            else if (activeTab === 'FNF') endpoint = '/api/hrms/lifecycle/fnf';

            await axios.post(endpoint, formData);
            alert(`${activeTab} processed successfully!`);
            setShowForm(false);
            resetForm();
        } catch (error) {
            console.error(`Error processing ${activeTab}:`, error);
            alert(`Failed to process ${activeTab}`);
        }
    };

    const resetForm = () => {
        setFormData({
            employeeId: '',
            effectiveDate: new Date().toISOString().split('T')[0],
            newSalary: 0,
            performanceRating: 'Exceeds Expectations',
            remarks: '',
            pipDuration: '30 Days',
            reason: '',
            noticePeriod: '30 Days',
            finalWorkingDay: ''
        });
    };

    return (
        <Layout>
            <div style={{ padding: 'var(--space-2xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
                            Employee Lifecycle Management
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Manage performance appraisals, improvement plans, and exit workflows
                        </p>
                    </div>
                    <Button onClick={() => setShowForm(true)} variant="primary">
                        Initiate {activeTab}
                    </Button>
                </div>

                {/* Tab Selection */}
                <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                    {['Appraisal', 'PIP', 'FNF'].map(tab => (
                        <Button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setShowForm(false); resetForm(); }}
                            variant={activeTab === tab ? 'primary' : 'secondary'}
                        >
                            {tab === 'FNF' ? 'Exit / FNF' : tab}
                        </Button>
                    ))}
                </div>

                {/* Action Form */}
                {showForm && (
                    <Card style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-2xl)', border: '1px solid var(--accent-primary-subtle)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: 'var(--space-xl)' }}>
                            New {activeTab} Request
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
                                <CustomSelect
                                    label="Select Employee"
                                    name="employeeId"
                                    value={formData.employeeId}
                                    onChange={handleChange}
                                    options={employees.map(emp => ({ value: emp._id, label: `${emp.user?.name} - ${emp.position}` }))}
                                    placeholder="Select Employee"
                                />

                                {activeTab === 'Appraisal' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                        <CustomSelect
                                            label="Performance Rating"
                                            name="performanceRating"
                                            value={formData.performanceRating}
                                            onChange={handleChange}
                                            options={ratings.map(r => ({ value: r, label: r }))}
                                        />
                                        <div className="input-group">
                                            <label>New Salary (Monthly Basic)</label>
                                            <input type="number" name="newSalary" value={formData.newSalary} onChange={handleChange} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'PIP' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                        <CustomSelect
                                            label="PIP Duration"
                                            name="pipDuration"
                                            value={formData.pipDuration}
                                            onChange={handleChange}
                                            options={pips.map(p => ({ value: p, label: p }))}
                                        />
                                        <div className="input-group">
                                            <label>Effective Date *</label>
                                            <input type="date" name="effectiveDate" value={formData.effectiveDate} onChange={handleChange} required />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'FNF' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                        <CustomSelect
                                            label="Notice Period"
                                            name="noticePeriod"
                                            value={formData.noticePeriod}
                                            onChange={handleChange}
                                            options={[
                                                { value: 'None', label: 'Immediate' },
                                                { value: '15 Days', label: '15 Days' },
                                                { value: '30 Days', label: '30 Days' },
                                                { value: '60 Days', label: '60 Days' },
                                                { value: '90 Days', label: '90 Days' }
                                            ]}
                                        />
                                        <div className="input-group">
                                            <label>Last Working Day *</label>
                                            <input type="date" name="finalWorkingDay" value={formData.finalWorkingDay} onChange={handleChange} required />
                                        </div>
                                    </div>
                                )}

                                <div className="input-group">
                                    <label>{activeTab === 'Appraisal' ? 'Appraisal Comments' : 'Reason / Remarks'} *</label>
                                    <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows="4" required placeholder="Provide detailed justification..." />
                                </div>
                            </div>

                            <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)' }}>
                                <Button type="submit" variant="primary">Process {activeTab}</Button>
                                <Button type="button" onClick={() => setShowForm(false)} variant="secondary">Cancel</Button>
                            </div>
                        </form>
                    </Card>
                )}

                {/* Recent Actions Placeholder */}
                {!showForm && (
                    <Card style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
                            <Icons.Settings style={{ fontSize: '2rem', marginBottom: 'var(--space-md)', opacity: 0.5 }} />
                            <p>Select an employee and initiate a lifecycle action to see results here.</p>
                            <p style={{ fontSize: '0.8125rem', marginTop: 'var(--space-xs)' }}>
                                Appraisals automatically update payroll. PIPs track performance. FNF initiates assets return and salary settlement.
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </Layout>
    );
};

export default EmployeeLifecycle;
