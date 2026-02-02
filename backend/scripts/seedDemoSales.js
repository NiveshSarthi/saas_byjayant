const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Deal = require('../models/Deal');

dotenv.config({ path: './.env' });

const seedDemoData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find a demo user and employee (or create)
        let user = await User.findOne({ email: 'sales@demo.com' });
        if (!user) {
            user = new User({ name: 'Demo Sales Exec', email: 'sales@demo.com', role: 'employee', password: 'password123' });
            await user.save();
        }

        let employee = await Employee.findOne({ user: user._id });
        if (!employee) {
            employee = new Employee({
                user: user._id,
                position: 'Sales Executive',
                department: 'Sales',
                salary: 50000,
                hireDate: new Date('2025-01-01')
            });
            await employee.save();
        }

        // Clear previous demo deals
        await Deal.deleteMany({ employee: employee._id });

        const demoDeals = [
            {
                employee: employee._id,
                dealValue: 60000, // 0.6% of 1Cr (Normal Sale)
                cvCount: 10000000,
                type: 'Normal',
                numberOfSales: 1,
                date: new Date('2026-01-05'),
                builderPaymentReceived: true
            },
            {
                employee: employee._id,
                dealValue: 40000, // 0.4% of 1Cr (NPL Sale)
                cvCount: 10000000,
                type: 'NPL',
                numberOfSales: 1,
                date: new Date('2026-01-10'),
                builderPaymentReceived: true
            },
            {
                employee: employee._id,
                dealValue: 100000, // Normal Sale
                cvCount: 10000000,
                type: 'Normal',
                numberOfSales: 1,
                date: new Date('2026-01-15'),
                builderPaymentReceived: true,
                isSupportive: true // Joint Sale
            },
            {
                employee: employee._id,
                dealValue: 20000, // < 0.25% (No incentive, only salary reward tracker)
                cvCount: 10000000,
                type: 'NPL',
                numberOfSales: 1,
                date: new Date('2026-01-20'),
                builderPaymentReceived: true
            }
        ];

        await Deal.insertMany(demoDeals);
        console.log('Demo deals seeded successfully');

        process.exit();
    } catch (error) {
        console.error('Error seeding demo data:', error);
        process.exit(1);
    }
};

seedDemoData();
