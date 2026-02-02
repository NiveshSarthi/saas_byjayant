import React, { useState } from 'react';
import axios from 'axios';
import Button from '../../src/components/shared/Button';
import CustomSelect from '../../src/components/shared/CustomSelect';

const EmployeeForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    userId: '',
    department: '',
    position: '',
    hireDate: '',
    status: 'Active',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/hrms/employees', formData);
      onSubmit();
    } catch (error) {
      console.error('Error creating employee:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add Employee</h2>
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
          { id: 'Active', name: 'Active' },
          { id: 'PIP', name: 'PIP' },
          { id: 'Resigned', name: 'Resigned' }
        ]}
      />
      <Button type="submit">Add Employee</Button>
    </form>
  );
};

export default EmployeeForm;







