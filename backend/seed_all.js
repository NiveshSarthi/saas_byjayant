const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Role = require('./models/Role');
const Employee = require('./models/Employee');
const Recruitment = require('./models/Recruitment');
const SalesPolicy = require('./models/SalesPolicy');
const Deal = require('./models/Deal');
const Asset = require('./models/Asset');
const Inventory = require('./models/Inventory');
const Expense = require('./models/Expense');
const Attendance = require('./models/Attendance');
const Checklist = require('./models/Checklist');
const Gatepass = require('./models/Gatepass');
const Appraisal = require('./models/Appraisal');
const PIP = require('./models/PIP');
const FNF = require('./models/FNF');
const Payroll = require('./models/Payroll');

require('dotenv').config();

// Use the connection string from environment variables
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error('MONGO_URI is not defined in .env');
    process.exit(1);
}

const seedAll = async () => {
    try {
        console.log('--- Reseting Database for Testing ---');
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        // 1. Roles
        const rolesData = [
            { name: 'HR Manager', description: 'Manages HR activities' },
            { name: 'Employee', description: 'Standard employee' },
            { name: 'Admin', description: 'Full system access' },
            { name: 'Operations', description: 'Manages admin and inventory' },
            { name: 'Accounts', description: 'Manages finance and payroll' },
        ];
        await Role.deleteMany({});
        const roles = await Role.insertMany(rolesData);
        console.log('Roles seeded');

        const roleMap = roles.reduce((acc, r) => ({ ...acc, [r.name]: r._id }), {});

        // 2. Users
        const password = await bcrypt.hash('password123', 10);
        const usersData = [
            { email: 'admin@company.com', password, name: 'Super Admin', role: roleMap['Admin'] },
            { email: 'hr@company.com', password, name: 'Sonia HR', role: roleMap['HR Manager'] },
            { email: 'accounts@company.com', password, name: 'Amit Accounts', role: roleMap['Accounts'] },
            { email: 'ops@company.com', password, name: 'Rahul Ops', role: roleMap['Operations'] },
            { email: 'sales1@company.com', password, name: 'Vikram Sales', role: roleMap['Employee'] },
            { email: 'sales2@company.com', password, name: 'Anjali Sales', role: roleMap['Employee'] },
        ];
        await User.deleteMany({});
        const users = await User.insertMany(usersData);
        console.log('Users seeded');

        const userMap = users.reduce((acc, u) => ({ ...acc, [u.email]: u }), {});

        // 3. Sales Policies
        const policiesData = [
            { role: 'Sales Executive', minSales: 1, maxSales: 5, incentivePercentage: 2, nplIncentive: 1, normalIncentive: 0.5, supportiveSplit: 25 },
            { role: 'Manager', minSales: 5, maxSales: 20, incentivePercentage: 5, nplIncentive: 2, normalIncentive: 1, supportiveSplit: 10 },
        ];
        await SalesPolicy.deleteMany({});
        await SalesPolicy.insertMany(policiesData);
        console.log('Sales Policies seeded');

        // 4. Employees
        const employeeData = [
            {
                employeeId: 'EMP001',
                user: userMap['sales1@company.com']._id,
                department: 'Sales',
                position: 'Sales Executive',
                hireDate: new Date('2023-01-15'),
                level: 'Executive',
                salary: 45000,
                phone: '9876543210',
                status: 'Active'
            },
            {
                employeeId: 'EMP002',
                user: userMap['sales2@company.com']._id,
                department: 'Sales',
                position: 'Senior Executive',
                hireDate: new Date('2022-06-10'),
                level: 'Senior Executive',
                salary: 55000,
                phone: '9876543211',
                status: 'Active'
            },
            {
                employeeId: 'EMP003',
                user: userMap['hr@company.com']._id,
                department: 'HR',
                position: 'HR Manager',
                hireDate: new Date('2021-03-20'),
                level: 'Manager',
                salary: 75000,
                phone: '9876543212',
                status: 'Active'
            }
        ];
        await Employee.deleteMany({});
        const employees = await Employee.insertMany(employeeData);
        console.log('Employees seeded');

        const empMap = employees.reduce((acc, e) => {
            const email = users.find(u => u._id.equals(e.user)).email;
            return { ...acc, [email]: e };
        }, {});

        // 5. Recruitment Targets
        const targetsData = [
            { title: 'Property Consultant', position: 'Property Consultant', department: 'Sales', level: 'Junior', numberOfPositions: 5, targetDate: new Date('2026-03-01'), description: 'Requirement for residential sales team', createdBy: userMap['hr@company.com']._id },
            { title: 'Accounts Executive', position: 'Accounts Executive', department: 'Accounts', level: 'Mid', numberOfPositions: 2, targetDate: new Date('2026-02-15'), description: 'Managing ledger and petty cash', createdBy: userMap['hr@company.com']._id }
        ];
        await Recruitment.deleteMany({});
        await Recruitment.insertMany(targetsData);
        console.log('Recruitment Targets seeded');

        // 6. Deals (Sales)
        const dealsData = [
            { employee: empMap['sales1@company.com']._id, dealValue: 5000000, type: 'Normal', date: new Date(), cvCount: 5, numberOfSales: 1, builderPaymentReceived: true },
            { employee: empMap['sales1@company.com']._id, dealValue: 8000000, type: 'NPL', date: new Date(), cvCount: 8, numberOfSales: 1, builderPaymentReceived: true },
            { employee: empMap['sales2@company.com']._id, dealValue: 12000000, type: 'Normal', date: new Date(), cvCount: 12, numberOfSales: 1, builderPaymentReceived: false },
        ];
        await Deal.deleteMany({});
        await Deal.insertMany(dealsData);
        console.log('Deals seeded');

        // 7. Assets & Inventory
        const assetsData = [
            { name: 'MacBook Air M2', type: 'laptop', serialNumber: 'SN12345', status: 'Assigned', assignedTo: empMap['sales1@company.com']._id, assignedDate: new Date() },
            { name: 'iPhone 15', type: 'phone', serialNumber: 'PH98765', status: 'Available' },
        ];
        await Asset.deleteMany({});
        await Asset.insertMany(assetsData);
        console.log('Assets seeded');

        const inventoryData = [
            { name: 'Office A4 Paper', category: 'stationery', quantity: 50, addedBy: userMap['ops@company.com']._id },
            { name: 'Milk Pack 1L', category: 'milk', quantity: 15, addedBy: userMap['ops@company.com']._id },
        ];
        await Inventory.deleteMany({});
        await Inventory.insertMany(inventoryData);
        console.log('Inventory seeded');

        // 8. Expenses
        const expensesData = [
            { title: 'Office Stationery', category: 'Stationery Purchase', amount: 2500, department: 'Administration', description: 'Monthly stationery supply', submittedBy: userMap['ops@company.com']._id, status: 'Approved', approvedBy: userMap['accounts@company.com']._id },
            { title: 'Internet Bill Jan', category: 'Internet/Subscriptions', amount: 1500, department: 'IT', description: 'Office broadband', submittedBy: userMap['ops@company.com']._id, status: 'Pending' },
        ];
        await Expense.deleteMany({});
        await Expense.insertMany(expensesData);
        console.log('Expenses seeded');

        // 9. Attendance & Gatepass
        const attendanceData = [
            { employee: empMap['sales1@company.com']._id, date: new Date(), status: 'Present', checkInTime: new Date(), checkOutTime: new Date(new Date().getTime() + 9 * 60 * 60 * 1000) },
            { employee: empMap['sales2@company.com']._id, date: new Date(), status: 'Present', checkInTime: new Date() },
        ];
        await Attendance.deleteMany({});
        await Attendance.insertMany(attendanceData);
        console.log('Attendance seeded');

        const gatepassData = [
            {
                employee: empMap['sales1@company.com']._id,
                requestDate: new Date(),
                reason: 'Client Meeting',
                startTime: new Date(),
                endTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
                status: 'approved',
                approvedBy: userMap['hr@company.com']._id
            },
        ];
        await Gatepass.deleteMany({});
        await Gatepass.insertMany(gatepassData);
        console.log('Gatepass seeded');

        // 10. Checklists
        const checklistData = [
            { title: 'Morning Office Opening', type: 'daily', items: [{ item: 'AC On' }, { item: 'Lights On' }], createdBy: userMap['ops@company.com']._id },
            { title: 'Evening Shutdown', type: 'daily', items: [{ item: 'AC Off' }, { item: 'Main Gate Lock' }], createdBy: userMap['ops@company.com']._id },
        ];
        await Checklist.deleteMany({});
        await Checklist.insertMany(checklistData);
        console.log('Checklists seeded');

        // Clear others to be safe
        await Appraisal.deleteMany({});
        await PIP.deleteMany({});
        await FNF.deleteMany({});
        await Payroll.deleteMany({});

        console.log('--- Seeding Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', JSON.stringify(error, null, 2));
        process.exit(1);
    }
};

seedAll();
