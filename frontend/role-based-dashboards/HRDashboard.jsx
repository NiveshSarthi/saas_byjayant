import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../src/components/shared/Layout';
import Card from '../src/components/shared/Card';
import Button from '../src/components/shared/Button';
import StatCard from '../src/components/shared/StatCard';
import Badge from '../src/components/shared/Badge';
import AttendanceReport from '../modules/attendance/AttendanceReport';

const HRDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [recruitmentPipeline, setRecruitmentPipeline] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    assignedTo: '',
    dueDate: '',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch employees for stats and recent employees
      const employeesResponse = await axios.get('/api/hrms/employees');
      const employees = employeesResponse.data;

      // Calculate stats
      const totalEmployees = employees.length;
      const activeEmployees = employees.filter(emp => emp.status === 'Active').length;
      const newEmployeesThisMonth = employees.filter(emp => {
        const joinDate = new Date(emp.hireDate);
        const now = new Date();
        return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
      }).length;

      // Fetch attendance data for average attendance
      const attendanceResponse = await axios.get('/api/attendance');
      const attendances = attendanceResponse.data;

      // Calculate average attendance for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentAttendances = attendances.filter(att => new Date(att.date) >= thirtyDaysAgo);
      const totalWorkingDays = employees.length * 30; // Simplified calculation
      const attendancePercentage = totalWorkingDays > 0 ? ((recentAttendances.length / totalWorkingDays) * 100).toFixed(1) : 0;

      // Calculate payroll (simplified - sum of all salaries)
      const totalPayroll = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);

      setStats([
        {
          icon: '👥',
          label: 'Total Employees',
          value: totalEmployees.toString(),
          trend: newEmployeesThisMonth > 0 ? 5 : 0,
          change: newEmployeesThisMonth > 0 ? `+${newEmployeesThisMonth} this month` : 'No new hires'
        },
        {
          icon: '📝',
          label: 'Active Employees',
          value: activeEmployees.toString(),
          trend: activeEmployees > totalEmployees * 0.8 ? 2 : -5,
          change: `${((activeEmployees / totalEmployees) * 100).toFixed(1)}% active rate`
        },
        {
          icon: '⏰',
          label: 'Avg. Attendance',
          value: `${attendancePercentage}%`,
          trend: attendancePercentage > 90 ? 2 : -10,
          change: 'Last 30 days'
        },
        {
          icon: '💰',
          label: 'Monthly Payroll',
          value: `${(totalPayroll / 1000).toFixed(0)}K`,
          trend: 3,
          change: 'Current month'
        }
      ]);

      // Get recent employees (last 4 joined)
      const sortedEmployees = employees
        .sort((a, b) => new Date(b.hireDate) - new Date(a.hireDate))
        .slice(0, 4);

      setRecentEmployees(sortedEmployees.map(emp => ({
        id: emp._id,
        name: emp.user?.name || 'Unknown',
        role: emp.position,
        department: emp.department,
        status: emp.status.toLowerCase(),
        joinDate: new Date(emp.hireDate).toISOString().split('T')[0],
        employeeId: emp.employeeId
      })));

      // Mock recruitment pipeline data (would need actual recruitment data)
      setRecruitmentPipeline([
        { stage: 'Applied', count: 45, color: '#6B7280' },
        { stage: 'Screening', count: 23, color: '#3B82F6' },
        { stage: 'Interview', count: 12, color: '#F97316' },
        { stage: 'Offer', count: 5, color: '#22C55E' },
      ]);

      // Fetch actual tasks
      try {
        const tasksResponse = await axios.get('/api/administration/tasks');
        const tasks = tasksResponse.data.slice(0, 4); // Show only first 4 tasks

        setUpcomingTasks(tasks.map(task => ({
          id: task._id,
          title: task.title,
          due: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date',
          priority: task.priority || 'medium',
          status: task.status
        })));
      } catch (error) {
        console.error('Error fetching tasks:', error);
        // Fallback to mock data if tasks API fails
        setUpcomingTasks([
          { id: 1, title: 'Review Q1 Performance', due: 'Today', priority: 'high' },
          { id: 2, title: 'Schedule Team Building Event', due: 'Tomorrow', priority: 'medium' },
          { id: 3, title: 'Update Employee Handbook', due: 'This Week', priority: 'low' },
          { id: 4, title: 'Process Payroll', due: 'Jan 31', priority: 'high' },
        ]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/administration/tasks', taskFormData);
      setTaskFormData({
        title: '',
        description: '',
        frequency: 'daily',
        assignedTo: '',
        dueDate: '',
      });
      setShowTaskModal(false);
      // Refresh tasks if needed
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  const handleTaskChange = (e) => {
    setTaskFormData({ ...taskFormData, [e.target.name]: e.target.value });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'neutral';
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <h1 style={{ marginBottom: 'var(--space-sm)' }}>HR Management</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Manage employees, recruitment, and HR operations
        </p>
      </div>

      {/* Stats */}
      <div className="grid-4 stagger-children" style={{ marginBottom: 'var(--space-2xl)' }}>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-xl)',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: 'var(--space-sm)'
      }}>
        {[
          { key: 'overview', label: 'Overview', route: null },
          { key: 'employees', label: 'Employees', route: '/hr/employees' },
          { key: 'recruitment', label: 'Recruitment', route: '/hr/recruitment' },
          { key: 'resignations', label: 'Resignations', route: '/hr/resignations' },
          { key: 'attendance', label: 'Attendance', route: '/hr/attendance/report' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              if (tab.route) {
                navigate(tab.route);
              } else {
                setSelectedTab(tab.key);
              }
            }}
            style={{
              padding: 'var(--space-sm) var(--space-md)',
              background: 'none',
              border: 'none',
              borderBottom: selectedTab === tab.key ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: selectedTab === tab.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: selectedTab === tab.key ? '600' : '500',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              textTransform: 'capitalize'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      {selectedTab === 'overview' && (
        <>
          {/* Stats */}
          <div className="grid-4 stagger-children" style={{ marginBottom: 'var(--space-2xl)' }}>
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid-2" style={{ gap: 'var(--space-xl)', alignItems: 'flex-start' }}>
        {/* Recent Employees */}
        <Card className="animate-fade-in-up">
          <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 style={{ fontSize: '1.125rem' }}>Recent Employees</h2>
            <Button variant="ghost" size="sm">View All →</Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-secondary)' }}>
                Loading employees...
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--danger-primary)' }}>
                {error}
              </div>
            ) : recentEmployees.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-secondary)' }}>
                No employees found
              </div>
            ) : (
              recentEmployees.map((employee) => (
                <div
                  key={employee.id}
                  style={{
                    padding: 'var(--space-md)',
                    backgroundColor: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer'
                  }}
                  className="hover-lift"
                >
                  <div className="flex-between" style={{ marginBottom: 'var(--space-sm)' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                        {employee.name}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {employee.role} • {employee.employeeId}
                      </div>
                    </div>
                    <Badge variant={employee.status === 'active' ? 'success' : 'warning'}>
                      {employee.status}
                    </Badge>
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: 'var(--space-lg)',
                    fontSize: '0.8125rem',
                    color: 'var(--text-tertiary)'
                  }}>
                    <span>📁 {employee.department}</span>
                    <span>📅 {employee.joinDate}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recruitment Pipeline */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 style={{ fontSize: '1.125rem' }}>Recruitment Pipeline</h2>
            <Button variant="ghost" size="sm">Manage →</Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {recruitmentPipeline.map((stage, index) => (
              <div key={index}>
                <div className="flex-between" style={{ marginBottom: 'var(--space-sm)' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                    {stage.stage}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '700', color: stage.color }}>
                    {stage.count}
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: '9999px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(stage.count / 45) * 100}%`,
                    backgroundColor: stage.color,
                    transition: 'width var(--transition-slow)',
                    borderRadius: '9999px'
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div className="divider" />

          <Button
            variant="primary"
            style={{ width: '100%' }}
            onClick={() => navigate('/hr/recruitment/jd')}
          >
            <span>➕</span> Post New Job
          </Button>
        </Card>
      </div>

      {/* Upcoming Tasks */}
      <Card elevated style={{ marginTop: 'var(--space-2xl)' }} className="animate-fade-in-up">
        <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
          <h2 style={{ fontSize: '1.125rem' }}>Upcoming Tasks</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowTaskModal(true)}
          >
            <span>➕</span> Add Task
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
          {upcomingTasks.map((task) => (
            <div
              key={task.id}
              style={{
                padding: 'var(--space-md)',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                transition: 'all var(--transition-fast)'
              }}
              className="hover-lift"
            >
              <div className="flex-between" style={{ marginBottom: 'var(--space-sm)' }}>
                <Badge variant={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {task.due}
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                {task.title}
              </div>
            </div>
          ))}
        </div>
      </Card>
        </>
      )}

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <Card style={{
            width: '500px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: 'var(--space-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Create New Task</h3>
              <button
                onClick={() => setShowTaskModal(false)}
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

            <form onSubmit={handleTaskSubmit}>
              <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: '500' }}>
                    Task Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={taskFormData.title}
                    onChange={handleTaskChange}
                    required
                    style={{ width: '100%', padding: 'var(--space-sm)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: '500' }}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={taskFormData.description}
                    onChange={handleTaskChange}
                    rows={3}
                    style={{ width: '100%', padding: 'var(--space-sm)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: '500' }}>
                      Frequency
                    </label>
                    <select
                      name="frequency"
                      value={taskFormData.frequency}
                      onChange={handleTaskChange}
                      style={{ width: '100%', padding: 'var(--space-sm)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: '500' }}>
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={taskFormData.dueDate}
                      onChange={handleTaskChange}
                      style={{ width: '100%', padding: 'var(--space-sm)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 'var(--space-lg)' }}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTaskModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Create Task
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}

      {selectedTab === 'attendance' && (
        <AttendanceReport />
      )}
    </Layout>
  );
};

export default HRDashboard;
