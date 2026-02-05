const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Employee = require('../models/Employee');
const Role = require('../models/Role');

const employeesData = [
    { name: 'Rahul Kushwaha', email: 'rahulkushwaha120@gmail.com', phone: '9660184306', department: 'Management', level: 'CEO', position: 'CEO', reportingManager: '-', joiningDate: '01-04-2025', salary: 0 },
    { name: 'Rakesh Kushwaha', email: 'info.niveshsarthi@gmail.com', phone: '9560031319', department: 'Management', level: 'Top Management', position: 'Director', reportingManager: '-', joiningDate: '01-04-2025', salary: 0 },
    { name: 'Anuradha', email: 'anuradha@niveshsarthi.com', phone: '9761136118', department: 'Sales', level: 'Junior Level', position: 'Executive', reportingManager: 'Shubham Gupta', joiningDate: '01-04-2025', salary: 20000 },
    { name: 'Shubham Gupta', email: 'shubham@niveshsarthi.com', phone: '9582533370', department: 'Sales', level: 'Mid Level', position: 'Manager', reportingManager: 'Rahul Kushwaha', joiningDate: '01-04-2025', salary: 20000 },
    { name: 'Mugdha', email: 'mugdha@niveshsarthi.com', phone: '9109512268', department: 'Sales', level: 'Junior Level', position: 'Executive', reportingManager: 'Shubham Gupta', joiningDate: '01-04-2025', salary: 20000 },
    { name: 'Amit Kumar', email: 'amit@niveshsarthi.com', phone: '8287056174', department: 'Sales', level: 'Junior Level', position: 'Executive', reportingManager: 'Shubham Gupta', joiningDate: '01-04-2025', salary: 20000 },
    { name: 'Nishi Mishra', email: 'nishi@niveshsarthi.com', phone: '9971650348', department: 'HR', level: 'Manager', position: 'Executive', reportingManager: 'Rakesh Kushwaha', joiningDate: '01-04-2025', salary: 35000 },
    { name: 'Jayant Kumar', email: 'jayant@niveshsarthi.com', phone: '8930318532', department: 'Marketing', level: 'Manager', position: 'Manager', reportingManager: 'Rahul Kushwaha', joiningDate: '01-04-2025', salary: 35000 },
    { name: 'Ratnakar Kumar', email: 'ratnakar@niveshsarthi.com', phone: '7007383203', department: 'IT', level: 'Mid Level', position: 'Executive', reportingManager: 'Rahul Kushwaha', joiningDate: '01-04-2025', salary: 35000 },
    { name: 'Heena', email: 'heena@niveshsarthi.com', phone: '9355155663', department: 'Admin', level: 'Junior Level', position: 'Executive', reportingManager: 'Rakesh Kushwaha', joiningDate: '01-04-2025', salary: 25000 },
    { name: 'Vishal', email: 'vishal@niveshsarthi.com', phone: '8802409695', department: 'IT', level: 'Mid Level', position: 'Executive', reportingManager: 'Jayant Kumar', joiningDate: '01-04-2025', salary: 35000 },
    { name: 'Nupur Madaan', email: 'nupur@niveshsarthi.com', phone: '8383972766', department: 'Marketing', level: 'Mid Level', position: 'Production Manager', reportingManager: 'Jayant Kumar', joiningDate: '01-04-2025', salary: 50000 },
    { name: 'Abhinav Sharma', email: 'abhinav@niveshsarthi.com', phone: '7701905881', department: 'IT', level: 'Junior Level', position: 'Executive', reportingManager: 'Jayant Kumar', joiningDate: '01-04-2025', salary: 52000 },
    { name: 'Awdesh', email: 'awdesh@niveshsarthi.com', phone: '8318630152', department: 'Admin', level: 'Junior Level', position: 'Office Boy', reportingManager: 'Heena', joiningDate: '01-04-2025', salary: 12000 },
    { name: 'Anshuman', email: 'anshuman@niveshsarthi.com', phone: '9311566090', department: 'Admin', level: 'Junior Level', position: 'Office Boy', reportingManager: 'Heena', joiningDate: '01-04-2025', salary: 11000 },
    { name: 'Pooja', email: 'pooja@niveshsarthi.com', phone: '8130970187', department: 'HR', level: 'Manager', position: 'Manager', reportingManager: 'Rahul Kushwaha', joiningDate: '01-04-2025', salary: 52500 }
];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/saas-hrms');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
};

