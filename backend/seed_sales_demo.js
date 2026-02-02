const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Role = require('./models/Role');
const Employee = require('./models/Employee');
const SalesPolicy = require('./models/SalesPolicy');
const Deal = require('./models/Deal');
const Incentive = require('./models/Incentive');
const { createIncentive } = require('./services/accountsService');

require('dotenv').config();

const mongoURI = 'mongodb://root:vbPT5AthmBzfWQtaH2MOdbj6nx4d9TFUvmHIGm0htv43pNMEMwMbgby82bqiGhzx@72.61.248.175:5444/?directConnection=true';

const seedSalesDemo = async () => {
    try {
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB for sales demo seeding');

        // Ensure roles exist
        const employeeRole = await Role.findOne({ name: 'Employee' });
        if (!employeeRole) {
            console.error('Employee role not found. Run seed_all.js first.');
            process.exit(1);
        }

        // Create additional sales users
        const password = await bcrypt.hash('password123', 10);
        const salesUsersData = [
            { email: 'exec1@company.com', password, name: 'Rajesh Executive', role: employeeRole._id },
            { email: 'exec2@company.com', password, name: 'Priya Executive', role: employeeRole._id },
            { email: 'exec3@company.com', password, name: 'Amit Executive', role: employeeRole._id },
            { email: 'mgr1@company.com', password, name: 'Suresh Manager', role: employeeRole._id },
        ];
        await User.deleteMany({ email: { $in: salesUsersData.map(u => u.email) } });
        const salesUsers = await User.insertMany(salesUsersData);
        console.log('Sales users created');

        const userMap = salesUsers.reduce((acc, u) => ({ ...acc, [u.email]: u }), {});

        // Create employees
        const employeesData = [
            {
                user: userMap['exec1@company.com']._id,
                department: 'Sales',
                position: 'Sales Executive',
                hireDate: new Date('2023-01-01'),
                level: 'Executive',
                salary: 40000,
                phone: '9876543213',
                status: 'Active'
            },
            {
                user: userMap['exec2@company.com']._id,
                department: 'Sales',
                position: 'Sales Executive',
                hireDate: new Date('2023-02-01'),
                level: 'Executive',
                salary: 42000,
                phone: '9876543214',
                status: 'Active'
            },
            {
                user: userMap['exec3@company.com']._id,
                department: 'Sales',
                position: 'Sales Executive',
                hireDate: new Date('2023-03-01'),
                level: 'Executive',
                salary: 41000,
                phone: '9876543215',
                status: 'Active'
            },
            {
                user: userMap['mgr1@company.com']._id,
                department: 'Sales',
                position: 'Manager',
                hireDate: new Date('2022-01-01'),
                level: 'Manager',
                salary: 80000,
                phone: '9876543216',
                status: 'Active'
            },
        ];
        await Employee.deleteMany({ user: { $in: Object.values(userMap).map(u => u._id) } });
        const employees = await Employee.insertMany(employeesData);
        console.log('Sales employees created');

        const empMap = employees.reduce((acc, e) => {
            const email = salesUsers.find(u => u._id.equals(e.user)).email;
            return { ...acc, [email]: e };
        }, {});

        // Update sales policies with more comprehensive data
        const policiesData = [
            {
                role: 'Sales Executive',
                minSales: 1,
                maxSales: 5,
                incentivePercentage: 2,
                salaryRewardPercentage: 0,
                nplIncentive: 1,
                normalIncentive: 0.5,
                supportiveSplit: 25,
                incentiveUnlockSequence: 'Payment Received -> Approved -> Released',
                monthEndLocking: true,
                ownershipDays: 60
            },
            {
                role: 'Manager',
                minSales: 5,
                maxSales: 20,
                incentivePercentage: 5,
                salaryRewardPercentage: 1,
                nplIncentive: 2,
                normalIncentive: 1,
                supportiveSplit: 10,
                incentiveUnlockSequence: 'Payment Received -> Approved -> Released',
                monthEndLocking: true,
                ownershipDays: 90
            },
        ];
        await SalesPolicy.deleteMany({});
        await SalesPolicy.insertMany(policiesData);
        console.log('Sales policies updated');

        // Create comprehensive deals
        const dealsData = [
            // Executive 1: 1 sale, Normal, payment received
            {
                employee: empMap['exec1@company.com']._id,
                dealValue: 3000000,
                type: 'Normal',
                date: new Date('2024-01-15'),
                isSupportive: false,
                cvCount: 3,
                numberOfSales: 1,
                builderPaymentReceived: true
            },
            // Executive 1: 2 sales, NPL, payment not received
            {
                employee: empMap['exec1@company.com']._id,
                dealValue: 5000000,
                type: 'NPL',
                date: new Date('2024-02-10'),
                isSupportive: false,
                cvCount: 5,
                numberOfSales: 2,
                builderPaymentReceived: false
            },
            // Executive 2: 2 sales, Normal, supportive
            {
                employee: empMap['exec2@company.com']._id,
                dealValue: 4000000,
                type: 'Normal',
                date: new Date('2024-01-20'),
                isSupportive: true,
                cvCount: 4,
                numberOfSales: 2,
                builderPaymentReceived: true
            },
            // Executive 2: 3 sales, NPL
            {
                employee: empMap['exec2@company.com']._id,
                dealValue: 6000000,
                type: 'NPL',
                date: new Date('2024-03-05'),
                isSupportive: false,
                cvCount: 6,
                numberOfSales: 3,
                builderPaymentReceived: true
            },
            // Executive 3: 1 sale, Normal, high CV
            {
                employee: empMap['exec3@company.com']._id,
                dealValue: 2500000,
                type: 'Normal',
                date: new Date('2024-01-25'),
                isSupportive: false,
                cvCount: 10,
                numberOfSales: 1,
                builderPaymentReceived: true
            },
            // Executive 3: 3 sales, NPL, low CV
            {
                employee: empMap['exec3@company.com']._id,
                dealValue: 7000000,
                type: 'NPL',
                date: new Date('2024-04-01'),
                isSupportive: false,
                cvCount: 1,
                numberOfSales: 3,
                builderPaymentReceived: false
            },
            // Manager: 5 sales, Normal
            {
                employee: empMap['mgr1@company.com']._id,
                dealValue: 15000000,
                type: 'Normal',
                date: new Date('2024-01-10'),
                isSupportive: false,
                cvCount: 15,
                numberOfSales: 5,
                builderPaymentReceived: true
            },
            // Manager: 8 sales, NPL
            {
                employee: empMap['mgr1@company.com']._id,
                dealValue: 20000000,
                type: 'NPL',
                date: new Date('2024-02-15'),
                isSupportive: false,
                cvCount: 20,
                numberOfSales: 8,
                builderPaymentReceived: true
            },
            // Manager: 10 sales, Normal, supportive
            {
                employee: empMap['mgr1@company.com']._id,
                dealValue: 25000000,
                type: 'Normal',
                date: new Date('2024-03-20'),
                isSupportive: true,
                cvCount: 25,
                numberOfSales: 10,
                builderPaymentReceived: false
            },
            // Edge case: Deal within grace period (recent)
            {
                employee: empMap['exec1@company.com']._id,
                dealValue: 3500000,
                type: 'Normal',
                date: new Date(), // Today
                isSupportive: false,
                cvCount: 4,
                numberOfSales: 1,
                builderPaymentReceived: false
            },
            // Edge case: High value deal
            {
                employee: empMap['mgr1@company.com']._id,
                dealValue: 50000000,
                type: 'NPL',
                date: new Date('2024-05-01'),
                isSupportive: false,
                cvCount: 50,
                numberOfSales: 15,
                builderPaymentReceived: true
            },
        ];
        await Deal.deleteMany({ employee: { $in: Object.values(empMap).map(e => e._id) } });
        const deals = await Deal.insertMany(dealsData);
        console.log('Deals created');

        // Create incentives for deals
        await Incentive.deleteMany({ deal: { $in: deals.map(d => d._id) } });
        for (const deal of deals) {
            try {
                const incentive = await createIncentive(deal._id);
                // Set different states for demo
                if (deal.builderPaymentReceived) {
                    incentive.isLocked = false;
                    incentive.approved = Math.random() > 0.5; // Randomly approve some
                    if (incentive.approved) {
                        incentive.released = Math.random() > 0.5; // Randomly release some approved
                    }
                }
                await incentive.save();
            } catch (error) {
                console.error(`Error creating incentive for deal ${deal._id}:`, error.message);
            }
        }
        console.log('Incentives created and states set');

        console.log('Sales demo data seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedSalesDemo();