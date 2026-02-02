import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import Badge from '../../src/components/shared/Badge';
import CustomSelect from '../../src/components/shared/CustomSelect';
import { Icons } from '../../src/components/shared/Icons';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'list'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    level: '',
    reportsTo: '',
    isNew: true,
    isIntern: false,
    joiningDate: '',
    salary: 0
  });
  const [onboardingChecklist, setOnboardingChecklist] = useState({
    loiSent: { completed: false, attachment: null, attachmentName: '' },
    alSent: { completed: false, attachment: null, attachmentName: '' },
    olSent: { completed: false, attachment: null, attachmentName: '' },
    emailCreated: { completed: false, attachment: null, attachmentName: '' },
    assetsAllocated: { completed: false, attachment: null, attachmentName: '' },
    documentsSubmitted: { completed: false, attachment: null, attachmentName: '' }
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const departments = ['Sales', 'Marketing', 'HR', 'Administration', 'Accounts', 'IT', 'Operations'];
  const levels = ['Intern', 'Executive', 'Senior Executive', 'Team Lead', 'Manager', 'Senior Manager', 'Director', 'VP', 'CEO'];

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
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/hrms/employees', formData);
      if (formData.isNew) {
        // Start onboarding flow
        setSelectedEmployee(response.data);
        setShowAddForm(false);
      } else {
        fetchEmployees();
        resetForm();
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      const data = error.response?.data;
      let message = data?.message || 'Failed to create employee';

      if (data?.errors) {
        const details = Object.entries(data.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('\n');
        message += `\n\nDetails:\n${details}`;
      }

      alert(message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      level: '',
      reportsTo: '',
      isNew: true,
      isIntern: false,
      joiningDate: '',
      salary: 0
    });
    setShowAddForm(false);
  };

  const handleOnboardingChecklistUpdate = async (field) => {
    const updated = {
      ...onboardingChecklist,
      [field]: {
        ...onboardingChecklist[field],
        completed: !onboardingChecklist[field].completed
      }
    };
    setOnboardingChecklist(updated);

    try {
      await axios.put(`/api/hrms/employees/${selectedEmployee._id}/onboarding`, updated);
    } catch (error) {
      console.error('Error updating onboarding checklist:', error);
    }
  };

  const handleOnboardingFileUpload = async (field, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('employeeId', selectedEmployee._id);
    formData.append('taskField', field);

    try {
      const response = await axios.post('/api/hrms/employees/onboarding/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updated = {
        ...onboardingChecklist,
        [field]: {
          ...onboardingChecklist[field],
          attachment: response.data.filePath,
          attachmentName: file.name
        }
      };
      setOnboardingChecklist(updated);
      await axios.put(`/api/hrms/employees/${selectedEmployee._id}/onboarding`, updated);
      alert('Attachment uploaded successfully!');
    } catch (error) {
      console.error('Error uploading onboarding file:', error);
      alert('Failed to upload attachment');
    }
  };

  const completeOnboarding = async () => {
    try {
      await axios.put(`/api/hrms/employees/${selectedEmployee._id}/complete-onboarding`);
      alert('Onboarding completed successfully!');
      setSelectedEmployee(null);
      setOnboardingChecklist({
        loiSent: false,
        alSent: false,
        olSent: false,
        emailCreated: false,
        assetsAllocated: false,
        documentsSubmitted: false
      });
      fetchEmployees();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const buildEmployeeTree = (employees, parentId = null) => {
    return employees
      .filter(emp => emp.reportsTo === parentId)
      .map(emp => ({
        ...emp,
        children: buildEmployeeTree(employees, emp._id)
      }));
  };

  const renderEmployeeTree = (employees, level = 0) => {
    return employees.map(emp => (
      <div key={emp._id} style={{ marginLeft: `${level * 2}rem` }}>
        <Card
          style={{
            marginBottom: 'var(--space-sm)',
            padding: 'var(--space-md)',
            backgroundColor: level === 0 ? 'var(--accent-primary-subtle)' : 'var(--bg-surface)'
          }}
          hover
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'white'
              }}>
                {emp.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: '600' }}>
                  {emp.user?.name}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {emp.employeeId} • {emp.position} • {emp.department}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
              <Badge variant={emp.level === 'Intern' ? 'warning' : emp.level.includes('Manager') ? 'primary' : 'neutral'}>
                {emp.level}
              </Badge>
              {emp.isNew && (
                <Badge variant="info">New</Badge>
              )}
            </div>
          </div>
        </Card>
        {emp.children && emp.children.length > 0 && renderEmployeeTree(emp.children, level + 1)}
      </div>
    ));
  };

  const employeeTree = buildEmployeeTree(employees);

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
              Employee Management
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage organizational hierarchy and employee onboarding
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <Button
              onClick={() => setViewMode(viewMode === 'tree' ? 'list' : 'tree')}
              variant="secondary"
            >
              {viewMode === 'tree' ? 'List View' : 'Tree View'}
            </Button>
            <Button onClick={() => setShowAddForm(true)} variant="primary">
              Add Employee
            </Button>
          </div>
        </div>

        {/* Add Employee Form */}
        {showAddForm && (
          <Card style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-2xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Add New Employee</h2>
              <Button onClick={resetForm} variant="ghost">
                <Icons.ChevronLeft /> Back
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
                {/* Employee Status */}
                <div style={{
                  padding: 'var(--space-lg)',
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-md)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <input
                      id="isNew"
                      type="checkbox"
                      name="isNew"
                      checked={formData.isNew}
                      onChange={handleChange}
                    />
                    <label htmlFor="isNew" style={{ margin: 0, cursor: 'pointer', fontWeight: '600' }}>
                      New Employee (Start Onboarding)
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <input
                      id="isIntern"
                      type="checkbox"
                      name="isIntern"
                      checked={formData.isIntern}
                      onChange={handleChange}
                    />
                    <label htmlFor="isIntern" style={{ margin: 0, cursor: 'pointer', fontWeight: '600' }}>
                      Intern Level
                    </label>
                  </div>
                </div>

                {/* Basic Info */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Department & Level */}
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
                  />
                  <CustomSelect
                    label="Level"
                    value={formData.level}
                    onChange={handleChange}
                    name="level"
                    options={[
                      'Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director'
                    ].map(l => ({ value: l, label: l }))}
                    placeholder="Select Level"
                  />
                  <div className="input-group">
                    <label htmlFor="position">Position/Title *</label>
                    <input
                      id="position"
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Sales Executive"
                    />
                  </div>
                </div>

                {/* Reports To */}
                <div className="input-group">
                  <CustomSelect
                    label="Reports To"
                    value={formData.reportsTo}
                    onChange={handleChange}
                    name="reportsTo"
                    options={[
                      { value: '', label: 'Top Level (No Manager)' },
                      ...employees.map(emp => ({ value: emp._id, label: `${emp.user?.name} - ${emp.position}` }))
                    ]}
                    placeholder="Select Manager"
                  />
                </div>

                {/* Joining Date & Salary */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label htmlFor="joiningDate">Joining Date</label>
                    <input
                      id="joiningDate"
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="salary">Basic Salary</label>
                    <input
                      id="salary"
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)' }}>
                <Button type="submit" variant="primary">
                  {formData.isNew ? 'Create & Start Onboarding' : 'Add Employee'}
                </Button>
                <Button type="button" onClick={resetForm} variant="secondary">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Onboarding Checklist Modal */}
        {selectedEmployee && (
          <Card style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-2xl)', backgroundColor: 'var(--accent-primary-subtle)', border: '2px solid var(--accent-primary)' }}>
            <div style={{ marginBottom: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
                Onboarding: {selectedEmployee.user?.name}
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Complete all checklist items to finish onboarding
              </p>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
              {[
                { id: 'loiSent', label: 'LOI (Letter of Intent) Sent', desc: 'Send and attach LOI document' },
                { id: 'alSent', label: 'AL (Appointment Letter) Sent', desc: 'Send and attach appointment letter' },
                { id: 'olSent', label: 'OL (Offer Letter) Sent', desc: 'Send and attach offer letter' },
                { id: 'emailCreated', label: 'Company Email Created', desc: 'Create email ID and set password' },
                { id: 'assetsAllocated', label: 'Assets Allocated', desc: 'Laptop, SIM, ID card, etc.' },
                { id: 'documentsSubmitted', label: 'Documents Submitted', desc: 'Aadhar, PAN, certificates, etc.' },
              ].map(item => (
                <div
                  key={item.id}
                  style={{
                    padding: 'var(--space-lg)',
                    backgroundColor: onboardingChecklist[item.id].completed ? 'var(--bg-surface)' : 'var(--bg-elevated)',
                    border: `2px solid ${onboardingChecklist[item.id].completed ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)'
                  }}
                >
                  <div
                    onClick={() => handleOnboardingChecklistUpdate(item.id)}
                    style={{
                      width: '1.5rem',
                      height: '1.5rem',
                      borderRadius: '50%',
                      backgroundColor: onboardingChecklist[item.id].completed ? 'var(--accent-primary)' : 'transparent',
                      border: `2px solid ${onboardingChecklist[item.id].completed ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    {onboardingChecklist[item.id].completed && '✓'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600' }}>{item.label}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                      {item.desc}
                      {onboardingChecklist[item.id].attachmentName && (
                        <span style={{ marginLeft: 'var(--space-sm)', color: 'var(--accent-primary)', fontWeight: '600' }}>
                          (📎 {onboardingChecklist[item.id].attachmentName})
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <input
                      type="file"
                      id={`file-${item.id}`}
                      style={{ display: 'none' }}
                      onChange={(e) => handleOnboardingFileUpload(item.id, e.target.files[0])}
                    />
                    <Button
                      onClick={() => document.getElementById(`file-${item.id}`).click()}
                      variant="ghost"
                      size="sm"
                    >
                      <Icons.FileUp style={{ marginRight: 'var(--space-xs)' }} />
                      {onboardingChecklist[item.id].attachment ? 'Change' : 'Attach'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)' }}>
              <Button
                onClick={completeOnboarding}
                variant="primary"
                disabled={!Object.values(onboardingChecklist).every(v => v)}
              >
                Complete Onboarding
              </Button>
              <Button onClick={() => setSelectedEmployee(null)} variant="secondary">
                Save & Close
              </Button>
            </div>
          </Card>
        )}

        {/* Employee Tree/List */}
        {!showAddForm && !selectedEmployee && (
          <Card style={{ padding: 'var(--space-2xl)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: 'var(--space-xl)' }}>
              {viewMode === 'tree' ? 'Organization Hierarchy' : 'Employee List'}
            </h2>
            {viewMode === 'tree' ? (
              <div>
                {employeeTree.length > 0 ? renderEmployeeTree(employeeTree) : (
                  <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-tertiary)' }}>
                    No employees yet. Add your first employee above.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                {employees.map(emp => (
                  <Card key={emp._id} style={{ padding: 'var(--space-lg)' }} hover>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '50%',
                          background: 'var(--accent-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.125rem',
                          fontWeight: '600',
                          color: 'white'
                        }}>
                          {emp.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9375rem', fontWeight: '600' }}>
                            {emp.user?.name}
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                            {emp.employeeId} • {emp.position} • {emp.department}
                          </div>
                        </div>
                      </div>
                      <Badge variant={emp.level === 'Intern' ? 'warning' : emp.level.includes('Manager') ? 'primary' : 'neutral'}>
                        {emp.level}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default EmployeeList;
