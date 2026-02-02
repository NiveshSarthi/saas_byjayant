import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import Badge from '../../src/components/shared/Badge';
import StatCard from '../../src/components/shared/StatCard';
import { Icons } from '../../src/components/shared/Icons';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electricity Bill',
    amount: 0,
    department: 'Administration',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    recurrencePeriod: 'Monthly'
  });
  const [stats, setStats] = useState({
    monthlyTotal: 0,
    pendingApproval: 0,
    departmentMax: 'Administration'
  });

  const categories = ['Electricity Bill', 'Water Bill', 'Internet/Subscriptions', 'Office Maintenance', 'Stationery Purchase', 'Pantry/Catering', 'Software/Tools', 'Marketing Expense', 'Other'];
  const departments = ['Administration', 'HR', 'Sales', 'Marketing', 'Accounts', 'IT', 'Operations'];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get('/api/administration/expenses');
      setExpenses(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const calculateStats = (data) => {
    const currentMonth = new Date().getMonth();
    const monthlyTotal = data.reduce((acc, exp) => {
      const expDate = new Date(exp.date);
      if (expDate.getMonth() === currentMonth) {
        return acc + (parseFloat(exp.amount) || 0);
      }
      return acc;
    }, 0);

    const pendingCount = data.filter(exp => exp.status === 'Pending').length;

    setStats({
      monthlyTotal,
      pendingApproval: pendingCount,
      departmentMax: 'Administration' // Placeholder logic
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/administration/expenses', formData);
      fetchExpenses();
      resetForm();
      alert('Expense submitted for approval!');
    } catch (error) {
      console.error('Error submitting expense:', error);
      alert('Failed to submit expense');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'Electricity Bill',
      amount: 0,
      department: 'Administration',
      description: '',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      recurrencePeriod: 'Monthly'
    });
    setShowAddForm(false);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      default: return 'warning';
    }
  };

  const deleteExpense = async (id) => {
    if (window.confirm('Delete this expense record?')) {
      try {
        await axios.delete(`/api/administration/expenses/${id}`);
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
              Expense Management
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Track bills, subscriptions, and office tools across departments
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)} variant="primary">
            Record Expense
          </Button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
          <StatCard
            icon="💵"
            label="Current Month Total"
            value={`₹${stats.monthlyTotal.toLocaleString()}`}
            trend="neutral"
          />
          <StatCard
            icon="⏳"
            label="Pending Approvals"
            value={stats.pendingApproval}
            trend={stats.pendingApproval > 5 ? "negative" : "neutral"}
          />
          <StatCard
            icon="🏢"
            label="Top Department"
            value={stats.departmentMax}
            trend="neutral"
          />
        </div>

        {/* Add Expense Form */}
        {showAddForm && (
          <Card style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-2xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Record New Expense</h2>
              <Button onClick={resetForm} variant="ghost">
                <Icons.ChevronLeft /> Back
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label htmlFor="title">Expense Title *</label>
                    <input
                      id="title"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="e.g., February AWS Bill"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="category">Category *</label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label htmlFor="amount">Amount (₹) *</label>
                    <input
                      id="amount"
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label htmlFor="department">Department *</label>
                    <select id="department" name="department" value={formData.department} onChange={handleChange} required>
                      {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label htmlFor="date">Expense Date *</label>
                    <input id="date" type="date" name="date" value={formData.date} onChange={handleChange} required />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="description">Notes / Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Provide details about the expenditure..."
                  />
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}>
                    <input type="checkbox" name="isRecurring" checked={formData.isRecurring} onChange={handleChange} />
                    <span>Is this a recurring expense?</span>
                  </label>
                  {formData.isRecurring && (
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <select name="recurrencePeriod" value={formData.recurrencePeriod} onChange={handleChange} style={{ padding: 'var(--space-xs) var(--space-md)' }}>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Annually">Annually</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)' }}>
                <Button type="submit" variant="primary">
                  Submit for Approval
                </Button>
                <Button type="button" onClick={resetForm} variant="secondary">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Expense List */}
        <Card style={{ padding: 'var(--space-2xl)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title & Department</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp._id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{exp.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{exp.department}</div>
                    </td>
                    <td><Badge variant="neutral">{exp.category}</Badge></td>
                    <td><span style={{ fontWeight: '700' }}>₹{parseFloat(exp.amount).toLocaleString()}</span></td>
                    <td>{new Date(exp.date).toLocaleDateString()}</td>
                    <td>
                      <Badge variant={getStatusVariant(exp.status)}>
                        {exp.status || 'Pending'}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <button onClick={() => deleteExpense(exp._id)} className="btn-ghost" style={{ padding: 'var(--space-sm)', minWidth: 'auto' }}>
                          <Icons.Settings />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {expenses.length === 0 && (
            <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No expense records found. Record your first expenditure above.
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Expenses;
