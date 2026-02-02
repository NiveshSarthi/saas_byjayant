import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../../src/components/shared/Button';
import CustomSelect from '../../src/components/shared/CustomSelect';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    userId: '',
    department: '',
    position: '',
    hireDate: '',
    status: 'Active',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadEmployeeData();
    }
  }, [id]);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/hrms/employees/${id}`);
      const employee = response.data;
      setFormData({
        userId: employee.user?._id || '',
        department: employee.department || '',
        position: employee.position || '',
        hireDate: employee.hireDate ? employee.hireDate.split('T')[0] : '',
        status: employee.status || 'Active',
      });
    } catch (error) {
      console.error('Error loading employee:', error);
      alert('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEdit) {
        await axios.put(`/api/hrms/employees/${id}`, formData);
        alert('Employee updated successfully');
      } else {
        await axios.post('/api/hrms/employees', formData);
        alert('Employee created successfully');
      }
      navigate('/hr/employees');
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>
      <div className="mb-4">
        <label className="block text-gray-700">User ID</label>
        <input
          type="text"
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Department</label>
        <input
          type="text"
          name="department"
          value={formData.department}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Position</label>
        <input
          type="text"
          name="position"
          value={formData.position}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Hire Date</label>
        <input
          type="date"
          name="hireDate"
          value={formData.hireDate}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <CustomSelect
        label="Status"
        name="status"
        value={formData.status}
        onChange={handleChange}
        options={[
          { value: 'Active', label: 'Active' },
          { value: 'Inactive', label: 'Inactive' },
          { value: 'PIP', label: 'PIP' },
          { value: 'Resigned', label: 'Resigned' }
        ]}
        placeholder="Select Status"
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : (isEdit ? 'Update Employee' : 'Add Employee')}
      </Button>
    </form>
  );
};

export default EmployeeForm;







