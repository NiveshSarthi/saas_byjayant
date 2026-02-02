import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import Badge from '../../src/components/shared/Badge';
import CustomSelect from '../../src/components/shared/CustomSelect';
import { Icons } from '../../src/components/shared/Icons';

const AttendanceReport = () => {
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredAttendances, setFilteredAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    employeeId: '',
    department: '',
    dateRange: 'month',
    startDate: '',
    endDate: '',
    status: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [attendances, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attendanceResponse, employeeResponse] = await Promise.all([
        axios.get('/api/attendance'),
        axios.get('/api/hrms/employees')
      ]);

      setAttendances(attendanceResponse.data);
      setEmployees(employeeResponse.data);

      // Set default date range to current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      setFilters(prev => ({
        ...prev,
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0]
      }));

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...attendances];

    // Date range filter
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      filtered = filtered.filter(att => {
        const attDate = new Date(att.date);
        return attDate >= start && attDate <= end;
      });
    }

    // Employee filter
    if (filters.employeeId) {
      filtered = filtered.filter(att => att.employee?._id === filters.employeeId);
    }

    // Department filter
    if (filters.department) {
      filtered = filtered.filter(att => att.employee?.department === filters.department);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(att => {
        if (filters.status === 'present') return att.checkInTime;
        if (filters.status === 'absent') return !att.checkInTime;
        if (filters.status === 'late') return att.checkInTime && isLate(att.checkInTime);
        return true;
      });
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredAttendances(filtered);
  };

  const isLate = (checkInTime) => {
    const checkIn = new Date(checkInTime);
    const hour = checkIn.getHours();
    const minute = checkIn.getMinutes();
    // Consider late if after 9:30 AM
    return hour > 9 || (hour === 9 && minute > 30);
  };

  const getAttendanceStatus = (attendance) => {
    if (!attendance.checkInTime) return { status: 'Absent', variant: 'error' };
    if (isLate(attendance.checkInTime)) return { status: 'Late', variant: 'warning' };
    return { status: 'Present', variant: 'success' };
  };

  const getDepartments = () => {
    const depts = [...new Set(employees.map(emp => emp.department).filter(Boolean))];
    return depts.map(dept => ({ value: dept, label: dept }));
  };

  const getEmployeeOptions = () => {
    return employees.map(emp => ({
      value: emp._id,
      label: `${emp.user?.name} (${emp.employeeId})`
    }));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleDateRangeChange = (range) => {
    const now = new Date();
    let start, end;

    switch (range) {
      case 'today':
        start = end = now;
        break;
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        return;
    }

    setFilters(prev => ({
      ...prev,
      dateRange: range,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    }));
  };

  const exportReport = async (format) => {
    try {
      setExporting(true);
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.employeeId && { employeeId: filters.employeeId }),
        ...(filters.department && { department: filters.department })
      });

      const response = await axios.get(`/api/attendance/export/${format}?${params}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (hours) => {
    if (!hours) return '-';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
          Loading attendance data...
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
              Attendance Report
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Detailed check-in/check-out records and analytics
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <Button
              onClick={() => exportReport('pdf')}
              variant="outline"
              disabled={exporting}
            >
              <Icons.FileText /> Export PDF
            </Button>
            <Button
              onClick={() => exportReport('csv')}
              variant="outline"
              disabled={exporting}
            >
              <Icons.Download /> Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-lg)' }}>
            Filters
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
            {/* Date Range Quick Select */}
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-sm)', fontWeight: '500' }}>
                Quick Date Range
              </label>
              <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                {[
                  { value: 'today', label: 'Today' },
                  { value: 'week', label: 'This Week' },
                  { value: 'month', label: 'This Month' },
                  { value: 'year', label: 'This Year' }
                ].map(range => (
                  <button
                    key={range.value}
                    onClick={() => handleDateRangeChange(range.value)}
                    style={{
                      padding: 'var(--space-xs) var(--space-sm)',
                      border: `1px solid ${filters.dateRange === range.value ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      backgroundColor: filters.dateRange === range.value ? 'var(--accent-primary)' : 'var(--bg-primary)',
                      color: filters.dateRange === range.value ? 'white' : 'var(--text-primary)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem',
                      cursor: 'pointer'
                    }}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-sm)', fontWeight: '500' }}>
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-sm)', fontWeight: '500' }}>
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            {/* Employee Filter */}
            <CustomSelect
              label="Employee"
              value={filters.employeeId}
              onChange={(e) => handleFilterChange('employeeId', e.target.value)}
              options={[{ value: '', label: 'All Employees' }, ...getEmployeeOptions()]}
            />

            {/* Department Filter */}
            <CustomSelect
              label="Department"
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              options={[{ value: '', label: 'All Departments' }, ...getDepartments()]}
            />

            {/* Status Filter */}
            <CustomSelect
              label="Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'present', label: 'Present' },
                { value: 'absent', label: 'Absent' },
                { value: 'late', label: 'Late' }
              ]}
            />
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
          <Card style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success-primary)' }}>
              {filteredAttendances.filter(att => att.checkInTime).length}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Present Days
            </div>
          </Card>

          <Card style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--danger-primary)' }}>
              {filteredAttendances.filter(att => !att.checkInTime).length}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Absent Days
            </div>
          </Card>

          <Card style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--warning-primary)' }}>
              {filteredAttendances.filter(att => att.checkInTime && isLate(att.checkInTime)).length}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Late Arrivals
            </div>
          </Card>

          <Card style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--info-primary)' }}>
              {filteredAttendances.length > 0
                ? ((filteredAttendances.filter(att => att.checkInTime).length / filteredAttendances.length) * 100).toFixed(1)
                : 0}%
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Attendance Rate
            </div>
          </Card>
        </div>

        {/* Attendance Table */}
        <Card style={{ padding: 'var(--space-xl)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-lg)' }}>
            Attendance Records ({filteredAttendances.length})
          </h3>

          {filteredAttendances.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-secondary)' }}>
              No attendance records found for the selected filters
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: 'var(--space-md)', textAlign: 'left', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: 'var(--space-md)', textAlign: 'left', fontWeight: '600' }}>Employee</th>
                    <th style={{ padding: 'var(--space-md)', textAlign: 'left', fontWeight: '600' }}>Employee ID</th>
                    <th style={{ padding: 'var(--space-md)', textAlign: 'left', fontWeight: '600' }}>Department</th>
                    <th style={{ padding: 'var(--space-md)', textAlign: 'left', fontWeight: '600' }}>Check In</th>
                    <th style={{ padding: 'var(--space-md)', textAlign: 'left', fontWeight: '600' }}>Check Out</th>
                    <th style={{ padding: 'var(--space-md)', textAlign: 'left', fontWeight: '600' }}>Working Hours</th>
                    <th style={{ padding: 'var(--space-md)', textAlign: 'left', fontWeight: '600' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendances.map((attendance) => {
                    const status = getAttendanceStatus(attendance);
                    return (
                      <tr key={attendance._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: 'var(--space-md)' }}>
                          {new Date(attendance.date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: 'var(--space-md)' }}>
                          {attendance.employee?.user?.name || 'Unknown'}
                        </td>
                        <td style={{ padding: 'var(--space-md)' }}>
                          {attendance.employee?.employeeId || '-'}
                        </td>
                        <td style={{ padding: 'var(--space-md)' }}>
                          {attendance.employee?.department || '-'}
                        </td>
                        <td style={{ padding: 'var(--space-md)' }}>
                          {formatTime(attendance.checkInTime)}
                        </td>
                        <td style={{ padding: 'var(--space-md)' }}>
                          {formatTime(attendance.checkOutTime)}
                        </td>
                        <td style={{ padding: 'var(--space-md)' }}>
                          {formatDuration(attendance.workingHours)}
                        </td>
                        <td style={{ padding: 'var(--space-md)' }}>
                          <Badge variant={status.variant}>{status.status}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default AttendanceReport;