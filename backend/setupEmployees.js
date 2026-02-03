const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const mongoURI = process.env.MONGO_URI || 'mongodb://root:vbPT5AthmBzfWQtaH2MOdbj6nx4d9TFUvmHIGm0htv43pNMEMwMbgby82bqiGhzx@72.61.248.175:5444/?directConnection=true';

async function setupEmployees() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Find existing roles
    const Role = require('./models/Role');
    const hrRole = await Role.findOne({ name: 'HR Manager' }) || await Role.findOne({ name: 'HR' }) || await Role.findOne();
    const employeeRole = await Role.findOne({ name: 'Employee' }) || hrRole;

    if (!hrRole) {
      console.error('No roles found in database. Please create roles first.');
      return;
    }

    // Create Sales Manager: Shubham Gupta
    const salesManagerUser = new User({
      name: 'Shubham Gupta',
      email: 'shubham.gupta@synditech.com',
      password: await bcrypt.hash('password123', 10),
      role: hrRole._id
    });
    await salesManagerUser.save();
    console.log('Created Sales Manager user');

    const salesManager = new Employee({
      employeeId: 'EMP001',
      user: salesManagerUser._id,
      department: 'Sales',
      position: 'Sales Manager',
      hireDate: new Date('2023-01-01'),
      status: 'Active',
      level: 'Manager',
      salary: 50000,
      category: 'Skilled'
    });
    await salesManager.save();
    console.log('Created Sales Manager employee');

    // Create Sales Executives
    const executives = [
      { name: 'Mugdha Sharma', email: 'mugdha.sharma@synditech.com', employeeId: 'EMP002' },
      { name: 'Anuradha', email: 'anuradha@synditech.com', employeeId: 'EMP003' },
      { name: 'Amit', email: 'amit@synditech.com', employeeId: 'EMP004' },
      { name: 'Heena', email: 'heena@synditech.com', employeeId: 'EMP005' }
    ];

    for (const exec of executives) {
      const user = new User({
        name: exec.name,
        email: exec.email,
        password: await bcrypt.hash('password123', 10),
        role: employeeRole._id
      });
      await user.save();

      const employee = new Employee({
        employeeId: exec.employeeId,
        user: user._id,
        department: 'Sales',
        position: 'Sales Executive',
        hireDate: new Date('2023-01-15'),
        status: 'Active',
        level: 'Executive',
        reportsTo: salesManager._id, // All report to Shubham Gupta
        salary: 25000,
        category: 'Skilled'
      });
      await employee.save();
      console.log(`Created Sales Executive: ${exec.name}`);
    }

    console.log('All employees created successfully!');
    console.log('Sales Manager: Shubham Gupta (EMP001)');
    console.log('Sales Executives: Mugdha Sharma, Anuradha, Amit, Heena (EMP002-EMP005)');
    console.log('All executives report to Shubham Gupta');

  } catch (error) {
    console.error('Error setting up employees:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

setupEmployees();