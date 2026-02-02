const mongoose = require('mongoose');
const Document = require('./models/Document');
const Employee = require('./models/Employee');
const User = require('./models/User');

const mongoURI = 'mongodb://root:vbPT5AthmBzfWQtaH2MOdbj6nx4d9TFUvmHIGm0htv43pNMEMwMbgby82bqiGhzx@72.61.248.175:5444/?directConnection=true';

const seedDocs = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const employees = await Employee.find().populate('user');
        const vikram = employees.find(e => e.user.email === 'sales1@company.com');
        const sonia = employees.find(e => e.user.email === 'hr@company.com');
        const admin = await User.findOne({ email: 'admin@company.com' });

        if (!vikram || !sonia || !admin) {
            console.error('Missing required demo users/employees. Please run seed_all.js first.');
            process.exit(1);
        }

        const documents = [
            {
                name: 'Aadhar Card',
                type: 'Identity',
                filePath: 'uploads/demo/aadhar.pdf',
                employee: vikram._id,
                uploadedBy: admin._id
            },
            {
                name: 'PAN Card',
                type: 'Identity',
                filePath: 'uploads/demo/pan.pdf',
                employee: vikram._id,
                uploadedBy: admin._id
            },
            {
                name: 'Offer Letter',
                type: 'Contract',
                filePath: 'uploads/demo/offer.pdf',
                employee: vikram._id,
                uploadedBy: sonia.user._id
            },
            {
                name: 'Salary Slip - Dec 2025',
                type: 'Payroll',
                filePath: 'uploads/demo/slip_dec.pdf',
                employee: sonia._id,
                uploadedBy: admin._id
            }
        ];

        await Document.deleteMany({ filePath: { $regex: 'uploads/demo/' } });
        await Document.insertMany(documents);

        console.log('Demo documents seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedDocs();
