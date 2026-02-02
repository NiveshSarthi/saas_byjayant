import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import Badge from '../../src/components/shared/Badge';
import { Icons } from '../../src/components/shared/Icons';

const Gatepass = () => {
  const [gatepasses, setGatepasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    reason: '',
    destination: '',
    expectedReturnTime: '',
    items: '',
  });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchGatepasses();
    fetchEmployees();
  }, []);

  const fetchGatepasses = async () => {
    try {
      // Mock data since gatepass API might not exist yet
      setGatepasses([
        {
          _id: '1',
          employee: { employeeId: 'EMP20240001', user: { name: 'John Doe' } },
          reason: 'Client Meeting',
          destination: 'Client Office',
          status: 'approved',
          createdAt: new Date().toISOString(),
          expectedReturnTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error fetching gatepasses:', error);
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Mock submission since gatepass API might not exist yet
      console.log('Gatepass request:', formData);
      setFormData({
        employeeId: '',
        reason: '',
        destination: '',
        expectedReturnTime: '',
        items: '',
      });
      setShowForm(false);
      alert('Gatepass request submitted successfully!');
    } catch (error) {
      console.error('Error submitting gatepass:', error);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'neutral';
    }
  };

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
              Gate Pass Management
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage employee gate pass requests and approvals
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} variant="primary">
            Request Gate Pass
          </Button>
        </div>

        {/* Request Form */}
        {showForm && (
          <Card style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>New Gate Pass Request</h3>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: '500' }}>
                    Employee ID *
                  </label>
                  <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: 'var(--space-sm)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp.employeeId}>
                        {emp.employeeId} - {emp.user?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: '500' }}>
                    Reason *
                  </label>
                  <input
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Client meeting, Personal work"
                    style={{ width: '100%', padding: 'var(--space-sm)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: '500' }}>
                    Destination *
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    required
                    placeholder="Where are you going?"
                    style={{ width: '100%', padding: 'var(--space-sm)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: '500' }}>
                      Expected Return Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="expectedReturnTime"
                      value={formData.expectedReturnTime}
                      onChange={handleChange}
                      required
                      style={{ width: '100%', padding: 'var(--space-sm)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: '500' }}>
                      Items Carrying
                    </label>
                    <input
                      type="text"
                      name="items"
                      value={formData.items}
                      onChange={handleChange}
                      placeholder="e.g., Laptop, Documents"
                      style={{ width: '100%', padding: 'var(--space-sm)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 'var(--space-lg)' }}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Submit Request
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        )}

        {/* Gatepass List */}
        <Card style={{ padding: 'var(--space-xl)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-lg)' }}>
            Recent Gate Pass Requests
          </h3>

          {gatepasses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-secondary)' }}>
              No gate pass requests found
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
              {gatepasses.map((gatepass) => (
                <Card key={gatepass._id} style={{ padding: 'var(--space-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                          {gatepass.employee?.user?.name}
                        </h4>
                        <Badge variant={getStatusVariant(gatepass.status)}>
                          {gatepass.status}
                        </Badge>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)' }}>
                        Employee ID: {gatepass.employee?.employeeId}
                      </p>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)' }}>
                        Reason: {gatepass.reason}
                      </p>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)' }}>
                        Destination: {gatepass.destination}
                      </p>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        Expected Return: {new Date(gatepass.expectedReturnTime).toLocaleString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {gatepass.status === 'pending' && (
                        <>
                          <Button variant="success" size="sm">
                            Approve
                          </Button>
                          <Button variant="error" size="sm">
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Gatepass;