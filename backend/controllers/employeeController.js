const Employee = require('../models/Employee');
const User = require('../models/User');
const Role = require('../models/Role');
const Document = require('../models/Document');
const Asset = require('../models/Asset');
const bcrypt = require('bcryptjs');
const PDFDocument = require('pdfkit');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Generate unique employee ID
const generateEmployeeId = async () => {
  const currentYear = new Date().getFullYear();
  let counter = 1;
  let employeeId;

  do {
    employeeId = `EMP${currentYear}${counter.toString().padStart(4, '0')}`;
    counter++;
  } while (await Employee.findOne({ employeeId }));

  return employeeId;
};

const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate('user').populate('documents').populate('assets');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('user').populate('documents').populate('assets');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createEmployee = async (req, res) => {
  try {
    console.log('--- Start createEmployee ---');
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const {
      userId, name, email, department, position, hireDate, joiningDate,
      status, level, reportsTo, salary, phone, isNew, isIntern
    } = req.body;

    // 1. Resolve User
    let user;
    if (userId && userId.trim() !== '') {
      user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({ success: false, message: `User with ID ${userId} not found` });
      }
    } else if (name && email) {
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        user = existingUser;
      } else {
        const role = await Role.findOne({ name: 'Employee' });
        if (!role) {
          return res.status(400).json({ success: false, message: 'Default "Employee" role not found in database. Please run seed script.' });
        }
        const hashedPassword = await bcrypt.hash('password123', 10);
        user = new User({
          email: email.toLowerCase(),
          password: hashedPassword,
          name,
          role: role._id,
        });
        await user.save();
        console.log('Created new user:', user._id);
      }
    } else {
      return res.status(400).json({ success: false, message: 'Either User ID or both Name and Email are required' });
    }

    // 2. Prepare Employee Data
    const hireDateValue = (hireDate && hireDate.trim() !== '') ? new Date(hireDate) :
      (joiningDate && joiningDate.trim() !== '') ? new Date(joiningDate) :
        new Date();

    const employeeId = await generateEmployeeId();

    const employeeData = {
      employeeId,
      user: user._id,
      department: department || 'General',
      position: position || 'Employee',
      hireDate: hireDateValue,
      status: status || 'Active',
      level: level || 'Executive',
      salary: isNaN(parseFloat(salary)) ? 0 : parseFloat(salary),
      phone: phone || '',
      isNew: isNew !== undefined ? isNew : true,
      isIntern: isIntern !== undefined ? isIntern : false,
    };

    // Safely handle reportsTo - must be a valid 24-char hex string for Mongoose
    if (reportsTo && typeof reportsTo === 'string' && reportsTo.length === 24 && /^[0-9a-fA-F]+$/.test(reportsTo)) {
      employeeData.reportsTo = reportsTo;
    }

    // 3. Check for existing employee record
    const existingEmployee = await Employee.findOne({ user: user._id });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: `An employee profile already exists for ${user.email}.`,
        errors: { email: 'Employee already exists' }
      });
    }

    // 4. Create and Save
    const employee = new Employee(employeeData);
    await employee.save();
    console.log('Created new employee:', employee._id);

    const populatedEmployee = await Employee.findById(employee._id).populate('user');
    res.status(201).json(populatedEmployee);
  } catch (error) {
    console.error('CRITICAL Error in createEmployee:', error);

    // Detailed error response
    const status = error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500;
    const errors = error.errors ? Object.keys(error.errors).reduce((acc, key) => {
      acc[key] = error.errors[key].message;
      return acc;
    }, {}) : { message: error.message };

    res.status(status).json({
      success: false,
      message: error.message || 'Server error during employee creation',
      errors,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { department, position, hireDate, status, level, reportsTo, salary } = req.body;
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { department, position, hireDate, status, level, reportsTo, salary },
      { new: true }
    ).populate('user').populate('documents').populate('assets');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Additional methods for documents and assets
const addDocument = async (req, res) => {
  try {
    const { employeeId, documentId } = req.body;
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    employee.documents.push(documentId);
    await employee.save();
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addAsset = async (req, res) => {
  try {
    const { employeeId, assetId } = req.body;
    const employee = await Employee.findById(employeeId);
    const asset = await Asset.findById(assetId);
    if (!employee || !asset) {
      return res.status(404).json({ message: 'Employee or Asset not found' });
    }
    employee.assets.push(assetId);
    asset.assignedTo = employeeId;
    asset.status = 'Assigned';
    asset.assignedDate = new Date();
    await employee.save();
    await asset.save();
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const exportEmployeesPdf = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.hireDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (department) {
      query.department = department;
    }
    const employees = await Employee.find(query).populate('user', 'name email');

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=employees_report.pdf');
    doc.pipe(res);

    // Header
    doc.rect(0, 0, 612, 80).fill('#1E293B');
    doc.fillColor('#FFFFFF').fontSize(24).text('SYNDITECH', 30, 25, { weight: 700 });
    doc.fontSize(12).text('Staff Directory Report', 30, 50);
    doc.fontSize(10).text(`Total Employees: ${employees.length}`, 450, 35, { align: 'right' });

    doc.moveDown(4);
    doc.fillColor('#000000');

    // Table Header
    const tableTop = 130;
    const col1 = 30, col2 = 140, col3 = 260, col4 = 350, col5 = 450, col6 = 520;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Name', col1, tableTop);
    doc.text('Email', col2, tableTop);
    doc.text('Department', col3, tableTop);
    doc.text('Position', col4, tableTop);
    doc.text('Hire Date', col5, tableTop);
    doc.text('Status', col6, tableTop);

    doc.moveTo(30, tableTop + 15).lineTo(580, tableTop + 15).strokeColor('#E2E8F0').stroke();

    // Table Content
    let currentY = tableTop + 25;
    doc.font('Helvetica');

    employees.forEach(emp => {
      if (currentY > 750) {
        doc.addPage();
        currentY = 50;
      }

      doc.fontSize(9).fillColor('#475569');
      doc.text(emp.user?.name || 'N/A', col1, currentY, { width: 100 });
      doc.text(emp.user?.email || 'N/A', col2, currentY, { width: 110 });
      doc.text(emp.department, col3, currentY);
      doc.text(emp.position, col4, currentY, { width: 90 });
      doc.text(new Date(emp.hireDate).toLocaleDateString(), col5, currentY);

      const statusColor = emp.status === 'Active' ? '#10B981' : '#EF4444';
      doc.fillColor(statusColor).text(emp.status, col6, currentY);

      currentY += 25;
      doc.moveTo(30, currentY - 10).lineTo(580, currentY - 10).strokeColor('#F8FAFC').stroke();
    });

    doc.end();
  } catch (error) {
    console.error('Employee PDF Export Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const exportEmployeesCsv = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.hireDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (department) {
      query.department = department;
    }
    const employees = await Employee.find(query).populate('user', 'name email');
    const csvWriter = createCsvWriter({
      header: [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'department', title: 'Department' },
        { id: 'position', title: 'Position' },
        { id: 'hireDate', title: 'Hire Date' },
        { id: 'status', title: 'Status' }
      ]
    });
    const records = employees.map(emp => ({
      name: emp.user ? emp.user.name : 'N/A',
      email: emp.user ? emp.user.email : 'N/A',
      department: emp.department,
      position: emp.position,
      hireDate: emp.hireDate.toISOString().split('T')[0],
      status: emp.status
    }));
    const csvString = await csvWriter.writeRecords(records);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=employees.csv');
    res.send(csvString);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateOnboarding = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { onboardingChecklist: req.body },
      { new: true }
    );
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const completeOnboarding = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { isNew: false, status: 'Active' },
      { new: true }
    );
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  addDocument,
  addAsset,
  updateOnboarding,
  completeOnboarding,
  exportEmployeesPdf,
  exportEmployeesCsv,
};