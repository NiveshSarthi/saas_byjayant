const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');

const mongoURI = 'mongodb://root:vbPT5AthmBzfWQtaH2MOdbj6nx4d9TFUvmHIGm0htv43pNMEMwMbgby82bqiGhzx@72.61.248.175:5444/?directConnection=true';

async function checkDB() {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

    const roles = await Role.find({});
    console.log('--- ROLES ---');
    roles.forEach(r => console.log(`- "${r.name}"`));

    const users = await User.find({}).populate('role');
    console.log('\n--- USERS ---');
    users.forEach(u => console.log(`- ${u.email}: "${u.role?.name}"`));

    process.exit(0);
}

checkDB();
