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
    ctc: 0, // Base CTC
    variablePart: 0,
    category: 'Skilled',
    basicSalary: 0,
    hra: 0,
    conveyance: 0,
    lta: 0,
    medical: 0,
    pf: 0,
    esi: 0,
    lwf: 0,
    bonus: 0,
    gratuity: 0,
    professionalTax: 0,
    tds: 0,
    allowances: 0,
    incentives: 0,
    performanceRewards: 0,
    deductions: 0,
    presentDays: 0,
    lateArrivals: 0,
    earlyDepartures: 0,
    cv: 0,
    numberOfSales: 0,
    city: 'Metro'
  });
  const [calculation, setCalculation] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [autoCalculate, setAutoCalculate] = useState(true);

  useEffect(() => {
    fetchEmployees();
    fetchPayrolls();
    fetchPolicies();
  }, []);

  // Reactive calculation
  useEffect(() => {
    if (autoCalculate && formData.employeeId && formData.basicSalary > 0) {
      handleCalculate();
    }
  }, [formData.basicSalary, formData.employeeId, formData.city, autoCalculate, formData.numberOfSales, formData.cv]);

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
      const response = await axios.get('/api/payroll');
      setPayrolls(response.data);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
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
    let val = (name === 'employeeId' || name === 'city' || name === 'category') ? value : (parseFloat(value) || 0);

    let newFormData = { ...formData, [name]: val };

    if (name === 'employeeId' || name === 'month' || name === 'year') {
      const daysInMonth = new Date(newFormData.year, newFormData.month, 0).getDate();
      if (name === 'month' || name === 'year' || !newFormData.presentDays) {
        newFormData.presentDays = daysInMonth;
      }

      if (name === 'employeeId') {
        const selectedEmployee = employees.find(emp => emp._id === value);
        if (selectedEmployee) {
          newFormData.ctc = selectedEmployee.salary || 0;
          newFormData.category = selectedEmployee.category || 'Skilled';
        }
      }
    }

    setFormData(newFormData);
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

      const ctc = formData.ctc;
      const category = formData.category;
      const minWage = category === 'Skilled' ? 15472 : 11275;
      const basic = minWage;

      // Employer Side
      const empPF = (basic * 0.12);
      const empPFAdmin = (basic * 0.01);
      const empGratuity = (basic * 0.0481);
      const empBonus = (basic * 0.0833);
      const empLWF = category === 'Skilled' ? 68 : 48;

      let gross = ctc - (empPF + empPFAdmin + empGratuity + empBonus + empLWF);
      let empESI = 0;
      let employeeESI = 0;

      if (gross <= 21000) {
        gross = (ctc - (empPF + empPFAdmin + empGratuity + empBonus + empLWF)) / 1.0325;
        empESI = gross * 0.0325;
        employeeESI = gross * 0.0075;
      }

      const statutoryCost = empPF + empPFAdmin + empESI + empLWF + empBonus + empGratuity;

      const hra = category === 'Skilled' ? basic * 0.5 : (gross - basic > 800 ? 836 : 0);
      const conveyance = category === 'Skilled' ? basic * 0.15 : 0;
      const specialAllowance = 1000;
      const otherAllowance = Math.max(0, gross - (basic + hra + conveyance + specialAllowance));

      const employeePF = basic * 0.12;
      const employeeLWF = category === 'Skilled' ? 34 : 24;

      let calculatedData = {
        ...formData,
        basicSalary: basic,
        hra: editMode.hra ? formData.hra : hra,
        conveyance: editMode.conveyance ? formData.conveyance : conveyance,
        allowances: editMode.allowances ? formData.allowances : (specialAllowance + otherAllowance),
        pf: editMode.pf ? formData.pf : employeePF,
        esi: employeeESI,
        lwf: employeeLWF,
        bonus: empBonus,
        gratuity: empGratuity,
        grossSalary: gross,
        statutoryCost,
        totalCTC: ctc + formData.variablePart,
        employerSide: {
          pf: empPF,
          pfAdmin: empPFAdmin,
          esi: empESI,
          lwf: empLWF,
          bonus: empBonus,
          gratuity: empGratuity
        }
      };

      // TDS Calculation
      if (autoCalculate && !editMode.tds) {
        const annualIncome = (ctc + formData.variablePart) * 12;
        if (annualIncome <= 250000) calculatedData.tds = 0;
        else if (annualIncome <= 500000) calculatedData.tds = ((annualIncome - 250000) * 0.05) / 12;
        else if (annualIncome <= 1000000) calculatedData.tds = (12500 + (annualIncome - 500000) * 0.2) / 12;
        else calculatedData.tds = (112500 + (annualIncome - 1000000) * 0.3) / 12;
      }

      // Sales Incentives (Local Preview) - Strict Policy Rev 08.01.2026
      if (!editMode.incentives && formData.cv > 0) {
        // We'll use the user provided 'numberOfSales' and 'cv'
        // But the unlock logic (Sale N+1) is hard to show instantly without deal history
        // For preview, we show the potential for the current CV
        const revenueRatio = 0.006; // Assume normal for preview if not specified
        let rate = 0;
        if (revenueRatio > 0.005) rate = 0.0025;
        else if (revenueRatio >= 0.0025) rate = 0.0010;

        calculatedData.incentives = rate * formData.cv;
      }

      // Salary Reward (Local Preview)
      if (!editMode.performanceRewards && formData.numberOfSales >= 3) {
        calculatedData.performanceRewards = basic * 0.5;
      }

      // Detailed Attendance Deductions
      const daysInMonth = new Date(formData.year, formData.month, 0).getDate();
      const dailySalary = gross / daysInMonth;

      const absentDays = daysInMonth - formData.presentDays;
      const penaltyDays = (formData.lateArrivals * 0.25) + (formData.earlyDepartures * 0.25);
      const totalDeductionDays = absentDays + penaltyDays;

      calculatedData.deductions = (formData.deductions || 0) + (totalDeductionDays * dailySalary);

      // Net Total: Gross + Incentives + Rewards - Deductions (Tax, Statutory, Attendance)
      let total = (gross + calculatedData.incentives + calculatedData.performanceRewards) - (calculatedData.pf + calculatedData.esi + calculatedData.lwf + calculatedData.tds + calculatedData.professionalTax + (totalDeductionDays * dailySalary));

      calculatedData.total = Math.max(0, total);

      setCalculation(calculatedData);
      console.log('Calculation updated:', calculatedData);
    } catch (error) {
      console.error('Error calculating payroll:', error);
      alert('Check console for calculation errors');
    }
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
      setCalculation(null);
      setFormData({
        employeeId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        ctc: 0,
        variablePart: 0,
        category: 'Skilled',
        basicSalary: 0,
        hra: 0,
        pf: 0,
        esi: 0,
        lwf: 0,
        bonus: 0,
        gratuity: 0,
        allowances: 0,
        incentives: 0,
        performanceRewards: 0,
        deductions: 0,
        presentDays: 0,
        lateArrivals: 0,
        earlyDepartures: 0,
        cv: 0,
        numberOfSales: 0,
        city: 'Metro'
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

  const exportToExcel = async (payrollId = null) => {
    try {
      const url = payrollId ? `/api/payroll/${payrollId}/excel` : '/api/payroll/export/excel';
      const response = await axios.get(url, {
        responseType: 'blob'
      });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', payrollId ? `salary_slip_${payrollId}.xlsx` : `payroll_records_${new Date().toLocaleDateString()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Failed to export Excel');
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

            {/* CTC / Monthly Base */}
            <div className="input-group">
              <label htmlFor="ctc">Monthly Base / CTC</label>
              <input
                id="ctc"
                type="number"
                name="ctc"
                value={formData.ctc}
                onChange={handleChange}
                placeholder="Enter CTC amount"
              />
            </div>

            {/* Variable Part */}
            <div className="input-group">
              <label htmlFor="variablePart">Variable Part</label>
              <input
                id="variablePart"
                type="number"
                name="variablePart"
                value={formData.variablePart}
                onChange={handleChange}
                placeholder="Enter variable amount"
              />
            </div>

            {/* City */}
            <div className="input-group">
              <label htmlFor="city">City Type</label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
              >
                <option value="Metro">Metro</option>
                <option value="Non-Metro">Non-Metro</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-xl)', borderTop: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-lg)' }}>
              Manual Overrides (Components auto-filled from CTC)
            </h3>

            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
              {/* Basic Salary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label htmlFor="basicSalary">Basic Salary</label>
                  <input
                    id="basicSalary"
                    type="number"
                    name="basicSalary"
                    value={formData.basicSalary}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Conveyance with Edit Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label htmlFor="conveyance">Conveyance (Auto: ₹1,600)</label>
                  <input
                    id="conveyance"
                    type="number"
                    name="conveyance"
                    value={calculation?.conveyance || formData.conveyance}
                    onChange={handleChange}
                    disabled={!editMode.conveyance}
                    style={{ opacity: editMode.conveyance ? 1 : 0.7 }}
                  />
                </div>
                <button
                  onClick={() => toggleEditMode('conveyance')}
                  className="btn-ghost"
                  style={{ padding: 'var(--space-sm)', minWidth: 'auto' }}
                  title="Toggle manual edit"
                >
                  <Icons.Settings />
                </button>
              </div>

              {/* LTA with Edit Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label htmlFor="lta">LTA (Auto: 1 month basic)</label>
                  <input
                    id="lta"
                    type="number"
                    name="lta"
                    value={calculation?.lta || formData.lta}
                    onChange={handleChange}
                    disabled={!editMode.lta}
                    style={{ opacity: editMode.lta ? 1 : 0.7 }}
                  />
                </div>
                <button
                  onClick={() => toggleEditMode('lta')}
                  className="btn-ghost"
                  style={{ padding: 'var(--space-sm)', minWidth: 'auto' }}
                  title="Toggle manual edit"
                >
                  <Icons.Settings />
                </button>
              </div>

              {/* Medical with Edit Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label htmlFor="medical">Medical (Auto: ₹4,167)</label>
                  <input
                    id="medical"
                    type="number"
                    name="medical"
                    value={calculation?.medical || formData.medical}
                    onChange={handleChange}
                    disabled={!editMode.medical}
                    style={{ opacity: editMode.medical ? 1 : 0.7 }}
                  />
                </div>
                <button
                  onClick={() => toggleEditMode('medical')}
                  className="btn-ghost"
                  style={{ padding: 'var(--space-sm)', minWidth: 'auto' }}
                  title="Toggle manual edit"
                >
                  <Icons.Settings />
                </button>
              </div>

              {/* PF with Edit Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label htmlFor="pf">PF (Employee)</label>
                  <input
                    id="pf"
                    type="number"
                    name="pf"
                    value={calculation?.pf || formData.pf}
                    onChange={handleChange}
                    disabled={!editMode.pf}
                    style={{ opacity: editMode.pf ? 1 : 0.7 }}
                  />
                </div>
                <button
                  onClick={() => toggleEditMode('pf')}
                  className="btn-ghost"
                  style={{ padding: 'var(--space-sm)', minWidth: 'auto' }}
                  title="Toggle manual edit"
                >
                  <Icons.Settings />
                </button>
              </div>

              {/* ESIC with Edit Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label htmlFor="esi">ESIC (Employee)</label>
                  <input
                    id="esi"
                    type="number"
                    name="esi"
                    value={calculation?.esi || formData.esi}
                    onChange={handleChange}
                    disabled={!editMode.esi}
                    style={{ opacity: editMode.esi ? 1 : 0.7 }}
                  />
                </div>
                <button
                  onClick={() => toggleEditMode('esi')}
                  className="btn-ghost"
                  style={{ padding: 'var(--space-sm)', minWidth: 'auto' }}
                  title="Toggle manual edit"
                >
                  <Icons.Settings />
                </button>
              </div>

              {/* LWF with Edit Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label htmlFor="lwf">LWF (Employee)</label>
                  <input
                    id="lwf"
                    type="number"
                    name="lwf"
                    value={calculation?.lwf || formData.lwf}
                    onChange={handleChange}
                    disabled={!editMode.lwf}
                    style={{ opacity: editMode.lwf ? 1 : 0.7 }}
                  />
                </div>
                <button
                  onClick={() => toggleEditMode('lwf')}
                  className="btn-ghost"
                  style={{ padding: 'var(--space-sm)', minWidth: 'auto' }}
                  title="Toggle manual edit"
                >
                  <Icons.Settings />
                </button>
              </div>

              {/* Professional Tax with Edit Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label htmlFor="professionalTax">Professional Tax (Auto-calc)</label>
                  <input
                    id="professionalTax"
                    type="number"
                    name="professionalTax"
                    value={calculation?.professionalTax || formData.professionalTax}
                    onChange={handleChange}
                    disabled={!editMode.professionalTax}
                    style={{ opacity: editMode.professionalTax ? 1 : 0.7 }}
                  />
                </div>
                <button
                  onClick={() => toggleEditMode('professionalTax')}
                  className="btn-ghost"
                  style={{ padding: 'var(--space-sm)', minWidth: 'auto' }}
                  title="Toggle manual edit"
                >
                  <Icons.Settings />
                </button>
              </div>

              {/* TDS with Edit Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label htmlFor="tds">TDS (Auto-calc)</label>
                  <input
                    id="tds"
                    type="number"
                    name="tds"
                    value={calculation?.tds || formData.tds}
                    onChange={handleChange}
                    disabled={!editMode.tds}
                    style={{ opacity: editMode.tds ? 1 : 0.7 }}
                  />
                </div>
                <button
                  onClick={() => toggleEditMode('tds')}
                  className="btn-ghost"
                  style={{ padding: 'var(--space-sm)', minWidth: 'auto' }}
                  title="Toggle manual edit"
                >
                  <Icons.Settings />
                </button>
              </div>

              {/* Allowances with Edit Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label htmlFor="allowances">Other Allowances</label>
                  <input
                    id="allowances"
                    type="number"
                    name="allowances"
                    value={formData.allowances}
                    onChange={handleChange}
                    disabled={!editMode.allowances}
                    style={{ opacity: editMode.allowances ? 1 : 0.7 }}
                  />
                </div>
                <button
                  onClick={() => toggleEditMode('allowances')}
                  className="btn-ghost"
                  style={{ padding: 'var(--space-sm)', minWidth: 'auto' }}
                  title="Toggle manual edit"
                >
                  <Icons.Settings />
                </button>
              </div>

              {/* Deductions with Edit Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label htmlFor="deductions">Manual Deductions</label>
                  <input
                    id="deductions"
                    type="number"
                    name="deductions"
                    value={formData.deductions}
                    onChange={handleChange}
                    disabled={!editMode.deductions}
                    style={{ opacity: editMode.deductions ? 1 : 0.7 }}
                  />
                </div>
                <button
                  onClick={() => toggleEditMode('deductions')}
                  className="btn-ghost"
                  style={{ padding: 'var(--space-sm)', minWidth: 'auto' }}
                  title="Toggle manual edit"
                >
                  <Icons.Settings />
                </button>
              </div>

              {/* Attendance Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)' }}>
                <div className="input-group">
                  <label htmlFor="presentDays">Present Days</label>
                  <input
                    id="presentDays"
                    type="number"
                    name="presentDays"
                    value={formData.presentDays}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="lateArrivals">Days Late</label>
                  <input
                    id="lateArrivals"
                    type="number"
                    name="lateArrivals"
                    value={formData.lateArrivals}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="earlyDepartures">Days Early Quit</label>
                  <input
                    id="earlyDepartures"
                    type="number"
                    name="earlyDepartures"
                    value={formData.earlyDepartures}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sales Specific Fields */}
          <div style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-xl)', borderTop: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-lg)' }}>
              Sales Incentives (For Sales Employees)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-lg)' }}>
              <div className="input-group">
                <label htmlFor="numberOfSales">Number of Sales</label>
                <input
                  id="numberOfSales"
                  type="number"
                  name="numberOfSales"
                  value={formData.numberOfSales}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label htmlFor="cv">CV (Consideration Value)</label>
                <input
                  id="cv"
                  type="number"
                  name="cv"
                  value={formData.cv}
                  onChange={handleChange}
                  placeholder="Enter CV amount"
                />
              </div>

              {/* Incentives with Edit Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label htmlFor="incentives">Incentives (Auto-calculated)</label>
                  <input
                    id="incentives"
                    type="number"
                    name="incentives"
                    value={calculation?.incentives || formData.incentives}
                    onChange={handleChange}
                    disabled={!editMode.incentives}
                    style={{ opacity: editMode.incentives ? 1 : 0.7 }}
                  />
                </div>
                <button
                  onClick={() => toggleEditMode('incentives')}
                  className="btn-ghost"
                  style={{ padding: 'var(--space-sm)', minWidth: 'auto' }}
                  title="Toggle manual edit"
                >
                  <Icons.Settings />
                </button>
              </div>

              {/* Performance Rewards with Edit Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label htmlFor="performanceRewards">Performance Rewards</label>
                  <input
                    id="performanceRewards"
                    type="number"
                    name="performanceRewards"
                    value={calculation?.performanceRewards || formData.performanceRewards}
                    onChange={handleChange}
                    disabled={!editMode.performanceRewards}
                    style={{ opacity: editMode.performanceRewards ? 1 : 0.7 }}
                  />
                </div>
                <button
                  onClick={() => toggleEditMode('performanceRewards')}
                  className="btn-ghost"
                  style={{ padding: 'var(--space-sm)', minWidth: 'auto' }}
                  title="Toggle manual edit"
                >
                  <Icons.Settings />
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)' }}>
            <Button onClick={handleCalculate} variant="primary">
              Calculate Payroll
            </Button>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoCalculate}
                onChange={(e) => setAutoCalculate(e.target.checked)}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Auto-calculate all fields
              </span>
            </label>
          </div>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Minimum Wages (Basic+DA)</span>
                    <span style={{ fontWeight: '500' }}>₹{calculation.basicSalary.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>HRA</span>
                    <span style={{ fontWeight: '500' }}>₹{calculation.hra.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Conveyance</span>
                    <span style={{ fontWeight: '500' }}>₹{calculation.conveyance.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Other Allowances</span>
                    <span style={{ fontWeight: '500' }}>₹{calculation.allowances.toLocaleString()}</span>
                  </div>
                  {calculation.incentives > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-primary)' }}>
                      <span>Sales Incentives</span>
                      <span style={{ fontWeight: '600' }}>₹{calculation.incentives.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Deductions Column */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-xs)', borderBottom: '1px solid var(--border-subtle)' }}>
                  Deductions
                </h3>
                <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>PF (Employee)</span>
                    <span style={{ color: '#EF4444' }}>-₹{calculation.pf.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>ESIC (0.75%)</span>
                    <span style={{ color: '#EF4444' }}>-₹{calculation.esi?.toLocaleString() || '0'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>LWF (Employee)</span>
                    <span style={{ color: '#EF4444' }}>-₹{calculation.lwf?.toLocaleString() || '0'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>TDS</span>
                    <span style={{ color: '#EF4444' }}>-₹{calculation.tds.toLocaleString()}</span>
                  </div>
                  {calculation.deductions > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Attendance Deductions</span>
                      <span style={{ color: '#EF4444' }}>-₹{calculation.deductions.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-2xl)', paddingTop: 'var(--space-xl)', borderTop: '2px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-xl)' }}>
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)', textTransform: 'uppercase' }}>
                  Statutory Obligations (Employer)
                </h3>
                <div style={{ display: 'grid', gap: 'var(--space-sm)', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>PF & Admin (13%)</span>
                    <span>₹{(calculation.employerSide?.pf + calculation.employerSide?.pfAdmin).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>ESI (3.25%)</span>
                    <span>₹{calculation.employerSide?.esi.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Bonus (8.33%)</span>
                    <span>₹{calculation.employerSide?.bonus.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Gratuity (4.81%)</span>
                    <span>₹{calculation.employerSide?.gratuity.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(255, 122, 24, 0.1)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)' }}>Net Salary in Hand</span>
                <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-primary)' }}>₹{calculation.total.toLocaleString()}</span>
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
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
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
                  <th>Inc.</th>
                  <th>Rew.</th>
                  <th>PF</th>
                  <th>PT</th>
                  <th>TDS</th>
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
                    <td>₹{payroll.basicSalary.toLocaleString()}</td>
                    <td>₹{payroll.hra.toLocaleString()}</td>
                    <td>₹{payroll.conveyance.toLocaleString()}</td>
                    <td style={{ color: '#EF4444' }}>₹{(payroll.esi || 0).toLocaleString()}</td>
                    <td style={{ color: '#EF4444' }}>₹{(payroll.lwf || 0).toLocaleString()}</td>
                    <td style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>₹{payroll.incentives.toLocaleString()}</td>
                    <td style={{ color: 'var(--accent-primary)' }}>₹{payroll.performanceRewards.toLocaleString()}</td>
                    <td style={{ color: '#EF4444' }}>-₹{payroll.pf.toLocaleString()}</td>
                    <td style={{ color: '#EF4444' }}>-₹{payroll.professionalTax.toLocaleString()}</td>
                    <td style={{ color: '#EF4444' }}>-₹{payroll.tds.toLocaleString()}</td>
                    <td style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-primary)' }}>₹{payroll.total.toLocaleString()}</td>
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