const updateEmployees = async () => {
    await connectDB();

    try {
        // 1. Ensure Roles Exist
        const employeeRole = await Role.findOne({ name: 'Employee' });
        if (!employeeRole) {
            console.error('Error: "Employee" role not found. Please seed roles first.');
            process.exit(1);
        }

        // Map to store Name -> Employee ID for hierarchy resolution
        const nameToEmployeeIdMap = {};
        const activeEmployeeIds = [];

        // 2. Create/Update Users and Employees
        console.log('--- Starting Employee Update/Creation ---');
        for (const data of employeesData) {
            console.log(`Processing: ${data.name} (${data.email})`);

            // Check if User exists
            let user = await User.findOne({ email: data.email.toLowerCase() });

            if (!user) {
                // Create new User
                const hashedPassword = await bcrypt.hash('password123', 10);
                user = new User({
                    email: data.email.toLowerCase(),
                    name: data.name,
                    password: hashedPassword,
                    role: employeeRole._id, // Default role
                });
                await user.save();
                console.log(`  - Created User: ${user._id}`);
            } else {
                // Update existing user name if needed
                if (user.name !== data.name) {
                    user.name = data.name;
                    await user.save();
                    console.log(`  - Updated User Name`);
                }
            }

            // Check if Employee exists
            let employee = await Employee.findOne({ user: user._id });
            const hireDate = new Date(data.joiningDate.split('-').reverse().join('-')); // Convert DD-MM-YYYY to Date

            const employeeData = {
                user: user._id,
                department: data.department,
                position: data.position,
                level: data.level,
                hireDate: hireDate,
                salary: parseFloat(data.salary),
                phone: data.phone,
                status: 'Active',
                isNewEmployee: false // Assuming migrated employees are not "New" in terms of onboarding
            };

            if (!employee) {
                // Generate Employee ID
                const empId = `EMP2025${(await Employee.countDocuments() + 100 + activeEmployeeIds.length).toString().padStart(4, '0')}`;

                employee = new Employee({
                    employeeId: empId,
                    ...employeeData
                });
                await employee.save();
                console.log(`  - Created Employee: ${employee.employeeId}`);
            } else {
                // Update existing employee
                Object.assign(employee, employeeData);
                await employee.save();
                console.log(`  - Updated Employee: ${employee.employeeId}`);
            }

            nameToEmployeeIdMap[data.name.trim()] = employee._id;
            activeEmployeeIds.push(employee._id);
        }

        // 3. Update Hierarchy (Reporting Managers)
        console.log('\n--- Updating Hierarchy ---');
        for (const data of employeesData) {
            if (data.reportingManager && data.reportingManager !== '-' && nameToEmployeeIdMap[data.reportingManager.trim()]) {
                const managerId = nameToEmployeeIdMap[data.reportingManager.trim()];
                const employeeId = nameToEmployeeIdMap[data.name.trim()];

                await Employee.findByIdAndUpdate(employeeId, { reportsTo: managerId });
                console.log(`  - Linked ${data.name} -> Manager: ${data.reportingManager}`);
            } else if (data.reportingManager && data.reportingManager !== '-') {
                console.log(`  - Warning: Manager '${data.reportingManager}' not found for '${data.name}'`);
            }
        }

        // 4. Cleanup Old Employees
        console.log('\n--- Cleaning Up Old Records ---');
        const allEmployees = await Employee.find({});
        for (const emp of allEmployees) {
            if (!activeEmployeeIds.some(id => id.equals(emp._id))) {
                console.log(`  - Deleting old employee: ${emp.employeeId} (User: ${emp.user})`);
                await User.findByIdAndDelete(emp.user); // Delete associated User
                await Employee.findByIdAndDelete(emp._id); // Delete Employee
            }
        }

        console.log('\nSUCCESS: Employee update complete.');
        process.exit(0);

    } catch (error) {
        console.error('CRITICAL ERROR:', error);
        process.exit(1);
    }
};

updateEmployees();
