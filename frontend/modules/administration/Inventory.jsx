import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import Badge from '../../src/components/shared/Badge';
import StatCard from '../../src/components/shared/StatCard';
import { Icons } from '../../src/components/shared/Icons';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Stationery',
    quantity: 0,
    unit: 'Pieces',
    threshold: 10, // Low stock threshold
    location: '',
    supplier: '',
    lastRestocked: new Date().toISOString().split('T')[0]
  });
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockCount: 0,
    categoriesCount: 0
  });

  const categories = ['Catering (Milk/Tea)', 'Stationery', 'IT Assets', 'Cleaning Supplies', 'Marketing Materials', 'Furniture', 'Other'];
  const units = ['Pieces', 'Liters', 'Kgs', 'Packets', 'Boxes', 'Units'];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('/api/administration/inventory');
      setInventory(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const calculateStats = (items) => {
    const total = items.reduce((acc, item) => acc + (parseFloat(item.quantity) || 0), 0);
    const lowStock = items.filter(item => item.quantity <= item.threshold).length;
    const categoriesSet = new Set(items.map(item => item.category));
    setStats({
      totalItems: total,
      lowStockCount: lowStock,
      categoriesCount: categoriesSet.size
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/administration/inventory', formData);
      fetchInventory();
      resetForm();
      alert('Inventory item added successfully!');
    } catch (error) {
      console.error('Error adding inventory item:', error);
      alert('Failed to add inventory item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Stationery',
      quantity: 0,
      unit: 'Pieces',
      threshold: 10,
      location: '',
      supplier: '',
      lastRestocked: new Date().toISOString().split('T')[0]
    });
    setShowAddForm(false);
  };

  const updateQuantity = async (id, delta) => {
    try {
      const item = inventory.find(i => i._id === id);
      const newQuantity = (parseFloat(item.quantity) || 0) + delta;
      if (newQuantity < 0) return;

      await axios.put(`/api/administration/inventory/${id}`, { quantity: newQuantity });
      fetchInventory();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/api/administration/inventory/${id}`);
        fetchInventory();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const exportToPDF = async () => {
    try {
      const response = await axios.get('/api/administration/inventory/export', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory_report.pdf');
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
              Inventory & Stock Management
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage office stock, stationery, and catering supplies
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <Button onClick={exportToPDF} variant="secondary">
              Export PDF
            </Button>
            <Button onClick={() => setShowAddForm(true)} variant="primary">
              Add New Item
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
          <StatCard
            icon="📦"
            label="Total Stock Volume"
            value={stats.totalItems.toLocaleString()}
            trend="neutral"
          />
          <StatCard
            icon="⚠️"
            label="Low Stock Alerts"
            value={stats.lowStockCount}
            trend={stats.lowStockCount > 0 ? "negative" : "positive"}
          />
          <StatCard
            icon="📁"
            label="Active Categories"
            value={stats.categoriesCount}
            trend="neutral"
          />
        </div>

        {/* Add Item Form */}
        {showAddForm && (
          <Card style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-2xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Add Inventory Item</h2>
              <Button onClick={resetForm} variant="ghost">
                <Icons.ChevronLeft /> Back
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label htmlFor="name">Item Name *</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g., A4 Paper Rim"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label htmlFor="unit">Unit *</label>
                    <select
                      id="unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      required
                    >
                      {units.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label htmlFor="quantity">Initial Quantity</label>
                    <input
                      id="quantity"
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="threshold">Low Stock Threshold *</label>
                    <input
                      id="threshold"
                      type="number"
                      name="threshold"
                      value={formData.threshold}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="lastRestocked">Last Restocked Date</label>
                    <input
                      id="lastRestocked"
                      type="date"
                      name="lastRestocked"
                      value={formData.lastRestocked}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label htmlFor="location">Storage Location</label>
                    <input
                      id="location"
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., Cabinet A, Floor 2"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="supplier">Primary Supplier</label>
                    <input
                      id="supplier"
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleChange}
                      placeholder="e.g., Office Depot"
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)' }}>
                <Button type="submit" variant="primary">
                  Add to Inventory
                </Button>
                <Button type="button" onClick={resetForm} variant="secondary">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Low Stock Alerts Banner */}
        {stats.lowStockCount > 0 && (
          <Card style={{
            marginBottom: 'var(--space-xl)',
            padding: 'var(--space-lg)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--danger-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)'
          }}>
            <div style={{ color: 'var(--danger-primary)', fontSize: '1.5rem' }}>⚠️</div>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--danger-primary)' }}>Low Stock Warning</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {stats.lowStockCount} items are currently below their safety threshold. Please restock soon.
              </div>
            </div>
          </Card>
        )}

        {/* Inventory List */}
        <Card style={{ padding: 'var(--space-2xl)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{item.supplier}</div>
                    </td>
                    <td><Badge variant="neutral">{item.category}</Badge></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <button
                          onClick={() => updateQuantity(item._id, -1)}
                          className="btn-ghost"
                          style={{ minWidth: 'auto', padding: 'var(--space-xs)' }}
                        >
                          <span style={{ fontSize: '1.25rem' }}>−</span>
                        </button>
                        <span style={{ fontWeight: '700', minWidth: '3rem', textAlign: 'center' }}>
                          {item.quantity} {item.unit}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          className="btn-ghost"
                          style={{ minWidth: 'auto', padding: 'var(--space-xs)' }}
                        >
                          <span style={{ fontSize: '1.25rem', color: 'var(--accent-primary)' }}>+</span>
                        </button>
                      </div>
                    </td>
                    <td>
                      {item.quantity <= item.threshold ? (
                        <Badge variant="danger">Low Stock</Badge>
                      ) : (
                        <Badge variant="success">Available</Badge>
                      )}
                    </td>
                    <td>{item.location || 'N/A'}</td>
                    <td>
                      <button
                        onClick={() => deleteItem(item._id)}
                        className="btn-ghost"
                        style={{ padding: 'var(--space-sm)', minWidth: 'auto' }}
                        title="Delete Item"
                      >
                        <Icons.Settings />
                      </button>
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

export default Inventory;
