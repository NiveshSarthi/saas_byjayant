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

  const handleCheckInOut = async () => {
    try {
      setCheckInLoading(true);
      if (isCheckedIn) {
        await axios.post('/api/attendance/check-out');
        alert('Checked out successfully!');
      } else {
        await axios.post('/api/attendance/check-in');
        alert('Checked in successfully!');
      }
      setIsCheckedIn(!isCheckedIn);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Check-in/out error:', error);
      alert(`Failed to ${isCheckedIn ? 'check out' : 'check in'}. Please try again.`);
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

      {/* Quick Actions */}
      <Card elevated style={{ marginTop: 'var(--space-2xl)' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-lg)' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <Button variant="secondary">
            <span>📝</span> Request Time Off
          </Button>
          <Button variant="secondary">
            <span>💰</span> View Payslips
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
