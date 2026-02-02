import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import CustomSelect from '../../src/components/shared/CustomSelect';
import { Icons } from '../../src/components/shared/Icons';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    userId: '',
    department: '',
    position: '',
    hireDate: '',
    status: 'Active',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadEmployeeData();
    }
  }, [id]);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/hrms/employees/${id}`);
      const employee = response.data;
      setFormData({
        userId: employee.user?._id || '',
        department: employee.department || '',
        position: employee.position || '',
        hireDate: employee.hireDate ? employee.hireDate.split('T')[0] : '',
        status: employee.status || 'Active',
      });
    } catch (error) {
      console.error('Error loading employee:', error);
      alert('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEdit) {
        await axios.put(`/api/hrms/employees/${id}`, formData);
        alert('Employee updated successfully');
      } else {
        await axios.post('/api/hrms/employees', formData);
        alert('Employee created successfully');
      }
      navigate('/hr/employees');
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div>Loading employee data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        {/* Breadcrumbs */}
        <div style={{ marginBottom: 'var(--space-xl)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <Link
            to="/hr/employees"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}
          >
            Employee Management
          </Link>
          <Icons.ChevronRight style={{ width: '1rem', height: '1rem', color: 'var(--text-tertiary)' }} />
          <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '500' }}>
            {isEdit ? 'Edit Employee' : 'Add Employee'}
          </span>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
              {isEdit ? 'Edit Employee' : 'Add New Employee'}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {isEdit ? 'Update employee information and settings' : 'Create a new employee profile and assign organizational details'}
            </p>
          </div>
          <Button
            onClick={() => navigate('/hr/employees')}
            variant="secondary"
          >
            <Icons.ChevronLeft style={{ marginRight: 'var(--space-xs)' }} />
            Back to Employees
          </Button>
        </div>

        {/* Main Form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-2xl)' }}>
          {/* Form Content */}
          <Card style={{ padding: 'var(--space-2xl)' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 'var(--space-xl)' }}>
                {/* Basic Information */}
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-lg)', color: 'var(--text-primary)' }}>
                    Basic Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
                    <div className="input-group">
                      <label htmlFor="userId" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: 'var(--space-xs)', color: 'var(--text-primary)' }}>
                        User ID *
                      </label>
                      <input
                        id="userId"
                        type="text"
                        name="userId"
                        value={formData.userId}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          padding: 'var(--space-sm) var(--space-md)',
                          border: '1px solid var(--border-default)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.875rem',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)'
                        }}
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="hireDate" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: 'var(--space-xs)', color: 'var(--text-primary)' }}>
                        Hire Date *
                      </label>
                      <input
                        id="hireDate"
                        type="date"
                        name="hireDate"
                        value={formData.hireDate}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          padding: 'var(--space-sm) var(--space-md)',
                          border: '1px solid var(--border-default)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.875rem',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)'
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Organizational Details */}
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-lg)', color: 'var(--text-primary)' }}>
                    Organizational Details
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
                    <CustomSelect
                      label="Department"
                      value={formData.department}
                      onChange={handleChange}
                      name="department"
                      options={[
                        'Sales', 'HR', 'Administration', 'Accounts', 'IT', 'Operations'
                      ].map(dept => ({ value: dept, label: dept }))}
                      placeholder="Select Department"
                      required
                    />
                    <div className="input-group">
                      <label htmlFor="position" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: 'var(--space-xs)', color: 'var(--text-primary)' }}>
                        Position *
                      </label>
                      <input
                        id="position"
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          padding: 'var(--space-sm) var(--space-md)',
                          border: '1px solid var(--border-default)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.875rem',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)'
                        }}
                        required
                      />
                    </div>
                    <CustomSelect
                      label="Level"
                      value={formData.level || ''}
                      onChange={handleChange}
                      name="level"
                      options={[
                        'Intern', 'Executive', 'Senior Executive', 'Team Lead', 'Manager', 'Senior Manager', 'Director', 'VP', 'CEO'
                      ].map(level => ({ value: level, label: level }))}
                      placeholder="Select Level"
                    />
                    <CustomSelect
                      label="Status"
                      value={formData.status}
                      onChange={handleChange}
                      name="status"
                      options={[
                        { value: 'Active', label: 'Active' },
                        { value: 'Inactive', label: 'Inactive' },
                        { value: 'PIP', label: 'PIP' },
                        { value: 'Resigned', label: 'Resigned' }
                      ]}
                      placeholder="Select Status"
                      required
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div style={{ display: 'flex', gap: 'var(--space-md)', paddingTop: 'var(--space-xl)', borderTop: '1px solid var(--border-subtle)' }}>
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Saving...' : (isEdit ? 'Update Employee' : 'Create Employee')}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => navigate('/hr/employees')}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {/* Sidebar */}
          <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
            {/* Quick Actions */}
            <Card style={{ padding: 'var(--space-lg)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 'var(--space-md)', color: 'var(--text-primary)' }}>
                Quick Actions
              </h4>
              <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                <Button
                  onClick={() => navigate('/hr/employees')}
                  variant="ghost"
                  style={{ justifyContent: 'flex-start' }}
                >
                  <Icons.Users style={{ marginRight: 'var(--space-sm)' }} />
                  View All Employees
                </Button>
                <Button
                  onClick={() => navigate('/hr/recruitment')}
                  variant="ghost"
                  style={{ justifyContent: 'flex-start' }}
                >
                  <Icons.Target style={{ marginRight: 'var(--space-sm)' }} />
                  Recruitment Pipeline
                </Button>
                <Button
                  onClick={() => navigate('/hr/payroll')}
                  variant="ghost"
                  style={{ justifyContent: 'flex-start' }}
                >
                  <Icons.DollarSign style={{ marginRight: 'var(--space-sm)' }} />
                  Payroll Management
                </Button>
              </div>
            </Card>

            {/* Employee Stats */}
            {isEdit && (
              <Card style={{ padding: 'var(--space-lg)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 'var(--space-md)', color: 'var(--text-primary)' }}>
                  Employee Overview
                </h4>
                <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Status</span>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: formData.status === 'Active' ? 'var(--success-primary)' :
                             formData.status === 'Inactive' ? 'var(--text-tertiary)' :
                             formData.status === 'PIP' ? 'var(--warning-primary)' : 'var(--danger-primary)'
                    }}>
                      {formData.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Department</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{formData.department || 'Not set'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Level</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{formData.level || 'Not set'}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Help */}
            <Card style={{ padding: 'var(--space-lg)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 'var(--space-md)', color: 'var(--text-primary)' }}>
                Need Help?
              </h4>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                <p style={{ marginBottom: 'var(--space-sm)' }}>
                  All fields marked with * are required.
                </p>
                <p style={{ marginBottom: 'var(--space-sm)' }}>
                  Employee ID is auto-generated and cannot be changed.
                </p>
                <p>
                  Status changes affect employee visibility and access.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeForm;
