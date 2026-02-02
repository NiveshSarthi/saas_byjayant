import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import Badge from '../../src/components/shared/Badge';
import StatCard from '../../src/components/shared/StatCard';
import CustomSelect from '../../src/components/shared/CustomSelect';
import { Icons } from '../../src/components/shared/Icons';

const AssetChecklist = () => {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [availableInventory, setAvailableInventory] = useState([]);
  const [showAllocateForm, setShowAllocateForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    inventoryId: '',
    allocationDate: new Date().toISOString().split('T')[0],
    condition: 'New',
    notes: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    allocated: 0,
    available: 0
  });

  const assetTypes = [
    'Laptop',
    'Desktop',
    'Mobile Phone',
    'SIM Card',
    'ID Card',
    'Access Card',
    'Keyboard',
    'Mouse',
    'Headphones',
    'Monitor',
    'Charger',
    'Other'
  ];

  const conditions = ['New', 'Good', 'Fair', 'Needs Repair'];

  useEffect(() => {
    fetchAssets();
    fetchEmployees();
    fetchAvailableInventory();
    fetchStats();
  }, []);

  const fetchAvailableInventory = async () => {
    try {
      const response = await axios.get('/api/administration/inventory');
      // Filter for available assets from administration
      const filtered = response.data.filter(item => item.category === 'assets' && (item.lifecycle === 'available' || !item.assignedTo));
      setAvailableInventory(filtered);
    } catch (error) {
      console.error('Error fetching available inventory:', error);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await axios.get('/api/hrms/assets');
      setAssets(response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/hrms/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/hrms/assets/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/hrms/assets', formData);
      fetchAssets();
      fetchStats();
      resetForm();
      alert('Asset allocated successfully!');
    } catch (error) {
      console.error('Error allocating asset:', error);
      alert('Failed to allocate asset');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      assetType: '',
      assetName: '',
      serialNumber: '',
      allocationDate: new Date().toISOString().split('T')[0],
      condition: 'New',
      notes: ''
    });
    setShowAllocateForm(false);
  };

  const returnAsset = async (assetId) => {
    if (window.confirm('Mark this asset as returned?')) {
      try {
        await axios.put(`/api/hrms/assets/${assetId}/return`);
        fetchAssets();
        fetchStats();
      } catch (error) {
        console.error('Error returning asset:', error);
      }
    }
  };

  const deleteAsset = async (assetId) => {
    if (window.confirm('Are you sure you want to delete this asset record?')) {
      try {
        await axios.delete(`/api/hrms/assets/${assetId}`);
        fetchAssets();
        fetchStats();
      } catch (error) {
        console.error('Error deleting asset:', error);
      }
    }
  };

  const groupedAssets = employees.map(emp => ({
    employee: emp,
    assets: assets.filter(asset => asset.employee === emp._id && asset.status === 'allocated')
  })).filter(group => group.assets.length > 0);

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
              Asset Management
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Track and manage company assets allocated to employees
            </p>
          </div>
          <Button onClick={() => setShowAllocateForm(true)} variant="primary">
            Allocate Asset
          </Button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
          <StatCard
            icon="📦"
            label="Total Assets"
            value={stats.total}
            trend="neutral"
          />
          <StatCard
            icon="✅"
            label="Allocated"
            value={stats.allocated}
            trend="neutral"
          />
          <StatCard
            icon="🔓"
            label="Available"
            value={stats.available}
            trend="positive"
          />
        </div>

        {/* Allocate Form */}
        {showAllocateForm && (
          <Card style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-2xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Allocate Asset</h2>
              <Button onClick={resetForm} variant="ghost">
                <Icons.ChevronLeft /> Back
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
                <CustomSelect
                  label="Assign to Employee"
                  value={formData.employeeId}
                  onChange={handleChange}
                  name="employeeId"
                  options={employees.map(emp => ({
                    id: emp._id,
                    name: emp.user?.name || 'Unknown'
                  }))}
                  placeholder="Select Employee"
                />

                <CustomSelect
                  label="Selection Available Asset"
                  value={formData.inventoryId}
                  onChange={handleChange}
                  name="inventoryId"
                  options={availableInventory.map(item => ({
                    id: item._id,
                    name: `${item.name} (${item.category})`
                  }))}
                  placeholder="Select Asset"
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label htmlFor="condition">Initial Condition *</label>
                    <select
                      id="condition"
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      required
                    >
                      {conditions.map(cond => (
                        <option key={cond} value={cond}>{cond}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="allocationDate">Allocation Date *</label>
                  <input
                    id="allocationDate"
                    type="date"
                    name="allocationDate"
                    value={formData.allocationDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Additional notes about this asset..."
                  />
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)' }}>
                <Button type="submit" variant="primary">
                  Allocate Asset
                </Button>
                <Button type="button" onClick={resetForm} variant="secondary">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Assets by Employee */}
        {!showAllocateForm && (
          <div style={{ display: 'grid', gap: 'var(--space-xl)' }}>
            {groupedAssets.map(group => (
              <Card key={group.employee._id} style={{ padding: 'var(--space-2xl)' }}>
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-xs)' }}>
                    {group.employee.user?.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {group.employee.position} • {group.employee.department}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                  {group.assets.map(asset => (
                    <div
                      key={asset._id}
                      style={{
                        padding: 'var(--space-lg)',
                        backgroundColor: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                          <div style={{ fontSize: '0.9375rem', fontWeight: '600' }}>
                            {asset.assetName}
                          </div>
                          <Badge variant="primary">{asset.assetType}</Badge>
                          <Badge variant={asset.condition === 'New' ? 'success' : asset.condition === 'Good' ? 'info' : 'warning'}>
                            {asset.condition}
                          </Badge>
                        </div>
                        {asset.serialNumber && (
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-xs)' }}>
                            Serial: {asset.serialNumber}
                          </div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          Allocated: {new Date(asset.allocationDate).toLocaleDateString()}
                        </div>
                        {asset.notes && (
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 'var(--space-xs)' }}>
                            {asset.notes}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <Button
                          onClick={() => returnAsset(asset._id)}
                          variant="secondary"
                          size="sm"
                        >
                          Return
                        </Button>
                        <Button
                          onClick={() => deleteAsset(asset._id)}
                          variant="ghost"
                          size="sm"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}

            {groupedAssets.length === 0 && (
              <Card style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-tertiary)' }}>
                  No assets allocated yet. Allocate your first asset above.
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Available Assets */}
        {assets.filter(a => a.status === 'available').length > 0 && (
          <Card style={{ marginTop: 'var(--space-2xl)', padding: 'var(--space-2xl)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-lg)' }}>
              Available Assets
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
              {assets.filter(a => a.status === 'available').map(asset => (
                <div
                  key={asset._id}
                  style={{
                    padding: 'var(--space-md)',
                    backgroundColor: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ fontSize: '0.9375rem', fontWeight: '600', marginBottom: 'var(--space-xs)' }}>
                    {asset.assetName}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {asset.assetType}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AssetChecklist;
