const Payroll = require('../models/Payroll');
const Deal = require('../models/Deal');
const PDFDocument = require('pdfkit');
const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const ExcelJS = require('exceljs');
const { calculatePayroll } = require('../services/payrollService');

const getPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find().populate('employee');
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate('employee');
    if (!payroll) return res.status(404).json({ message: 'Payroll not found' });
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createPayroll = async (req, res) => {
  try {
    const sanitize = (obj) => {
      if (Array.isArray(obj)) return obj.map(sanitize);
      if (obj !== null && typeof obj === 'object') {
        const cleaned = {};
        Object.keys(obj).forEach(key => { cleaned[key] = sanitize(obj[key]); });
        return cleaned;
      }
      if (typeof obj === 'number') {
        if (isNaN(obj) || !isFinite(obj)) return 0;
        return Math.round(obj * 100) / 100;
      }
      return obj;
    };

    const payrollData = sanitize(req.body);
    if (payrollData.employeeId && !payrollData.employee) {
      payrollData.employee = payrollData.employeeId;
    }

    const payroll = new Payroll(payrollData);
    await payroll.save();
    res.status(201).json(payroll);
  } catch (error) {
    console.error('Create Payroll Error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message, errors: error.errors });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updatePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!payroll) return res.status(404).json({ message: 'Payroll not found' });
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!payroll) return res.status(404).json({ message: 'Payroll not found' });
    res.json({ message: 'Payroll deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const calculateAndGetPayroll = async (req, res) => {
  try {
    const {
      employeeId, month, year, basicSalary, allowances, city,
      hra, conveyance, lta, medical, pf, gratuity, professionalTax, tds,
      incentives, performanceRewards, deductions
    } = req.body;
    const calculations = await calculatePayroll(employeeId, month, year, basicSalary, allowances, city, {
      hra, conveyance, lta, medical, pf, gratuity, professionalTax, tds,
      incentives, performanceRewards, deductions
    });
    res.json(calculations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const exportPayrollsPdf = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    let payrolls = await Payroll.find(query).populate('employee', 'department user').populate({
      path: 'employee',
      populate: { path: 'user', select: 'name' }
    });

    if (department) {
      payrolls = payrolls.filter(p => p.employee && p.employee.department === department);
    }

    const formatCurrency = (num) => {
      return '₹' + (num || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };

    const totalPayout = payrolls.reduce((sum, p) => sum + (p.total || 0), 0);

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; color: #1e293b; font-size: 10px; }
        .header { background-color: #1e293b; color: white; padding: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        .company-name { font-size: 20px; font-weight: bold; }
        .report-title { font-size: 14px; opacity: 0.9; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; table-layout: fixed; }
        th, td { border: 1px solid #e2e8f0; padding: 6px; text-align: left; overflow: hidden; text-overflow: ellipsis; }
        th { background-color: #f8fafc; font-weight: bold; font-size: 9px; }
        .amount { text-align: right; white-space: nowrap; }
        .employee-col { width: 100px; }
        .month-col { width: 60px; }
        .total-row { background-color: #f1f5f9; font-weight: bold; font-size: 11px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="company-name">SYNDITECH</div>
          <div class="report-title">Monthly Payroll Report</div>
        </div>
        <div style="text-align: right; font-size: 10px;">
          Generated on: ${new Date().toLocaleDateString()}<br>
          Records: ${payrolls.length}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th class="employee-col">Employee</th>
            <th class="month-col">Month/Year</th>
            <th class="amount">Basic</th>
            <th class="amount">HRA</th>
            <th class="amount">Conv</th>
            <th class="amount">Allow</th>
            <th class="amount">Incentives</th>
            <th class="amount">PF</th>
            <th class="amount">TDS</th>
            <th class="amount">Net Salary</th>
          </tr>
        </thead>
        <tbody>
          ${payrolls.map(p => `
            <tr>
              <td class="employee-col">${p.employee?.user?.name || 'N/A'}</td>
              <td class="month-col">${p.month}/${p.year}</td>
              <td class="amount">${formatCurrency(p.basicSalary)}</td>
              <td class="amount">${formatCurrency(p.hra)}</td>
              <td class="amount">${formatCurrency(p.conveyance)}</td>
              <td class="amount">${formatCurrency(p.allowances)}</td>
              <td class="amount" style="color: #10b981;">${formatCurrency(p.incentives)}</td>
              <td class="amount" style="color: #ef4444;">-${formatCurrency(p.pf)}</td>
              <td class="amount" style="color: #ef4444;">-${formatCurrency(p.tds)}</td>
              <td class="amount" style="font-weight: bold;">${formatCurrency(p.total)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="9" style="text-align: right;">TOTAL PAYOUT:</td>
            <td class="amount">${formatCurrency(totalPayout)}</td>
          </tr>
        </tfoot>
      </table>
      <div style="text-align: center; color: #94a3b8; font-size: 8px; margin-top: 30px;">
        Confidential Document - SYNDITECH Private Limited
      </div>
    </body>
    </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', 'attachment; filename="payroll_report.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF Export Error:', error);
    require('fs').appendFileSync('pdf_error.log', `${new Date().toISOString()} - ${error.stack}\n`);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error generating batch PDF', error: error.message });
    }
  }
};

const exportPayrollsCsv = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    let payrolls = await Payroll.find(query).populate('employee', 'name department');
    if (department) {
      payrolls = payrolls.filter(p => p.employee && p.employee.department === department);
    }
    const csvWriter = createCsvWriter({
      header: [
        { id: 'employee', title: 'Employee' },
        { id: 'month', title: 'Month' },
        { id: 'year', title: 'Year' },
        { id: 'basicSalary', title: 'Basic Salary' },
        { id: 'hra', title: 'HRA' },
        { id: 'conveyance', title: 'Conveyance' },
        { id: 'lta', title: 'LTA' },
        { id: 'medical', title: 'Medical' },
        { id: 'allowances', title: 'Other Allowances' },
        { id: 'incentives', title: 'Incentives' },
        { id: 'performanceRewards', title: 'Performance Rewards' },
        { id: 'pf', title: 'PF' },
        { id: 'gratuity', title: 'Gratuity' },
        { id: 'professionalTax', title: 'Professional Tax' },
        { id: 'tds', title: 'TDS' },
        { id: 'deductions', title: 'Other Deductions' },
        { id: 'total', title: 'Net Salary' }
      ]
    });
    const records = payrolls.map(p => ({
      employee: p.employee ? p.employee.name : 'N/A',
      month: p.month,
      year: p.year,
      basicSalary: p.basicSalary,
      hra: p.hra,
      conveyance: p.conveyance,
      lta: p.lta,
      medical: p.medical,
      allowances: p.allowances,
      incentives: p.incentives,
      performanceRewards: p.performanceRewards,
      pf: p.pf,
      gratuity: p.gratuity,
      professionalTax: p.professionalTax,
      tds: p.tds,
      deductions: p.deductions,
      total: p.total
    }));
    const csvString = await csvWriter.writeRecords(records);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=payrolls.csv');
    res.send(csvString);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const exportPayrollsExcel = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    let payrolls = await Payroll.find(query).populate('employee', 'name department user').populate({
      path: 'employee',
      populate: { path: 'user', select: 'name' }
    });
    if (department) {
      payrolls = payrolls.filter(p => p.employee && p.employee.department === department);
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll Records');

    // Add title
    worksheet.mergeCells('A1:Q1');
    worksheet.getCell('A1').value = 'SYNDITECH - Payroll Records';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Add headers matching user checklist
    const headers = [
      'Employee Name', 'Emp ID', 'Dept', 'Month', 'Year',
      'Basic Salary', 'HRA', 'Conveyance', 'Allowances',
      'Incentives', 'Rewards', 'Gross Salary',
      'PF (Emp)', 'ESI (Emp)', 'LWF (Emp)', 'PT', 'TDS', 'Total Deductions',
      'Net Salary',
      'PF (Empr)', 'ESI (Empr)', 'Bonus', 'Gratuity', 'Statutory Cost',
      'Total CTC'
    ];

    worksheet.addRow([]);
    worksheet.addRow(headers);

    // Style headers
    const headerRow = worksheet.getRow(3);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }
    };

    // Add data
    payrolls.forEach(p => {
      const row = [
        p.employee?.user?.name || 'N/A',
        p.employee?._id.toString().slice(-6).toUpperCase() || 'N/A',
        p.employee?.department || 'N/A',
        p.month,
        p.year,
        p.basicSalary || 0,
        p.hra || 0,
        p.conveyance || 0,
        p.allowances || 0,
        p.incentives || 0,
        p.performanceRewards || 0,
        p.grossSalary || 0,
        p.pf || 0,
        p.esi || 0,
        p.lwf || 0,
        p.professionalTax || 0,
        p.tds || 0,
        (p.pf || 0) + (p.esi || 0) + (p.lwf || 0) + (p.professionalTax || 0) + (p.tds || 0) + (p.deductions || 0),
        p.total || 0,
        p.employerSide?.pf || 0,
        p.employerSide?.esi || 0,
        p.bonus || 0,
        p.gratuity || 0,
        p.statutoryCost || 0,
        p.totalCTC || 0
      ];
      worksheet.addRow(row);
    });

    // Format currency columns (G to V)
    const currencyColumns = ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'];
    currencyColumns.forEach(col => {
      worksheet.getColumn(col).numFmt = '₹#,##0.00';
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 15;
    });

    // Add summary at the end
    const summaryRow = worksheet.rowCount + 2;
    worksheet.addRow([]);
    worksheet.addRow(['', '', '', '', '', 'Total Payout:', '', '', '', '', '', '', '', '', '', '', '', '', '', payrolls.reduce((sum, p) => sum + (p.total || 0), 0)]);
    worksheet.getCell(`T${summaryRow + 1}`).numFmt = '₹#,##0.00';
    worksheet.getCell(`F${summaryRow + 1}`).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=payroll_records.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Excel Export Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const exportSinglePayrollPdf = async (req, res) => {
  try {
    const p = await Payroll.findById(req.params.id)
      .populate('employee')
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'name email' }
      });

    if (!p) return res.status(404).json({ message: 'Payroll not found' });

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

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 20px;
          color: #1e293b;
          font-size: 12px;
          line-height: 1.4;
        }
        .header-bg {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          padding: 30px;
          margin-bottom: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          margin: 0;
          letter-spacing: 1px;
        }
        .company-info {
          font-size: 11px;
          opacity: 0.9;
          margin-top: 8px;
          line-height: 1.5;
        }

        .title {
          text-align: center;
          font-size: 22px;
          font-weight: bold;
          margin: 25px 0 15px 0;
          text-transform: uppercase;
          color: #1e293b;
          letter-spacing: 1px;
        }
        .subtitle {
          text-align: center;
          font-size: 13px;
          margin-bottom: 25px;
          color: #64748b;
          font-weight: 500;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border-radius: 6px;
          overflow: hidden;
        }
        th, td {
          border: 1px solid #e2e8f0;
          padding: 12px;
          text-align: left;
          vertical-align: middle;
        }
        th {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        .amount {
          text-align: right;
          white-space: nowrap;
          width: 120px;
          font-weight: 600;
          color: #059669;
        }
        .label {
          font-weight: 600;
          background-color: #f8fafc;
          width: 160px;
          color: #374151;
        }

        .net-salary-row {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: white;
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          padding: 20px;
          margin: 25px 0;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);
          letter-spacing: 1px;
        }

        .footer {
          text-align: center;
          font-style: italic;
          font-size: 10px;
          color: #94a3b8;
          margin-top: 60px;
          padding: 20px;
          border-top: 1px solid #e2e8f0;
          background-color: #f8fafc;
          border-radius: 6px;
        }
        .section-title {
          font-weight: bold;
          margin-bottom: 15px;
          font-size: 14px;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 8px;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        tfoot td {
          background-color: #f1f5f9;
          font-weight: bold;
          color: #374151;
        }
      </style>
    </head>
    <body>
      <div class="header-bg">
        <div class="company-name">SYNDITECH</div>
        <div class="company-info">
          PRIVATE LIMITED<br>
          Corporate Office: Tech Park, Sector 62, Noida, UP - 201301<br>
          Email: hr@synditech.com | Phone: +91-120-XXXXXXX
        </div>
      </div>

      <div class="title">Salary Slip</div>
      <div class="subtitle">For the month of ${monthName} ${p.year}</div>

      <div class="section-title">EMPLOYEE DETAILS</div>
      <table>
        <tr>
          <td class="label">Employee Name</td>
          <td>${p.employee?.user?.name || 'N/A'}</td>
          <td class="label">Employee ID</td>
          <td>${p.employee?._id.toString().slice(-6).toUpperCase() || 'N/A'}</td>
        </tr>
        <tr>
          <td class="label">Department</td>
          <td>${p.employee?.department || 'N/A'}</td>
          <td class="label">Position</td>
          <td>${p.employee?.position || 'N/A'}</td>
        </tr>
        <tr>
          <td class="label">Email</td>
          <td>${p.employee?.user?.email || 'N/A'}</td>
          <td class="label">Payroll Period</td>
          <td>${p.month}/${p.year}</td>
        </tr>
      </table>

      <div class="section-title">SALARY COMPONENTS</div>
      <table>
        <thead>
          <tr>
            <th>EARNINGS</th>
            <th class="amount">AMOUNT</th>
            <th>DEDUCTIONS</th>
            <th class="amount">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              <td>${row.eLabel}</td>
              <td class="amount">${row.eValue}</td>
              <td>${row.dLabel}</td>
              <td class="amount">${row.dValue}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="font-weight: bold; background-color: #f1f5f9;">
            <td>TOTAL EARNINGS</td>
            <td class="amount">${formatCurrency(p.grossSalary || 0)}</td>
            <td>TOTAL DEDUCTIONS</td>
            <td class="amount">${formatCurrency(totalDeductions)}</td>
          </tr>
        </tfoot>
      </table>

      <div class="net-salary-row">
        NET SALARY: ${formatCurrency(p.total)}
      </div>

      <div class="section-title">STATUTORY OBLIGATIONS (EMPLOYER SIDE)</div>
      <table>
        <tr>
          <td class="label">PF (Employer 12%)</td>
          <td class="amount">${formatCurrency(p.employerSide?.pf || 0)}</td>
          <td class="label">ESI (Employer 3.25%)</td>
          <td class="amount">${formatCurrency(p.employerSide?.esi || 0)}</td>
        </tr>
        <tr>
          <td class="label">Bonus (8.33%)</td>
          <td class="amount">${formatCurrency(p.bonus || 0)}</td>
          <td class="label">Gratuity (4.81%)</td>
          <td class="amount">${formatCurrency(p.gratuity || 0)}</td>
        </tr>
        <tr style="font-weight: bold; background-color: #f1f5f9;">
          <td colspan="3">TOTAL STATUTORY COST / CTC</td>
          <td class="amount">${formatCurrency(p.totalCTC || 0)}</td>
        </tr>
      </table>

      <div class="section-title">ATTENDANCE SUMMARY</div>
      <table>
        <tr>
          <td class="label">Working Days</td>
          <td class="amount">${p.presentDays || 0}</td>
          <td class="label">Late Arrivals</td>
          <td class="amount">${p.lateArrivals || 0}</td>
          <td class="label">Early Departures</td>
          <td class="amount">${p.earlyDepartures || 0}</td>
        </tr>
      </table>

      <div class="footer">
        This is a computer-generated salary slip and does not require a signature.<br>
        Generated on: ${new Date().toLocaleString('en-IN')}
      </div>
    </body>
    </html>
    `;

    const browser = await puppeteer.launch({
      headless: true, // Simplified headless flag
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent); // Removed waitUntil for faster, more reliable rendering

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    });

    await browser.close();

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Generated PDF buffer is empty');
    }

    const safeFilename = `salary_slip_${(p.employee?.user?.name || 'employee').replace(/[^a-zA-Z0-0]/g, '_')}_${p.month}_${p.year}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Single PDF Export Error:', error);
    // Log to a file if possible to help debugging
    try {
      require('fs').appendFileSync('pdf_error.log', `${new Date().toISOString()} - ${error.stack}\n`);
    } catch (e) { }

    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error generating PDF', error: error.message });
    }
  }
};

const exportSinglePayrollExcel = async (req, res) => {
  try {
    const p = await Payroll.findById(req.params.id)
      .populate('employee')
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'name email' }
      });

    if (!p) return res.status(404).json({ message: 'Payroll not found' });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Salary Slip');

    // Company Header
    worksheet.mergeCells('A1:D1');
    worksheet.getCell('A1').value = 'SYNDITECH PRIVATE LIMITED';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:D2');
    worksheet.getCell('A2').value = 'Salary Slip';
    worksheet.getCell('A2').font = { size: 14, bold: true };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A3:D3');
    const monthName = new Date(p.year, p.month - 1).toLocaleString('default', { month: 'long' });
    worksheet.getCell('A3').value = `For the month of ${monthName} ${p.year}`;
    worksheet.getCell('A3').alignment = { horizontal: 'center' };

    // Employee Details
    worksheet.addRow([]);
    worksheet.addRow(['Employee Details', '', '', '']);
    worksheet.getCell('A5').font = { bold: true };
    worksheet.mergeCells('A5:D5');

    worksheet.addRow(['Employee Name', p.employee?.user?.name || 'N/A', 'Employee ID', p.employee?._id || 'N/A']);
    worksheet.addRow(['Department', p.employee?.department || 'N/A', 'Position', p.employee?.position || 'N/A']);
    worksheet.addRow(['Email', p.employee?.user?.email || 'N/A', 'Month/Year', `${monthName} ${p.year}`]);

    // Earnings Section
    worksheet.addRow([]);
    worksheet.addRow(['EARNINGS', 'AMOUNT (₹)', '', '']);
    worksheet.getCell('A10').font = { bold: true };
    worksheet.mergeCells('A10:D10');

    const earnings = [
      ['Basic Salary', p.basicSalary || 0],
      ['House Rent Allowance (HRA)', p.hra || 0],
      ['Conveyance Allowance', p.conveyance || 0],
      ['LTA', p.lta || 0],
      ['Medical Allowance', p.medical || 0],
      ['Other Allowances', p.allowances || 0],
      ['Sales Incentives', p.incentives || 0],
      ['Performance Rewards', p.performanceRewards || 0]
    ];

    earnings.forEach(([label, value]) => {
      if (value > 0) {
        worksheet.addRow([label, value, '', '']);
      }
    });

    // Gross Salary
    worksheet.addRow(['', '', '', '']);
    worksheet.addRow(['GROSS SALARY', p.grossSalary || 0, '', '']);
    worksheet.getCell(worksheet.lastRow.getCell(1).address).font = { bold: true };

    // Deductions Section
    worksheet.addRow([]);
    worksheet.addRow(['DEDUCTIONS', 'AMOUNT (₹)', '', '']);
    worksheet.getCell(worksheet.lastRow.getCell(1).address).font = { bold: true };
    worksheet.mergeCells(worksheet.lastRow.getCell(1).address + ':' + worksheet.lastRow.getCell(4).address);

    const deductions = [
      ['Provident Fund (PF)', p.pf || 0],
      ['ESIC (Employee)', p.esi || 0],
      ['LWF (Employee)', p.lwf || 0],
      ['Professional Tax', p.professionalTax || 0],
      ['Tax (TDS)', p.tds || 0],
      ['Other Deductions', p.deductions || 0]
    ];

    deductions.forEach(([label, value]) => {
      if (value > 0) {
        worksheet.addRow([label, value, '', '']);
      }
    });

    // Net Salary
    worksheet.addRow(['', '', '', '']);
    worksheet.addRow(['NET SALARY', p.total || 0, '', '']);
    worksheet.getCell(worksheet.lastRow.getCell(1).address).font = { bold: true, size: 12 };

    // Footer
    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.mergeCells(worksheet.lastRow.getCell(1).address + ':' + worksheet.lastRow.getCell(4).address);
    worksheet.getCell(worksheet.lastRow.getCell(1).address).value = 'This is a system generated salary slip and does not require signature.';
    worksheet.getCell(worksheet.lastRow.getCell(1).address).font = { italic: true, size: 9 };
    worksheet.getCell(worksheet.lastRow.getCell(1).address).alignment = { horizontal: 'center' };

    // Styling
    worksheet.getColumn(2).numFmt = '₹#,##0.00';
    worksheet.getColumn(4).numFmt = '₹#,##0.00';

    // Set column widths
    worksheet.columns = [
      { width: 25 }, // A
      { width: 15 }, // B
      { width: 15 }, // C
      { width: 15 }  // D
    ];

    // Add borders to data sections
    const lastRow = worksheet.lastRow.number;
    for (let row = 5; row <= lastRow; row++) {
      for (let col = 1; col <= 4; col++) {
        const cell = worksheet.getCell(row, col);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    }

    const safeFilename = `salary_slip_${(p.employee?.user?.name || 'employee').replace(/[^a-zA-Z0-9]/g, '_')}_${p.month}_${p.year}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Single Excel Export Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPayrolls,
  getPayrollById,
  createPayroll,
  updatePayroll,
  deletePayroll,
  calculateAndGetPayroll,
  exportPayrollsPdf,
  exportPayrollsCsv,
  exportPayrollsExcel,
  exportSinglePayrollPdf,
  exportSinglePayrollExcel
};
