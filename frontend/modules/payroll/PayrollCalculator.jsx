import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@shared/Layout';
import Card from '@shared/Card';
import StatCard from '@shared/StatCard';
import CustomSelect from '@shared/CustomSelect';
import Button from '@shared/Button';
import { Icons } from '@shared/Icons';

const PayrollCalculator = () => {
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    grossSalary: "0",
    monthlyCtc: "0",
    payrollConfig: { basicPercent: 50, pfCapped: true, professionalTaxMode: 'Slab' },
    specialAllowance: "0",
    otherAllowance: "0",
    professionalTax: "0",
    variablePart: "0",
    category: 'Skilled'
  });

  const [historyFilter, setHistoryFilter] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setHistoryFilter({ ...historyFilter, [name]: value });
  };

  const [calculation, setCalculation] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [showLogic, setShowLogic] = useState(false);
  const [autoCalculate, setAutoCalculate] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchPayrolls();
    fetchPolicies();
  }, [historyFilter]);

  // No auto-calculation on change - Strictly via button click
  // useEffect removed logic as per Rule 3 & 4

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/hrms/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchPayrolls = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (historyFilter.month) queryParams.append('month', historyFilter.month);
      if (historyFilter.year) queryParams.append('year', historyFilter.year);

      const response = await axios.get(`/api/payroll?${queryParams.toString()}`);
      setPayrolls(response.data);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      if (error.response && error.response.status !== 500) {
        setPayrolls([]);
      }
    }
  };

  const fetchPolicies = async () => {
    try {
      const response = await axios.get('/api/sales-policy');
      setPolicies(response.data);
    } catch (error) {
      console.error('Error fetching policies:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Allow empty strings for typing, convert to number only when calculating
    let newFormData = { ...formData, [name]: value };

    if (name === 'employeeId') {
      const selectedEmployee = employees.find(emp => emp._id === value);
      if (selectedEmployee) {
        newFormData.category = selectedEmployee.category || 'Skilled';
        newFormData.grossSalary = selectedEmployee.salary?.toString() || "0";
      }
    }

    setFormData(newFormData);
  };

  const handleSetCalculation = (data) => {
    setCalculation({
      basicSalary: data.basicSalary ?? 0,
      hra: data.hra ?? 0,
      conveyance: data.conveyance ?? 0,
      allowances: data.allowances ?? 0,
      pf: data.pf ?? 0,
      esi: data.esi ?? 0,
      lwf: data.lwf ?? 0,
      bonus: data.bonus ?? 0,
      gratuity: data.gratuity ?? 0,
      professionalTax: data.professionalTax ?? 0,
      tds: data.tds ?? 0,
      incentives: data.incentives ?? 0,
      performanceRewards: data.performanceRewards ?? 0,
      deductions: data.deductions ?? 0,
      grossSalary: data.grossSalary ?? 0,
      totalCTC: data.totalCTC ?? 0,
      total: data.total ?? 0,
      employerSide: {
        pf: data.employerSide?.pf ?? 0,
        pfAdmin: data.employerSide?.pfAdmin ?? 0,
        esi: data.employerSide?.esi ?? 0,
        lwf: data.employerSide?.lwf ?? 0,
        bonus: data.employerSide?.bonus ?? 0,
        gratuity: data.employerSide?.gratuity ?? 0
      }
    });
  };

  const toggleEditMode = (field) => {
    setEditMode({ ...editMode, [field]: !editMode[field] });
  };

  const handleCalculate = async () => {
    try {
      const selectedEmployee = employees.find(emp => emp._id === formData.employeeId);
      if (!selectedEmployee) {
        alert('Please select an employee first');
        return;
      }

      // Call the strict backend API with current form values
      const requestData = {
        employeeId: formData.employeeId,
        month: Number(formData.month),
        year: Number(formData.year),
        grossSalary: Number(formData.grossSalary) || 0,
        specialAllowance: Number(formData.specialAllowance) || 0,
        otherAllowance: Number(formData.otherAllowance) || 0,
        professionalTax: Number(formData.professionalTax) || 0,
        variablePay: Number(formData.variablePart) || 0
      };

      const response = await axios.post('/api/payroll/calculate', requestData);
      const data = response.data;

      // Excel Structure Mapping (Match Revit02)
      setCalculation(data);
      setEditMode({}); // Reset edit modes on new calculation
      console.log('Excel Match Calculation:', data);
    } catch (error) {
      console.error('Error calculating payroll:', error);
      alert('Calculation failed. Check console.');
    }
  };

  // Local Recalculation after Manual Override
  const handleManualOverride = (path, value) => {
    const val = Number(value) || 0;
    const newCalc = { ...calculation };

    // Update the specific field
    if (path.includes('.')) {
      const [parent, child] = path.split('.');
      newCalc[parent][child] = val;
    } else {
      newCalc[path] = val;
    }

    // Recalculate Totals (Only those dependent on the changed field)
    // 1. Employee Deduction Total = PF + ESI + LWF + PT
    newCalc.deductions = Math.round(newCalc.pf + newCalc.esi + newCalc.lwf + newCalc.professionalTax);

    // 2. Net Salary = Gross - Deductions
    newCalc.total = Math.round(newCalc.grossSalary - newCalc.deductions);

    // 3. Statutory Cost = PF + admin + ESI + LWF + Bonus + Gratuity
    const esc = newCalc.employerSide;
    newCalc.statutoryCost = Math.round(esc.pf + esc.pfAdmin + esc.esi + esc.lwf + esc.bonus + esc.gratuity);

    // 4. Total CTC = Gross + Stat Cost + Variable
    newCalc.totalCTC = Math.round(newCalc.grossSalary + newCalc.statutoryCost + newCalc.variablePart);

    setCalculation(newCalc);
  };

  const handleSave = async () => {
    try {
      if (!calculation) {
        alert('Please calculate first');
        return;
      }

      // Deep clean data for MongoDB (remove NaN, Infinity, and round decimals)
      const cleanData = JSON.parse(JSON.stringify(calculation, (key, value) => {
        if (typeof value === 'number') {
          if (isNaN(value) || !isFinite(value)) return 0;
          return Math.round(value * 100) / 100;
        }
        return value;
      }));

      const response = await axios.post('/api/payroll', cleanData);
      fetchPayrolls();
      handleSetCalculation({}); // Reset calculation state using the handler
      setFormData({
        employeeId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        minimumWage: "1500",
        specialAllowance: "100",
        otherAllowance: "",
        targetGross: "",
        variablePart: "",
        category: 'Skilled',
        presentDays: "",
        lateArrivals: "",
        earlyDepartures: "",
        cv: "",
        numberOfSales: ""
      });
      setEditMode({});
      alert('Payroll saved successfully!');
    } catch (error) {
      console.error('Error saving payroll:', error);
      alert('Failed to save payroll');
    }
  };

  const exportToPDF = async (payrollId) => {
    try {
      const response = await axios.get(`/api/payroll/${payrollId}/export`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payroll_slip_${payrollId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF');
    }
  };



  // Update fetch to filter history (optional per user request, but good for consistency)
  // For now, user asked filters *while exporting*. But seeing filtered list helps.
  // We'll update fetchPayrolls to use these if you want, but sticking to export focus first.

  const exportToExcel = async (payrollId = null) => {
    try {
      let url;
      if (payrollId) {
        url = `/api/payroll/${payrollId}/excel`;
      } else {
        // Use filters
        const queryParams = new URLSearchParams();
        if (historyFilter.month) queryParams.append('month', historyFilter.month);
        if (historyFilter.year) queryParams.append('year', historyFilter.year);
        url = `/api/payroll/export/excel?${queryParams.toString()}`;
      }

      const response = await axios.get(url, {
        responseType: 'blob'
      });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      const filename = payrollId
        ? `salary_slip_${payrollId}.xlsx`
        : `Payroll_Report_${historyFilter.month ? historyFilter.month + '-' : ''}${historyFilter.year}.xlsx`;

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Failed to export Excel. Please try again.');
    }
  };

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
            Payroll Calculator
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Calculate employee payroll with automated formulas and manual overrides
          </p>
        </div>

        {/* Calculator Form */}
        <Card style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-2xl)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-lg)' }}>
            {/* Employee Selection */}
            <CustomSelect
              id="employeeId"
              name="employeeId"
              label="Employee"
              value={formData.employeeId}
              onChange={handleChange}
              options={employees.map(emp => ({
                value: emp._id,
                label: `${emp.user?.name || 'Unknown'} - ${emp.position || 'No Role'}`
              }))}
              placeholder="Select Employee"
            />

            {/* Month */}
            <div className="input-group">
              <label htmlFor="month">Month</label>
              <input
                id="month"
                type="number"
                name="month"
                value={formData.month}
                onChange={handleChange}
                min="1"
                max="12"
              />
            </div>

            {/* Year */}
            <div className="input-group">
              <label htmlFor="year">Year</label>
              <input
                id="year"
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
              />
            </div>

            {/* Category */}
            <div className="input-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Skilled">Skilled</option>
                <option value="Unskilled">Unskilled</option>
              </select>
            </div>

            {/* CTC Display (Read Only) */}
            <div className="input-group">
              <label>Monthly CTC (Assigned to Employee)</label>
              <input
                type="number"
                value={formData.monthlyCtc}
                readOnly
                style={{ backgroundColor: 'var(--bg-tertiary)', fontWeight: 'bold' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                To change this, edit the Employee profile.
              </p>
            </div>

            {/* Variable Part */}
            <div className="input-group">
              <label htmlFor="variablePart">Variable Part (Avg/Month)</label>
              <input
                id="variablePart"
                type="number"
                name="variablePart"
                value={formData.variablePart || "0"}
                onChange={handleChange}
                placeholder="Enter Monthly Variable Amount"
              />
            </div>

            {/* Other Allowance */}
            <div className="input-group">
              <label htmlFor="otherAllowance">Fixed Other Allowance</label>
              <input
                id="otherAllowance"
                type="number"
                name="otherAllowance"
                value={formData.otherAllowance || "0"}
                onChange={handleChange}
              />
            </div>

          </div>

          <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Button onClick={handleCalculate} variant="primary" style={{ minWidth: '200px' }}>
              Calculate Payroll
            </Button>

            <button
              className="btn-ghost"
              onClick={() => setShowLogic(!showLogic)}
              style={{ color: 'var(--accent-primary)', fontSize: '0.875rem' }}
            >
              {showLogic ? 'Hide Formula Logic' : 'How is this calculated?'}
            </button>
          </div>

          {showLogic && (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#F3F4F6', borderRadius: '8px', fontSize: '0.85rem' }}>
              <strong>CTC Reverse Calculation Logic:</strong>
              <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                <li><strong>Target Cost</strong> = CTC - Variable Part</li>
                <li><strong>Solver</strong> iteratively finds a <em>Gross Basic</em> such that: <br /><code>Gross + Employer Statutory Costs = Target Cost</code></li>
                <li><strong>Formulas:</strong>
                  <ul>
                    <li>Basic = {formData.payrollConfig?.basicPercent}% of Gross</li>
                    <li>PF (Employer) = 12% of Basic (Capped at 1800 if enabled)</li>
                    <li>PF Admin = 1% of Basic</li>
                    <li>ESI (Employer) = 3.25% of Gross</li>
                    <li>LWF (Employer) = 0.40% of Gross</li>
                    <li>Bonus = Max(8.33% of Basic, 7000)</li>
                    <li>Gratuity = 4.81% of Basic</li>
                  </ul>
                </li>
              </ul>
            </div>
          )}
        </Card>

        {/* Calculation Result */}
        {calculation && (
          <Card style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-2xl)', backgroundColor: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: 'var(--space-xs)' }}>
                  Payroll Breakdown
                </h2>
                <div className={`badge ${formData.category === 'Skilled' ? 'badge-info' : 'badge-warning'}`}>
                  {formData.category} Category
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Total CTC</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
                  ₹{calculation.totalCTC?.toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-2xl)' }}>
              {/* Earnings Column */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-xs)', borderBottom: '1px solid var(--border-subtle)' }}>
                  Earnings (Gross: ₹{calculation.grossSalary?.toLocaleString()})
                </h3>
                <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                  {['basicSalary', 'hra', 'conveyance', 'specialAllowance', 'otherAllowance'].map(field => (
                    <div key={field} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {field === 'basicSalary' ? 'Minimum Wages (BASIC+DA)' :
                          field === 'hra' ? 'HRA' :
                            field === 'conveyance' ? 'Conveyance' :
                              field === 'specialAllowance' ? 'Special Allowance' : 'Other Allowance'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        {editMode[field] ? (
                          <input
                            type="number"
                            value={calculation[field]}
                            onChange={(e) => handleManualOverride(field, e.target.value)}
                            style={{ width: '100px', fontSize: '0.875rem' }}
                          />
                        ) : (
                          <span style={{ fontWeight: '500' }}>₹{calculation[field]?.toLocaleString()}</span>
                        )}
                        <button onClick={() => toggleEditMode(field)} className="btn-ghost" style={{ padding: '2px', minWidth: 'auto' }}>
                          <Icons.Settings style={{ width: '14px', height: '14px' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--border-subtle)' }}>
                    <span>Total Gross Wage per month</span>
                    <span>₹{calculation.grossSalary?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Deductions Column */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-xs)', borderBottom: '1px solid var(--border-subtle)' }}>
                  Deductions
                </h3>
                <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                  {['pf', 'esi', 'lwf', 'professionalTax'].map(field => (
                    <div key={field} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {field === 'pf' ? 'PF Contribution (12%)' :
                          field === 'esi' ? 'ESIC (0.75%)' :
                            field === 'lwf' ? 'Employee LWF' : 'Professional Tax'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        {editMode[field] ? (
                          <input
                            type="number"
                            value={calculation[field]}
                            onChange={(e) => handleManualOverride(field, e.target.value)}
                            style={{ width: '100px', fontSize: '0.875rem' }}
                          />
                        ) : (
                          <span style={{ color: '#EF4444' }}>-₹{calculation[field]?.toLocaleString()}</span>
                        )}
                        <button onClick={() => toggleEditMode(field)} className="btn-ghost" style={{ padding: '2px', minWidth: 'auto' }}>
                          <Icons.Settings style={{ width: '14px', height: '14px' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--border-subtle)' }}>
                    <span>Employees deduction</span>
                    <span style={{ color: '#EF4444' }}>₹{calculation.deductions?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1em', color: 'var(--accent-primary)', marginTop: 'var(--space-sm)' }}>
                    <span>Net Salary in Hand</span>
                    <span>₹{calculation.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-2xl)', paddingTop: 'var(--space-xl)', borderTop: '2px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-xl)' }}>
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)', textTransform: 'uppercase' }}>
                  Statutory obligation on Minimum wages
                </h3>
                <div style={{ display: 'grid', gap: 'var(--space-sm)', fontSize: '0.875rem' }}>
                  {[
                    { label: 'PF 12% on Basic + DA', field: 'employerSide.pf' },
                    { label: 'PF Admin Charges', field: 'employerSide.pfAdmin' },
                    { label: 'ESI (3.25% on Gross)', field: 'employerSide.esi' },
                    { label: 'LWF', field: 'employerSide.lwf' },
                    { label: 'Bonus (8.33%)', field: 'employerSide.bonus' },
                    { label: 'Gratuity (4.81%)', field: 'employerSide.gratuity' }
                  ].map(item => (
                    <div key={item.field} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        {editMode[item.field] ? (
                          <input
                            type="number"
                            value={item.field.includes('.') ? calculation.employerSide[item.field.split('.')[1]] : calculation[item.field]}
                            onChange={(e) => handleManualOverride(item.field, e.target.value)}
                            style={{ width: '80px', fontSize: '0.75rem' }}
                          />
                        ) : (
                          <span>₹{(item.field.includes('.') ? calculation.employerSide[item.field.split('.')[1]] : calculation[item.field]).toLocaleString()}</span>
                        )}
                        <button onClick={() => toggleEditMode(item.field)} className="btn-ghost" style={{ padding: '2px', minWidth: 'auto' }}>
                          <Icons.Settings style={{ width: '12px', height: '12px' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--border-subtle)' }}>
                    <span>Statutory Cost</span>
                    <span>₹{calculation.statutoryCost?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(255, 122, 24, 0.1)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)' }}>Net Salary in Hand</span>
                <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-primary)' }}>₹{calculation.total?.toLocaleString()}</span>
              </div>
            </div>

            {/* CTC Breakdown */}
            <div style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-lg)', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                {/* LEFT: CTC & VARIABLE */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 'var(--space-lg)' }}>
                    CTC SUMMARY
                  </h3>
                  <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>CTC of Employee</span>
                      <span style={{ fontWeight: '500' }}>₹{(calculation.grossSalary + calculation.statutoryCost)?.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Variable Part</span>
                      <span style={{ fontWeight: '500' }}>₹{calculation.variablePart?.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1em', paddingTop: 'var(--space-sm)', borderTop: '2px solid var(--border-subtle)' }}>
                      <span>Total CTC of Employee</span>
                      <span>₹{calculation.totalCTC?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT: INCENTIVE & ATTENDANCE DETAILS */}
                <div style={{ borderLeft: '1px solid #ddd', paddingLeft: '20px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 'var(--space-lg)' }}>
                    PERFORMANCE & ATTENDANCE
                  </h3>

                  {/* INCENTIVES */}
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>
                      INCENTIVES ({calculation.incentiveDetails?.salesCount || 0} Sales)
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>Unlocked (Paid):</span>
                      <span style={{ color: '#10B981', fontWeight: 'bold' }}>₹{calculation.incentiveDetails?.unlockedAmount || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>Locked (Future):</span>
                      <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>₹{calculation.incentiveDetails?.lockedAmount || 0}</span>
                    </div>
                    {calculation.incentiveDetails?.managerCommission > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Manager Comm.:</span>
                        <span style={{ color: '#8B5CF6', fontWeight: 'bold' }}>₹{calculation.incentiveDetails?.managerCommission || 0}</span>
                      </div>
                    )}
                  </div>

                  {/* ATTENDANCE */}
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>
                      ATTENDANCE BREAKDOWN
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', fontSize: '0.8rem' }}>
                      <div>Present: {calculation.attendanceDetails?.presentDays || 0}</div>
                      <div>W-Off: {calculation.attendanceDetails?.weeklyOffs || 0}</div>
                      <div>Leaves: {calculation.attendanceDetails?.leaves || 0}</div>
                      <div>Late: {calculation.attendanceDetails?.lateMarks || 0}</div>
                    </div>
                    <div style={{ marginTop: '5px', borderTop: '1px dashed #ccc', paddingTop: '5px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <span>Paid Days:</span>
                      <span>{calculation.attendanceDetails?.paidDays || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)' }}>
              <Button onClick={handleSave} variant="primary">
                Save Payroll Records
              </Button>
              <Button onClick={() => setCalculation(null)} variant="ghost">
                Reset
              </Button>
            </div>
          </Card>
        )}

        {/* Payroll History */}
        <Card style={{ padding: 'var(--space-2xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Payroll History</h2>
            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>

              {/* History Filters */}
              <select
                name="month"
                value={historyFilter.month}
                onChange={handleFilterChange}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="">All Months</option>
                {[...Array(12).keys()].map(i => (
                  <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'short' })}</option>
                ))}
              </select>
              <input
                type="number"
                name="year"
                value={historyFilter.year}
                onChange={handleFilterChange}
                placeholder="Year"
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  width: '80px'
                }}
              />

              <Button onClick={() => exportToExcel()} variant="secondary">
                <Icons.Download /> Export History (Excel)
              </Button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ fontSize: '0.75rem' }}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month/Year</th>
                  <th>CTC</th>
                  <th>Basic</th>
                  <th>HRA</th>
                  <th>Conv.</th>
                  <th title="ESIC (Employee)">ESI</th>
                  <th title="LWF (Employee)">LWF</th>
                  <th>PF</th>
                  <th>Net</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map(payroll => (
                  <tr key={payroll._id}>
                    <td>{payroll.employee?.user?.name || 'N/A'}</td>
                    <td>{payroll.month}/{payroll.year}</td>
                    <td style={{ fontWeight: '600' }}>₹{(payroll.totalCTC || 0).toLocaleString()}</td>
                    <td>₹{(payroll.basicSalary || 0).toLocaleString()}</td>
                    <td>₹{(payroll.hra || 0).toLocaleString()}</td>
                    <td>₹{(payroll.conveyance || 0).toLocaleString()}</td>
                    <td style={{ color: '#EF4444' }}>₹{(payroll.esi || 0).toLocaleString()}</td>
                    <td style={{ color: '#EF4444' }}>₹{(payroll.lwf || 0).toLocaleString()}</td>
                    <td style={{ color: '#EF4444' }}>-₹{(payroll.pf || 0).toLocaleString()}</td>
                    <td style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-primary)' }}>₹{(payroll.total || 0).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${payroll.isLocked ? 'badge-success' : 'badge-warning'}`}>
                        {payroll.isLocked ? 'Locked' : 'Open'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                        <button
                          onClick={() => exportToPDF(payroll._id)}
                          className="btn-ghost"
                          style={{ padding: 'var(--space-xs)', minWidth: 'auto' }}
                          title="Export PDF"
                        >
                          <Icons.FileText />
                        </button>
                        <button
                          onClick={() => exportToExcel(payroll._id)}
                          className="btn-ghost"
                          style={{ padding: 'var(--space-xs)', minWidth: 'auto' }}
                          title="Export Excel"
                        >
                          <Icons.Download />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default PayrollCalculator;
