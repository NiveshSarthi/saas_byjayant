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
    level: '',
    hireDate: '',
    status: 'Active',
    monthlyCtc: '',
    payrollConfig: {
      basicPercent: 50,
      pfCapped: true,
      professionalTaxMode: 'Slab'
    }
  });
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [tempConfig, setTempConfig] = useState({
    basicPercent: 50,
    pfCapped: true,
    professionalTaxMode: 'Slab'
  });

  useEffect(() => {
    if (isEdit) {
      loadEmployeeData();
    }
    fetchFieldConfigs();
  }, [id]);

  const fetchFieldConfigs = async () => {
    try {
      const [deptResponse, levelResponse] = await Promise.all([
        axios.get('/api/administration/field-config/departments'),
        axios.get('/api/administration/field-config/levels')
      ]);

      setDepartments(deptResponse.data.values || []);
      setLevels(levelResponse.data.values || []);
    } catch (error) {
      console.error('Error fetching field configs:', error);
      // Fallback to default values if API fails
      setDepartments(['Sales', 'HR', 'Administration', 'Accounts', 'IT', 'Operations']);
      setLevels(['Intern', 'Executive', 'Senior Executive', 'Team Lead', 'Manager', 'Senior Manager', 'Director', 'VP', 'CEO']);
    }
  };

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
        monthlyCtc: employee.monthlyCtc || '',
        payrollConfig: employee.payrollConfig || { basicPercent: 50, pfCapped: true, professionalTaxMode: 'Slab' }
      });
      if (employee.payrollConfig) setTempConfig(employee.payrollConfig);
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
                    <div className="input-group">
                      <label htmlFor="monthlyCtc" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: 'var(--space-xs)', color: 'var(--text-primary)' }}>
                        Monthly CTC *
                      </label>
                      <input
                        id="monthlyCtc"
                        type="number"
                        name="monthlyCtc"
                        value={formData.monthlyCtc || ''}
                        onChange={handleChange}
                        placeholder="e.g. 35000"
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

                {/* Payroll Configuration Button */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-xs)', color: 'var(--text-primary)' }}>
                        Payroll Configuration
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Configure salary structure rules.
                      </p>
                    </div>
                    <Button type="button" onClick={() => setShowPayrollModal(true)} variant="secondary">
                      <Icons.Settings style={{ marginRight: '8px' }} />
                      {formData.payrollConfig ? 'Edit Configuration' : 'Add Configuration'}
                    </Button>
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
                      options={departments.map(dept => ({ value: dept, label: dept }))}
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
                      options={levels.map(level => ({ value: level, label: level }))}
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

          {/* Payroll Config Modal */}
          {showPayrollModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}>
              <Card style={{ padding: 'var(--space-xl)', width: '500px', maxWidth: '90%' }}>
                <h3 style={{ marginBottom: 'var(--space-lg)', fontSize: '1.25rem', fontWeight: 'bold' }}>Payroll Configuration</h3>

                <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '5px' }}>Basic Salary % of Gross</label>
                    <input
                      type="number"
                      value={tempConfig.basicPercent}
                      onChange={(e) => setTempConfig({ ...tempConfig, basicPercent: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={tempConfig.pfCapped}
                      onChange={(e) => setTempConfig({ ...tempConfig, pfCapped: e.target.checked })}
                      id="pfCap"
                    />
                    <label htmlFor="pfCap">Cap PF at ₹1800 (Employer Share)</label>
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '5px' }}>Professional Tax Mode</label>
                    <select
                      value={tempConfig.professionalTaxMode}
                      onChange={(e) => setTempConfig({ ...tempConfig, professionalTaxMode: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                      <option value="Slab">Slab Based (State Rules)</option>
                      <option value="Fixed">Fixed Amount</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: 'var(--space-xl)' }}>
                  <Button variant="secondary" onClick={() => setShowPayrollModal(false)}>Cancel</Button>
                  <Button variant="primary" onClick={() => {
                    setFormData({ ...formData, payrollConfig: tempConfig });
                    setShowPayrollModal(false);
                  }}>Save Configuration</Button>
                </div>
              </Card>
            </div>
          )}

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
