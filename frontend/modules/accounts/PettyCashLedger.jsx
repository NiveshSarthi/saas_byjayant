import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import Badge from '../../src/components/shared/Badge';
import StatCard from '../../src/components/shared/StatCard';
import { Icons } from '../../src/components/shared/Icons';

const PettyCashLedger = () => {
  const [ledger, setLedger] = useState([]);
  const [balance, setBalance] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Credit',
    amount: 0,
    category: 'Top-up',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Top-up', 'Office Supplies', 'Catering/Tea', 'Conveyance', 'Repairs', 'Cleaning', 'Miscellaneous'];

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const response = await axios.get('/api/accounts/petty-cash');
      setLedger(response.data);
      calculateBalance(response.data);
    } catch (error) {
      console.error('Error fetching petty cash ledger:', error);
    }
  };

  const calculateBalance = (data) => {
    const total = data.reduce((acc, entry) => {
      return entry.type === 'Credit' ? acc + entry.amount : acc - entry.amount;
    }, 0);
    setBalance(total);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/accounts/petty-cash', formData);
      fetchLedger();
      resetForm();
      alert('Transaction recorded successfully!');
    } catch (error) {
      console.error('Error recording transaction:', error);
      alert('Failed to record transaction');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'Credit',
      amount: 0,
      category: 'Top-up',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddForm(false);
  };

  const exportPDF = async () => {
    try {
      const response = await axios.get('/api/accounts/petty-cash/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'petty_cash_ledger.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
              Petty Cash Ledger
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Real-time tracking of cash transactions and office expenditures
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <Button onClick={exportPDF} variant="secondary">Export PDF</Button>
            <Button onClick={() => setShowAddForm(true)} variant="primary">Add Transaction</Button>
          </div>
        </div>

        {/* Balance Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
          <StatCard
            icon="💰"
            label="Current Cash Balance"
            value={`₹${balance.toLocaleString()}`}
            trend={balance < 1000 ? "negative" : "positive"}
          />
          <StatCard
            icon="📈"
            label="Total Credits (This Month)"
            value={`₹${ledger.filter(e => e.type === 'Credit').reduce((a, b) => a + b.amount, 0).toLocaleString()}`}
            trend="neutral"
          />
          <StatCard
            icon="📉"
            label="Total Debits (This Month)"
            value={`₹${ledger.filter(e => e.type === 'Debit').reduce((a, b) => a + b.amount, 0).toLocaleString()}`}
            trend="neutral"
          />
        </div>

        {/* Add Transaction Form */}
        {showAddForm && (
          <Card style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-2xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Record New Transaction</h2>
              <Button onClick={resetForm} variant="ghost">
                <Icons.ChevronLeft /> Back
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label htmlFor="type">Transaction Type *</label>
                    <select id="type" name="type" value={formData.type} onChange={handleChange} required>
                      <option value="Credit">Credit (Cash In)</option>
                      <option value="Debit">Debit (Cash Out)</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label htmlFor="amount">Amount (₹) *</label>
                    <input id="amount" type="number" name="amount" value={formData.amount} onChange={handleChange} required min="0" />
                  </div>
                  <div className="input-group">
                    <label htmlFor="category">Category *</label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label htmlFor="date">Date *</label>
                    <input id="date" type="date" name="date" value={formData.date} onChange={handleChange} required />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="description">Description / Remarks *</label>
                  <input id="description" type="text" name="description" value={formData.description} onChange={handleChange} required placeholder="Detailed reason for transaction" />
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)' }}>
                <Button type="submit" variant="primary">Record Entry</Button>
                <Button type="button" onClick={resetForm} variant="secondary">Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Ledger Table */}
        <Card style={{ padding: 'var(--space-2xl)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description & Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map(entry => (
                  <tr key={entry._id}>
                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{entry.description}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{entry.category}</div>
                    </td>
                    <td>
                      <span style={{
                        color: entry.type === 'Credit' ? 'var(--success-primary)' : 'var(--danger-primary)',
                        fontWeight: '700'
                      }}>
                        {entry.type}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '700' }}>
                        {entry.type === 'Debit' ? '-' : '+'}₹{parseFloat(entry.amount).toLocaleString()}
                      </span>
                    </td>
                    <td><Badge variant="success">Completed</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {ledger.length === 0 && (
            <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No transactions recorded yet.
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default PettyCashLedger;
