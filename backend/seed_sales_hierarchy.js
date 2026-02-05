const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Role = require('./models/Role');
const Employee = require('./models/Employee');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;

const seedHierarchy = async () => {
    try {
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        // Roles
        const employeeRole = await Role.findOne({ name: 'Employee' });
        const hrRole = await Role.findOne({ name: 'HR Manager' });

        if (!employeeRole || !hrRole) {
            console.error('Roles not found. Run seed_all.js first.');
            process.exit(1);
        }

        const password = await bcrypt.hash('password123', 10);

        // 1. Create Shubham Gupta (Sales Manager)
        let shubhamUser = await User.findOne({ email: 'shubham@company.com' });
        if (!shubhamUser) {
            shubhamUser = await User.create({
                email: 'shubham@company.com',
                password,
                name: 'Shubham Gupta',
                role: hrRole._id // Giving him HR Manager role or similar for access
            });
            console.log('User Shubham created');
        }

        let shubhamEmp = await Employee.findOne({ user: shubhamUser._id });
        if (!shubhamEmp) {
            shubhamEmp = await Employee.create({
                employeeId: 'EMP_MGR_001',
                user: shubhamUser._id,
                department: 'Sales',
                position: 'Sales Manager',
                hireDate: new Date('2022-01-01'),
                level: 'Manager',
                salary: 100000,
                status: 'Active'
            });
            console.log('Employee Shubham created');
        }

        // 2. Create Sales Executives
        const executives = [
            { name: 'Mugdha', email: 'mugdha@company.com', id: 'EMP_SAL_001' },
            { name: 'Anuradha', email: 'anuradha@company.com', id: 'EMP_SAL_002' },
            { name: 'Amit', email: 'amit@company.com', id: 'EMP_SAL_003' },
            { name: 'Heena', email: 'heena@company.com', id: 'EMP_SAL_004' }
        ];

        for (const exec of executives) {
            let user = await User.findOne({ email: exec.email });
            if (!user) {
                user = await User.create({
                    email: exec.email,
                    password,
                    name: exec.name,
                    role: employeeRole._id
                });
                console.log(`User ${exec.name} created`);
            }

            let emp = await Employee.findOne({ user: user._id });
            if (!emp) {
                emp = await Employee.create({
                    employeeId: exec.id,
                    user: user._id,
                    department: 'Sales',
                    position: 'Sales Executive',
                    reportsTo: shubhamEmp._id,
                    hireDate: new Date('2023-01-01'),
                    level: 'Executive',
                    salary: 50000,
                    status: 'Active'
                });
                console.log(`Employee ${exec.name} created reporting to Shubham`);
            } else {
                // Ensure they report to Shubham
                emp.reportsTo = shubhamEmp._id;
                await emp.save();
                console.log(`Employee ${exec.name} updated to report to Shubham`);
            }
        }

        console.log('Hierarchy seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedHierarchy();
