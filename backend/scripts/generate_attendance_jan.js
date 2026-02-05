const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/saas-hrms');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
};

const generateAttendance = async () => {
    await connectDB();

    try {
        // Clear existing Jan 2026 attendance
        const startJan = new Date('2026-01-01');
        const endJan = new Date('2026-01-31T23:59:59');
        await Attendance.deleteMany({
            date: { $gte: startJan, $lte: endJan }
        });
        console.log('Cleared existing January 2026 attendance records.');

        const employees = await Employee.find({});
        console.log(`Found ${employees.length} employees.`);

        const daysInJan = 31;
        const records = [];

        for (let day = 1; day <= daysInJan; day++) {
            const date = new Date(2026, 0, day); // Month is 0-indexed for Jan
            const dayOfWeek = date.getDay();

            // Skip Sundays (0)
            if (dayOfWeek === 0) continue;

            for (const emp of employees) {
                // Determine Attendance Scenario
                // 70% On Time, 10% Late, 10% Early Leave, 5% Half Day, 5% Absent
                const rand = Math.random();

                let checkInHour = 9;
                let checkInMin = Math.floor(Math.random() * 15); // 9:00 - 9:15
                let checkOutHour = 18;
                let checkOutMin = Math.floor(Math.random() * 30); // 18:00 - 18:30

                // Special Case Injection for Testing User Requirements

                // Case 1: Check-in 10-12 (1/4th Salary Cut)
                if (rand > 0.70 && rand <= 0.75) {
                    checkInHour = 10 + Math.floor(Math.random() * 2); // 10 or 11
                }
                // Case 2: Check-in 12-2 (Half Day)
                else if (rand > 0.75 && rand <= 0.80) {
                    checkInHour = 12 + Math.floor(Math.random() * 2); // 12 or 13
                }
                // Case 3: Check-in 2-4 (3/4th Salary Cut)
                else if (rand > 0.80 && rand <= 0.85) {
                    checkInHour = 14 + Math.floor(Math.random() * 2); // 14 or 15
                }
                // Case 4: Checkout 5-6 PM (1/4th Salary Cut) - applied to on-time checkins
                else if (rand > 0.85 && rand <= 0.90) {
                    checkOutHour = 17; // 5 PM
                    checkOutMin = Math.floor(Math.random() * 59);
                }
                // Case 5: Checkout 2-5 PM (Half Day)
                else if (rand > 0.90 && rand <= 0.95) {
                    checkOutHour = 14 + Math.floor(Math.random() * 3); // 14, 15, 16
                }
                // Case 6: Absent (No Record or very short hours)
                else if (rand > 0.95) {
                    continue; // Skip creating record = Absent
                }

                // Create Date Objects
                const checkInTime = new Date(date);
                checkInTime.setHours(checkInHour, checkInMin, 0);

                const checkOutTime = new Date(date);
                checkOutTime.setHours(checkOutHour, checkOutMin, 0);

                // Calculate working hours
                const diffMs = checkOutTime - checkInTime;
                const hours = diffMs / (1000 * 60 * 60);

                // Skip if negative hours (e.g. checked in after checkout time)
                if (hours <= 0) continue;

                records.push({
                    employee: emp._id,
                    date: date,
                    checkInTime: checkInTime,
                    checkOutTime: checkOutTime,
                    workingHours: hours,
                    checkInLocation: { lat: 28.6139, lng: 77.2090 }, // Delhi dummy
                    checkOutLocation: { lat: 28.6139, lng: 77.2090 }
                });
            }
        }

        await Attendance.insertMany(records);
        console.log(`Generated ${records.length} attendance records for Jan 2026.`);
        process.exit(0);

    } catch (error) {
        console.error('Error generating attendance:', error);
        process.exit(1);
    }
};

generateAttendance();
