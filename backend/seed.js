const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Role = require('./models/Role');
require('dotenv').config();

const mongoURI = 'mongodb://root:vbPT5AthmBzfWQtaH2MOdbj6nx4d9TFUvmHIGm0htv43pNMEMwMbgby82bqiGhzx@72.61.248.175:5444/?directConnection=true';

const seedDatabase = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Create roles
    const roles = [
      { name: 'HR Manager', description: 'Human Resources' },
      { name: 'Employee', description: 'Employee' },
      { name: 'Admin', description: 'Administrator' },
      { name: 'Operations', description: 'Administration' },
      { name: 'Accounts', description: 'Accounts' },
    ];

    for (const roleData of roles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        await Role.create(roleData);
        console.log(`Role ${roleData.name} created`);
      }
    }

    // Create users
    const users = [
      { email: 'hr@company.com', password: 'password123', name: 'HR Manager', roleName: 'HR Manager' },
      { email: 'employee@company.com', password: 'password123', name: 'John Employee', roleName: 'Employee' },
      { email: 'admin@company.com', password: 'password123', name: 'Admin User', roleName: 'Admin' },
      { email: 'administration@company.com', password: 'password123', name: 'Admin Officer', roleName: 'Operations' },
      { email: 'accounts@company.com', password: 'password123', name: 'Accounts Manager', roleName: 'Accounts' },
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const role = await Role.findOne({ name: userData.roleName });
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await User.create({
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: role._id,
        });
        console.log(`User ${userData.email} created`);
      }
    }

    console.log('Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();