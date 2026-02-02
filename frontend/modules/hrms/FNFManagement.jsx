import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import Badge from '../../src/components/shared/Badge';
import CustomSelect from '../../src/components/shared/CustomSelect';
import { Icons } from '../../src/components/shared/Icons';

const FNFManagement = () => {
  const [fnfs, setFnfs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    resignationDate: '',
    lastWorkingDate: '',
    reason: 'Personal Reasons',
    noticePeriodServed: false,
    buyoutAmount: 0
  });
  const [calculatedFNF, setCalculatedFNF] = useState(null);

  useEffect(() => {
    fetchFNFs();
    fetchEmployees();
  }, []);

  const fetchFNFs = async () => {
    try {
      const response = await axios.get('/api/hrms/fnf');
      setFnfs(response.data);
    } catch (error) {
      console.error('Error fetching FNFs:', error);
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const calculateFNF = async () => {
    try {
      const response = await axios.post('/api/hrms/fnf/calculate', {
        employeeId: formData.employeeId,
        resignationDate: formData.resignationDate,
        lastWorkingDate: formData.lastWorkingDate
      });
      setCalculatedFNF(response.data);
    } catch (error) {
      console.error('Error calculating FNF:', error);
      alert('Failed to calculate FNF');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fnfData = {
        ...formData,
        ...calculatedFNF
      };
      await axios.post('/api/hrms/fnf', fnfData);
      fetchFNFs();
      resetForm();
      alert('FNF initiated successfully!');
    } catch (error) {
      console.error('Error creating FNF:', error);
      alert('Failed to initiate FNF');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      resignationDate: '',
      lastWorkingDate: '',
      reason: 'Personal Reasons',
      noticePeriodServed: false,
      buyoutAmount: 0
    });
    setCalculatedFNF(null);
    setShowForm(false);
  };

  const generateFNFLetter = async (fnfId) => {
    try {
      const response = await axios.get(`/api/hrms/fnf/${fnfId}/generate-letter`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fnf-settlement-${fnfId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error generating FNF letter:', error);
      alert('Failed to generate FNF letter');
    }
  };

  const processPayment = async (fnfId, paymentDate) => {
    try {
      await axios.post(`/api/hrms/fnf/${fnfId}/process-payment`, { paymentDate });
      fetchFNFs();
      alert('Payment processed successfully!');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment');
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Paid': return 'success';
      case 'Approved': return 'info';
      case 'Under Review': return 'warning';
      default: return 'neutral';
    }
  };

  if (showForm) {
    return (
      <Layout>
        <div style={{ padding: 'var(--space-2xl)' }}>
          <Card style={{ padding: 'var(--space-2xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
              <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Initiate Full & Final Settlement</h1>
              <Button onClick={resetForm} variant="ghost">
                <Icons.ChevronLeft /> Back
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 'var(--space-xl)' }}>
                {/* Employee Selection */}
                <CustomSelect
                  label="Employee"
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  options={employees.map(emp => ({ value: emp._id, label: `${emp.user?.name} - ${emp.position}` }))}
                  placeholder="Select Employee"
                />

                {/* Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label htmlFor="resignationDate">Resignation Date *</label>
                    <input
                      id="resignationDate"
                      type="date"
                      name="resignationDate"
                      value={formData.resignationDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="lastWorkingDate">Last Working Date *</label>
                    <input
                      id="lastWorkingDate"
                      type="date"
                      name="lastWorkingDate"
                      value={formData.lastWorkingDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Reason */}
                <CustomSelect
                  label="Reason for Leaving"
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  options={[
                    'Personal Reasons', 'Better Opportunity', 'Health Issues', 'Termination', 'Retirement', 'Other'
                  ].map(r => ({ value: r, label: r }))}
                  placeholder="Select Reason"
                />

                {/* Notice Period */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="noticePeriodServed"
                      checked={formData.noticePeriodServed}
                      onChange={handleChange}
                    />
                    <span>Notice period served</span>
                  </label>
                </div>

                {/* Buyout Amount */}
                <div className="input-group">
                  <label htmlFor="buyoutAmount">Buyout Amount (if applicable)</label>
                  <input
                    id="buyoutAmount"
                    type="number"
                    name="buyoutAmount"
                    value={formData.buyoutAmount}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                {/* Calculate Button */}
                {formData.employeeId && formData.resignationDate && formData.lastWorkingDate && (
                  <Button type="button" onClick={calculateFNF} variant="secondary">
                    Calculate FNF Amount
                  </Button>
                )}

                {/* Calculated FNF Display */}
                {calculatedFNF && (
                  <Card style={{ padding: 'var(--space-lg)', backgroundColor: 'var(--bg-elevated)' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-md)' }}>
                      Calculated Settlement Amount
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Final Pay</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>₹{calculatedFNF.finalPayroll?.total?.toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Dues</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>₹{calculatedFNF.dues?.totalPayable?.toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Recoveries</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--danger-primary)' }}>
                          -₹{calculatedFNF.recoveries?.totalRecoverable?.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Net Amount</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
                          ₹{calculatedFNF.netAmount?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)' }}>
                <Button type="submit" variant="primary" disabled={!calculatedFNF}>
                  Initiate FNF Process
                </Button>
                <Button type="button" onClick={resetForm} variant="secondary">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
              Full & Final Settlements
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage employee exit processes and final settlements
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} variant="primary">
            Initiate FNF
          </Button>
        </div>

        {/* FNF List */}
        <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
          {fnfs.map(fnf => (
            <Card key={fnf._id} style={{ padding: 'var(--space-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-lg)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                      {fnf.employee?.user?.name}
                    </h3>
                    <Badge variant={getStatusVariant(fnf.status)}>
                      {fnf.status}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {fnf.employee?.position} • {fnf.employee?.department}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                    Resigned: {new Date(fnf.resignationDate).toLocaleDateString()} •
                    Last Day: {new Date(fnf.lastWorkingDate).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <Button
                    onClick={() => generateFNFLetter(fnf._id)}
                    variant="secondary"
                    size="sm"
                  >
                    <Icons.FileText /> Letter
                  </Button>
                  {fnf.status === 'Approved' && (
                    <Button
                      onClick={() => processPayment(fnf._id, new Date().toISOString().split('T')[0])}
                      variant="primary"
                      size="sm"
                    >
                      Process Payment
                    </Button>
                  )}
                </div>
              </div>

              {/* Settlement Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Final Salary
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                    ₹{fnf.finalPayroll?.total?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Total Dues
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                    ₹{fnf.dues?.totalPayable?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Recoveries
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--danger-primary)' }}>
                    ₹{fnf.recoveries?.totalRecoverable?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Net Payable
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
                    ₹{fnf.netAmount?.toLocaleString()}
                  </div>
                </div>
              </div>

              {fnf.paymentDate && (
                <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Payment processed on {new Date(fnf.paymentDate).toLocaleDateString()}
                  </div>
                </div>
              )}
            </Card>
          ))}

          {fnfs.length === 0 && (
            <Card style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-tertiary)' }}>
                No FNF settlements found. Initiate the first settlement above.
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FNFManagement;