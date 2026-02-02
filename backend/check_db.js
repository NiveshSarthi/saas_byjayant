const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');

const mongoURI = 'mongodb://root:vbPT5AthmBzfWQtaH2MOdbj6nx4d9TFUvmHIGm0htv43pNMEMwMbgby82bqiGhzx@72.61.248.175:5444/?directConnection=true';

async function checkDB() {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

    console.log('--- ROLES ---');
    const roles = await Role.find({});
    roles.forEach(r => console.log(`ID: ${r._id}, Name: "${r.name}"`));

    console.log('\n--- USERS ---');
    const users = await User.find({}).populate('role');
    users.forEach(u => console.log(`Email: ${u.email}, Role: "${u.role?.name}"`));

    process.exit(0);
}

checkDB();
