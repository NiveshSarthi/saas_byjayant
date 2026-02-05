const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Employee = require('../models/Employee');
// Ensure models are registered
require('../models/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/saas-hrms');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
};

const verifyHierarchy = async () => {
    await connectDB();

    try {
        const employees = await Employee.find().populate('user').populate('reportsTo');

        console.log('\n--- Current Employee Hierarchy ---\n');

        const employeeMap = {};
        employees.forEach(emp => {
            if (emp.user) employeeMap[emp._id] = emp;
        });

        // Find roots (no reporting manager)
        const roots = employees.filter(emp => !emp.reportsTo);

        const printNode = (emp, level = 0) => {
            const indent = '  '.repeat(level);
            console.log(`${indent}- ${emp.user.name} (${emp.position}) [${emp.department}]`);

            // Find direct reports
            const reports = employees.filter(e => e.reportsTo && e.reportsTo._id.equals(emp._id));
            reports.forEach(report => printNode(report, level + 1));
        };

        roots.forEach(root => printNode(root));

        console.log(`\nTotal Employees: ${employees.length}`);
        process.exit(0);
    } catch (error) {
        console.error('CRITICAL ERROR:', error);
        process.exit(1);
    }
};

verifyHierarchy();
