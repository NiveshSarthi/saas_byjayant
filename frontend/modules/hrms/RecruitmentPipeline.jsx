import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import Badge from '../../src/components/shared/Badge';
import CustomSelect from '../../src/components/shared/CustomSelect';
import StatCard from '../../src/components/shared/StatCard';
import { Icons } from '../../src/components/shared/Icons';

const RecruitmentPipeline = () => {
  const [targets, setTargets] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(null);
  const [formData, setFormData] = useState({
    position: '',
    department: '',
    level: '',
    numberOfPositions: 1,
    targetDate: '',
    description: '',
    requirements: ''
  });
  const [emailData, setEmailData] = useState({
    candidateName: '',
    candidateEmail: '',
    sendLOI: false,
    sendAL: false,
    sendOL: false,
    joiningDate: '',
    salary: 0
  });
  const [stats, setStats] = useState({
    open: 0,
    closed: 0,
    total: 0
  });

  const departments = ['Sales', 'Marketing', 'HR', 'Administration', 'Accounts', 'IT', 'Operations'];
  const levels = ['Intern', 'Executive', 'Senior Executive', 'Team Lead', 'Manager', 'Senior Manager', 'Director'];

  useEffect(() => {
    fetchTargets();
    fetchStats();
  }, []);

  const fetchTargets = async () => {
    try {
      const response = await axios.get('/api/hrms/recruitment');
      setTargets(response.data);
    } catch (error) {
      console.error('Error fetching targets:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/hrms/recruitment/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleEmailChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailData({ ...emailData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/hrms/recruitment', formData);
      fetchTargets();
      fetchStats();
      resetForm();
      alert('Recruitment target created successfully!');
    } catch (error) {
      console.error('Error creating target:', error);
      alert('Failed to create recruitment target');
    }
  };

  const resetForm = () => {
    setFormData({
      position: '',
      department: '',
      level: '',
      numberOfPositions: 1,
      targetDate: '',
      description: '',
      requirements: ''
    });
    setShowAddForm(false);
  };

  const handleCloseRequirement = async () => {
    if (!emailData.candidateName || !emailData.candidateEmail) {
      alert('Please enter candidate name and email');
      return;
    }

    try {
      // Send emails and close requirement
      await axios.post(`/api/hrms/recruitment/${showCloseModal._id}/close`, emailData);

      // Create employee record
      await axios.post('/api/hrms/employees', {
        name: emailData.candidateName,
        email: emailData.candidateEmail,
        position: showCloseModal.position,
        department: showCloseModal.department,
        level: showCloseModal.level,
        joiningDate: emailData.joiningDate,
        salary: emailData.salary,
        isNew: true
      });

      fetchTargets();
      fetchStats();
      setShowCloseModal(null);
      setEmailData({
        candidateName: '',
        candidateEmail: '',
        sendLOI: false,
        sendAL: false,
        sendOL: false,
        joiningDate: '',
        salary: 0
      });
      alert('Requirement closed! Candidate added to employees and emails sent.');
    } catch (error) {
      console.error('Error closing requirement:', error);
      alert('Failed to close requirement');
    }
  };

  const deleteTarget = async (id) => {
    if (window.confirm('Are you sure you want to delete this recruitment target?')) {
      try {
        await axios.delete(`/api/hrms/recruitment/${id}`);
        fetchTargets();
        fetchStats();
      } catch (error) {
        console.error('Error deleting target:', error);
      }
    }
  };

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
              Recruitment Pipeline
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Set recruitment targets and manage hiring process
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)} variant="primary">
            Add Recruitment Target
          </Button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
          <StatCard
            icon="📋"
            label="Open Positions"
            value={stats.open}
            trend="neutral"
          />
          <StatCard
            icon="✅"
            label="Closed Positions"
            value={stats.closed}
            trend="positive"
          />
          <StatCard
            icon="📊"
            label="Total Targets"
            value={stats.total}
            trend="neutral"
          />
        </div>

        {/* Add Target Form */}
        {showAddForm && (
          <Card style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-2xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Add Recruitment Target</h2>
              <Button onClick={resetForm} variant="ghost">
                <Icons.ChevronLeft /> Back
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label htmlFor="position">Position Title *</label>
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
                  <CustomSelect
                    label="Department"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    options={departments.map(dept => ({ value: dept, label: dept }))}
                    placeholder="Select Department"
                  />
                  <CustomSelect
                    label="Level"
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    options={levels.map(level => ({ value: level, label: level }))}
                    placeholder="Select Level"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label htmlFor="numberOfPositions">Number of Positions *</label>
                    <input
                      id="numberOfPositions"
                      type="number"
                      name="numberOfPositions"
                      value={formData.numberOfPositions}
                      onChange={handleChange}
                      required
                      min="1"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="targetDate">Target Closure Date</label>
                    <input
                      id="targetDate"
                      type="date"
                      name="targetDate"
                      value={formData.targetDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="description">Job Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe the role, responsibilities, and expectations..."
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="requirements">Requirements</label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows="4"
                    placeholder="List required skills, experience, qualifications..."
                  />
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)' }}>
                <Button type="submit" variant="primary">
                  Create Target
                </Button>
                <Button type="button" onClick={resetForm} variant="secondary">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Close Requirement Modal */}
        {showCloseModal && (
          <Card style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-2xl)', backgroundColor: 'var(--accent-primary-subtle)', border: '2px solid var(--accent-primary)' }}>
            <div style={{ marginBottom: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
                Close Requirement: {showCloseModal.position}
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Enter candidate details and select documents to send via email
              </p>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
              {/* Candidate Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="input-group">
                  <label htmlFor="candidateName">Candidate Name *</label>
                  <input
                    id="candidateName"
                    type="text"
                    name="candidateName"
                    value={emailData.candidateName}
                    onChange={handleEmailChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="candidateEmail">Candidate Email *</label>
                  <input
                    id="candidateEmail"
                    type="email"
                    name="candidateEmail"
                    value={emailData.candidateEmail}
                    onChange={handleEmailChange}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="input-group">
                  <label htmlFor="joiningDate">Joining Date</label>
                  <input
                    id="joiningDate"
                    type="date"
                    name="joiningDate"
                    value={emailData.joiningDate}
                    onChange={handleEmailChange}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="salary">Offered Salary</label>
                  <input
                    id="salary"
                    type="number"
                    name="salary"
                    value={emailData.salary}
                    onChange={handleEmailChange}
                  />
                </div>
              </div>

              {/* Document Checklist */}
              <div style={{
                padding: 'var(--space-lg)',
                backgroundColor: 'white',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 'var(--space-md)' }}>
                  Documents to Send via Email
                </div>
                <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <input
                      id="sendLOI"
                      type="checkbox"
                      name="sendLOI"
                      checked={emailData.sendLOI}
                      onChange={handleEmailChange}
                    />
                    <label htmlFor="sendLOI" style={{ margin: 0, cursor: 'pointer' }}>
                      <div style={{ fontWeight: '600' }}>LOI (Letter of Intent)</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Send letter of intent to candidate</div>
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <input
                      id="sendAL"
                      type="checkbox"
                      name="sendAL"
                      checked={emailData.sendAL}
                      onChange={handleEmailChange}
                    />
                    <label htmlFor="sendAL" style={{ margin: 0, cursor: 'pointer' }}>
                      <div style={{ fontWeight: '600' }}>AL (Appointment Letter)</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Send appointment letter to candidate</div>
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <input
                      id="sendOL"
                      type="checkbox"
                      name="sendOL"
                      checked={emailData.sendOL}
                      onChange={handleEmailChange}
                    />
                    <label htmlFor="sendOL" style={{ margin: 0, cursor: 'pointer' }}>
                      <div style={{ fontWeight: '600' }}>OL (Offer Letter)</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Send offer letter to candidate</div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)' }}>
              <Button onClick={handleCloseRequirement} variant="primary">
                Send Emails & Close Requirement
              </Button>
              <Button onClick={() => setShowCloseModal(null)} variant="secondary">
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Recruitment Targets */}
        {!showAddForm && !showCloseModal && (
          <div>
            <Card style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-lg)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-md)' }}>
                Open Positions
              </h2>
            </Card>

            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
              {targets.filter(t => t.status === 'open').map(target => (
                <Card key={target._id} style={{ padding: 'var(--space-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-md)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                        <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                          {target.position}
                        </div>
                        <Badge variant="warning">Open</Badge>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                        {target.department} • {target.level} • {target.numberOfPositions} position(s)
                      </div>
                      {target.targetDate && (
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                          Target Date: {new Date(target.targetDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {target.description && (
                    <div style={{ marginBottom: 'var(--space-md)', padding: 'var(--space-md)', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: 'var(--space-xs)' }}>Description:</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{target.description}</div>
                    </div>
                  )}

                  {target.requirements && (
                    <div style={{ marginBottom: 'var(--space-md)', padding: 'var(--space-md)', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: 'var(--space-xs)' }}>Requirements:</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{target.requirements}</div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <Button onClick={() => setShowCloseModal(target)} variant="primary">
                      Close Requirement
                    </Button>
                    <Button onClick={() => deleteTarget(target._id)} variant="ghost">
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}

              {targets.filter(t => t.status === 'open').length === 0 && (
                <Card style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-tertiary)' }}>
                    No open recruitment targets. Add a new target above.
                  </div>
                </Card>
              )}
            </div>

            {/* Closed Positions */}
            {targets.filter(t => t.status === 'closed').length > 0 && (
              <div style={{ marginTop: 'var(--space-2xl)' }}>
                <Card style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-lg)' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-md)' }}>
                    Closed Positions
                  </h2>
                </Card>

                <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                  {targets.filter(t => t.status === 'closed').map(target => (
                    <Card key={target._id} style={{ padding: 'var(--space-lg)', opacity: 0.7 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xs)' }}>
                            <div style={{ fontSize: '1rem', fontWeight: '600' }}>
                              {target.position}
                            </div>
                            <Badge variant="success">Closed</Badge>
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {target.department} • {target.level}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                          Closed: {new Date(target.closedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RecruitmentPipeline;
