import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '@shared/Button';

const CheckInOut = () => {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get('/api/attendance/history');
      const today = new Date().toDateString();
      const todayAttendance = response.data.find(att => new Date(att.date).toDateString() === today);
      setAttendance(todayAttendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/attendance/check-in');
      setAttendance(response.data);
    } catch (error) {
      console.error('Error checking in:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/attendance/check-out');
      setAttendance(response.data);
    } catch (error) {
      console.error('Error checking out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Attendance</h2>
      <div className="mb-4">
        <p>Today's Date: {new Date().toLocaleDateString()}</p>
        {attendance && (
          <div>
            <p>Check In: {attendance.checkInTime ? new Date(attendance.checkInTime).toLocaleTimeString() : 'Not checked in'}</p>
            <p>Check Out: {attendance.checkOutTime ? new Date(attendance.checkOutTime).toLocaleTimeString() : 'Not checked out'}</p>
            <p>Working Hours: {attendance.workingHours || 0} hours</p>
          </div>
        )}
      </div>
      <div className="flex space-x-4">
        <Button onClick={handleCheckIn} disabled={loading || (attendance && attendance.checkInTime)}>
          Check In
        </Button>
        <Button onClick={handleCheckOut} disabled={loading || !attendance || !attendance.checkInTime || attendance.checkOutTime}>
          Check Out
        </Button>
      </div>
    </div>
  );
};

export default CheckInOut;







