const puppeteer = require('puppeteer');
const fs = require('fs');

async function test() {
    try {
        console.log('Starting puppeteer...');
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        console.log('Setting content...');
        await page.setContent('<h1>Test PDF</h1><p>If you see this, puppeteer is working.</p>');
        console.log('Generating PDF...');
        const pdfBuffer = await page.pdf({ format: 'A4' });
        console.log('Closing browser...');
        await browser.close();

        fs.writeFileSync('test_diag.pdf', pdfBuffer);
        console.log('PDF saved to test_diag.pdf. Size:', pdfBuffer.length);
    } catch (err) {
        console.error('DIAGNOSTIC FAILED:', err);
        process.exit(1);
    }
}

test();
