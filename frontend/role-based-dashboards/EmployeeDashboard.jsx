import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../src/components/shared/Layout';
import Card from '../src/components/shared/Card';
import Button from '../src/components/shared/Button';
import StatCard from '../src/components/shared/StatCard';
import Badge from '../src/components/shared/Badge';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [gatepassForm, setGatepassForm] = useState({
    reason: '',
    destination: '',
    startTime: '',
    endTime: '',
    purpose: ''
  });
  const [showGatepassForm, setShowGatepassForm] = useState(false);
  const [payrolls, setPayrolls] = useState([]);
  const [showPayrolls, setShowPayrolls] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    checkTodayAttendance();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch documents
      const documentsResponse = await axios.get('/api/hrms/documents');
      const documents = documentsResponse.data.slice(0, 3); // Show recent 3
      setRecentDocuments(documents.map(doc => ({
        id: doc._id,
        name: doc.name,
        type: doc.type || 'PDF',
        date: new Date(doc.createdAt).toLocaleDateString(),
        status: doc.status || 'available'
      })));

      // Fetch attendance history
      const attendanceResponse = await axios.get('/api/attendance/history');
      const attendances = attendanceResponse.data.slice(0, 5); // Show recent 5
      setAttendanceHistory(attendances.map(att => ({
        date: new Date(att.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        checkIn: att.checkInTime ? new Date(att.checkInTime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }) : '-',
        checkOut: att.checkOutTime ? new Date(att.checkOutTime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }) : '-',
        hours: att.workingHours ? att.workingHours.toFixed(1) : '-',
        status: !att.checkInTime ? 'absent' : 'present'
      })));

      // Calculate stats
      const thisWeekAttendances = attendances.filter(att => {
        const attDate = new Date(att.date);
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return attDate >= weekStart;
      });

      const totalHours = thisWeekAttendances.reduce((sum, att) => sum + (att.workingHours || 0), 0);

      setStats([
        { icon: '⏰', label: 'Hours This Week', value: totalHours.toFixed(1), trend: 2 },
        { icon: '📅', label: 'Days Off Remaining', value: '12', trend: 0 },
        { icon: '🎯', label: 'Tasks Completed', value: '24', trend: 15 },
        { icon: '📊', label: 'Performance Score', value: '4.7/5', trend: 5 }
      ]);

      // Mock upcoming events (would come from calendar/tasks API)
      setUpcomingEvents([
        { id: 1, title: 'Team Standup', time: '10:00 AM', type: 'meeting' },
        { id: 2, title: 'Project Review', time: '02:00 PM', type: 'meeting' },
        { id: 3, title: 'Training Session', time: 'Tomorrow 11:00 AM', type: 'training' },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkTodayAttendance = async () => {
    try {
      const response = await axios.get('/api/attendance/history');
      const today = new Date().toDateString();
      const todayAttendance = response.data.find(att =>
        new Date(att.date).toDateString() === today
      );
      setIsCheckedIn(todayAttendance && todayAttendance.checkInTime && !todayAttendance.checkOutTime);
    } catch (error) {
      console.error('Error checking today attendance:', error);
    }
  };

  const handleGatepassSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/gatepass', gatepassForm);
      setGatepassForm({
        reason: '',
        destination: '',
        startTime: '',
        endTime: '',
        purpose: ''
      });
      setShowGatepassForm(false);
      alert('Gatepass request submitted successfully!');
    } catch (error) {
      console.error('Error submitting gatepass:', error);
      alert('Failed to submit gatepass request');
    }
  };

  const fetchPayrolls = async () => {
    try {
      const response = await axios.get('/api/payroll/my-payrolls');
      setPayrolls(response.data);
      setShowPayrolls(true);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      alert('Failed to fetch payrolls');
    }
  };

  const handleCheckInOut = async () => {
    try {
      setCheckInLoading(true);

      // Get current location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      if (isCheckedIn) {
        await axios.post('/api/attendance/check-out', { location });
        alert('Checked out successfully!');
      } else {
        await axios.post('/api/attendance/check-in', { location });
        alert('Checked in successfully!');
      }
      setIsCheckedIn(!isCheckedIn);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Check-in/out error:', error);
      if (error.code === 1) {
        alert('Location access denied. Please enable location services to check in/out.');
      } else {
        alert(`Failed to ${isCheckedIn ? 'check out' : 'check in'}. Please try again.`);
      }
    } finally {
      setCheckInLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'signed': return 'success';
      case 'pending': return 'warning';
      case 'present': return 'success';
      case 'weekend': return 'neutral';
      default: return 'neutral';
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <h1 style={{ marginBottom: 'var(--space-sm)' }}>My Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Welcome back! Here's your overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid-4 stagger-children" style={{ marginBottom: 'var(--space-2xl)' }}>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid-2" style={{ gap: 'var(--space-xl)', alignItems: 'flex-start' }}>
        {/* Attendance */}
        <Card className="animate-fade-in-up">
          <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 style={{ fontSize: '1.125rem' }}>Attendance History</h2>
            <Button variant="ghost" size="sm">View All →</Button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.875rem' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.map((record, index) => (
                  <tr key={index}>
                    <td>{record.date}</td>
                    <td>{record.checkIn}</td>
                    <td>{record.checkOut}</td>
                    <td>{record.hours}</td>
                    <td>
                      <Badge variant={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divider" />

          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <Button
              variant={isCheckedIn ? "secondary" : "primary"}
              style={{ flex: 1 }}
              onClick={handleCheckInOut}
              disabled={checkInLoading}
            >
              <span>{isCheckedIn ? "✗" : "✓"}</span> {isCheckedIn ? "Check Out" : "Check In"}
            </Button>
          </div>
        </Card>

        {/* Documents & Events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          {/* Documents */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
              <h2 style={{ fontSize: '1.125rem' }}>My Documents</h2>
              <Button variant="ghost" size="sm">View All →</Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {recentDocuments.map((doc) => (
                <div
                  key={doc.id}
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
                  <div className="flex-between">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        📄 {doc.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {doc.type} • {doc.date}
                      </div>
                    </div>
                    <Badge variant={getStatusColor(doc.status)}>
                      {doc.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Events */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
              <h2 style={{ fontSize: '1.125rem' }}>Upcoming Events</h2>
              <Button variant="ghost" size="sm">Calendar →</Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  style={{
                    padding: 'var(--space-md)',
                    backgroundColor: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)'
                  }}
                >
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-primary-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}>
                    {event.type === 'meeting' ? '📅' : '📚'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {event.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Gate Pass Request */}
      {showGatepassForm && (
        <Card style={{ marginTop: 'var(--space-xl)' }}>
          <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: '1rem' }}>Request Gate Pass</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowGatepassForm(false)}>✗</Button>
          </div>
          <form onSubmit={handleGatepassSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.875rem' }}>Reason</label>
                <select
                  name="reason"
                  value={gatepassForm.reason}
                  onChange={(e) => setGatepassForm({ ...gatepassForm, reason: e.target.value })}
                  required
                  style={{ width: '100%', padding: 'var(--space-sm)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                >
                  <option value="">Select reason</option>
                  <option value="personal">Personal</option>
                  <option value="medical">Medical</option>
                  <option value="official">Official</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.875rem' }}>Destination</label>
                <input
                  type="text"
                  name="destination"
                  value={gatepassForm.destination}
                  onChange={(e) => setGatepassForm({ ...gatepassForm, destination: e.target.value })}
                  required
                  style={{ width: '100%', padding: 'var(--space-sm)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.875rem' }}>Start Time</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={gatepassForm.startTime}
                  onChange={(e) => setGatepassForm({ ...gatepassForm, startTime: e.target.value })}
                  required
                  style={{ width: '100%', padding: 'var(--space-sm)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.875rem' }}>End Time</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={gatepassForm.endTime}
                  onChange={(e) => setGatepassForm({ ...gatepassForm, endTime: e.target.value })}
                  required
                  style={{ width: '100%', padding: 'var(--space-sm)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.875rem' }}>Purpose</label>
              <textarea
                name="purpose"
                value={gatepassForm.purpose}
                onChange={(e) => setGatepassForm({ ...gatepassForm, purpose: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: 'var(--space-sm)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <Button type="submit" variant="primary">Submit Request</Button>
          </form>
        </Card>
      )}

      {/* Payroll View */}
      {showPayrolls && (
        <Card style={{ marginTop: 'var(--space-xl)' }}>
          <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: '1rem' }}>My Payslips</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowPayrolls(false)}>✗</Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {payrolls.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No payslips available</p>
            ) : (
              payrolls.map((payroll) => (
                <div
                  key={payroll._id}
                  style={{
                    padding: 'var(--space-md)',
                    backgroundColor: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      {new Date(payroll.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      Net Pay: ₹{payroll.netPay?.toLocaleString('en-IN') || 'N/A'}
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => window.open(`/api/payroll/${payroll._id}/export`, '_blank')}>
                    Download PDF
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card elevated style={{ marginTop: 'var(--space-2xl)' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-lg)' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => setShowGatepassForm(true)}>
            <span>🚪</span> Request Gate Pass
          </Button>
          <Button variant="secondary" onClick={fetchPayrolls}>
            <span>💰</span> View Payslips
          </Button>
          <Button variant="secondary">
            <span>📝</span> Request Time Off
          </Button>
          <Button variant="secondary">
            <span>👤</span> Update Profile
          </Button>
          <Button variant="secondary">
            <span>📞</span> Contact HR
          </Button>
        </div>
      </Card>
    </Layout>
  );
};

export default EmployeeDashboard;
