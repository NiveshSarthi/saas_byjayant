const mongoose = require('mongoose');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Require models to register them
require('./models/User');
require('./models/Employee');
const Payroll = require('./models/Payroll');

const mongoURI = 'mongodb://root:vbPT5AthmBzfWQtaH2MOdbj6nx4d9TFUvmHIGm0htv43pNMEMwMbgby82bqiGhzx@72.61.248.175:5444/?directConnection=true';

async function run() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(mongoURI);

        const id = '697f516c574b09bbf03f554c';
        console.log('Fetching payroll:', id);
        const p = await Payroll.findById(id)
            .populate('employee')
            .populate({
                path: 'employee',
                populate: { path: 'user', select: 'name email' }
            });

        if (!p) {
            console.error('Payroll not found');
            process.exit(1);
        }

        console.log('Fetched:', p.employee?.user?.name);

        const formatCurrency = (num) => {
            return '₹' + (num || 0).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        };

        const monthName = new Date(p.year, p.month - 1).toLocaleString('default', { month: 'long' });
        const earnings = [
            { label: 'Basic Salary', value: p.basicSalary || 0 },
            { label: 'House Rent Allowance (HRA)', value: p.hra || 0 },
            { label: 'Conveyance Allowance', value: p.conveyance || 0 },
            { label: 'Other Allowances', value: p.allowances || 0 },
            { label: 'Sales Incentives', value: p.incentives || 0 },
        ];
        if (p.performanceRewards > 0) earnings.push({ label: 'Performance Rewards', value: p.performanceRewards });

        const deductions = [
            { label: 'Provident Fund (PF)', value: p.pf || 0 },
            { label: 'ESIC (Employee)', value: p.esi || 0 },
            { label: 'LWF (Employee)', value: p.lwf || 0 },
            { label: 'Professional Tax', value: p.professionalTax || 0 },
            { label: 'Tax (TDS)', value: p.tds || 0 },
        ];
        const totalDeductions = deductions.reduce((sum, item) => sum + item.value, 0) + (p.deductions || 0);
        if (p.deductions > 0) deductions.push({ label: 'Other Deductions', value: p.deductions });

        const maxRows = Math.max(earnings.length, deductions.length);
        const rows = [];
        for (let i = 0; i < maxRows; i++) {
            rows.push({
                eLabel: earnings[i]?.label || '',
                eValue: earnings[i] ? formatCurrency(earnings[i].value) : '',
                dLabel: deductions[i]?.label || '',
                dValue: deductions[i] ? formatCurrency(deductions[i].value) : ''
            });
        }

        const htmlContent = `<html><body><h1>Test</h1></body></html>`; // Simplified for speed

        console.log('Launching Puppeteer...');
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        console.log('Setting content...');
        await page.setContent(htmlContent);

        console.log('Generating PDF...');
        const pdfBuffer = await page.pdf({ format: 'A4' });
        console.log('Generated buffer length:', pdfBuffer.length);

        await browser.close();
        fs.writeFileSync('full_test_debug.pdf', pdfBuffer);
        console.log('Success! Saved to full_test_debug.pdf');
        process.exit(0);
    } catch (err) {
        console.error('ERROR IN SIMULATION:', err);
        process.exit(1);
    }
}

run();
