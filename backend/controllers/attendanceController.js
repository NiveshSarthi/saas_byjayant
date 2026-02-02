const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const PDFDocument = require('pdfkit');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const checkIn = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({ employee: employee._id, date: today });
    if (!attendance) {
      attendance = new Attendance({
        employee: employee._id,
        date: today,
        checkInTime: new Date(),
      });
    } else if (attendance.checkInTime) {
      return res.status(400).json({ message: 'Already checked in today' });
    } else {
      attendance.checkInTime = new Date();
    }

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const checkOut = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ employee: employee._id, date: today });
    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({ message: 'Not checked in today' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    attendance.checkOutTime = new Date();
    const diff = (attendance.checkOutTime - attendance.checkInTime) / (1000 * 60 * 60); // hours
    attendance.workingHours = Math.round(diff * 100) / 100;

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAttendanceHistory = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const attendances = await Attendance.find({ employee: employee._id }).sort({ date: -1 });
    res.json(attendances);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllAttendances = async (req, res) => {
  try {
    const { startDate, endDate, employeeId, department } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (employeeId) {
      query.employee = employeeId;
    }

    let attendances = await Attendance.find(query).populate('employee').sort({ date: -1 });

    if (department) {
      attendances = attendances.filter(att => att.employee && att.employee.department === department);
    }

    res.json(attendances);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const exportAttendancesPdf = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    let attendances = await Attendance.find(query).populate('employee', 'name department').sort({ date: -1 });
    if (department) {
      attendances = attendances.filter(att => att.employee && att.employee.department === department);
    }
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=attendances.pdf');
    doc.pipe(res);
    doc.fontSize(20).text('Attendances Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('Employee | Date | Check In | Check Out | Working Hours');
    doc.moveDown();
    attendances.forEach(att => {
      doc.text(`${att.employee ? att.employee.name : 'N/A'} | ${att.date.toDateString()} | ${att.checkInTime ? att.checkInTime.toTimeString() : 'N/A'} | ${att.checkOutTime ? att.checkOutTime.toTimeString() : 'N/A'} | ${att.workingHours || 'N/A'}`);
    });
    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const exportAttendancesCsv = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    let attendances = await Attendance.find(query).populate('employee', 'employeeId name department').sort({ date: -1 });
    if (department) {
      attendances = attendances.filter(att => att.employee && att.employee.department === department);
    }
    const csvWriter = createCsvWriter({
      header: [
        { id: 'employeeId', title: 'Employee ID' },
        { id: 'employee', title: 'Employee Name' },
        { id: 'department', title: 'Department' },
        { id: 'date', title: 'Date' },
        { id: 'checkInTime', title: 'Check In' },
        { id: 'checkOutTime', title: 'Check Out' },
        { id: 'workingHours', title: 'Working Hours' },
        { id: 'status', title: 'Status' }
      ]
    });
    const records = attendances.map(att => {
      const isLate = att.checkInTime && new Date(att.checkInTime).getHours() > 9 || (new Date(att.checkInTime).getHours() === 9 && new Date(att.checkInTime).getMinutes() > 30);
      const status = !att.checkInTime ? 'Absent' : isLate ? 'Late' : 'Present';

      return {
        employeeId: att.employee ? att.employee.employeeId : 'N/A',
        employee: att.employee ? att.employee.name : 'N/A',
        department: att.employee ? att.employee.department : 'N/A',
        date: att.date.toISOString().split('T')[0],
        checkInTime: att.checkInTime ? new Date(att.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        checkOutTime: att.checkOutTime ? new Date(att.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        workingHours: att.workingHours ? `${att.workingHours}h` : 'N/A',
        status
      };
    });
    const csvString = await csvWriter.writeRecords(records);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendances.csv');
    res.send(csvString);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getAttendanceHistory,
  getAllAttendances,
  exportAttendancesPdf,
  exportAttendancesCsv,
};