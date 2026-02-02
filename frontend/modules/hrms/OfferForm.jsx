import React, { useState } from 'react';
import axios from 'axios';
import Button from '../../src/components/shared/Button';
import CustomSelect from '../../src/components/shared/CustomSelect';

const OfferForm = ({ candidate, onSubmit, candidates }) => { // Added 'candidates' prop
  const [formData, setFormData] = useState({
    candidateId: candidate ? candidate._id : '', // Initialize with candidate._id if available
    type: 'LOI', // LOI, AL, OL
    position: '',
    salary: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // For now, just log or call generate offer
      const response = await axios.post('/api/hrms/recruitment/generate-offer', formData);
      alert('Offer generated: ' + response.data.message);
      onSubmit();
    } catch (error) {
      console.error('Error generating offer:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Generate Offer for {candidate ? candidate.name : 'Selected Candidate'}</h2>
      <div className="mb-4">
        <CustomSelect
          label="Select Candidate"
          value={formData.candidateId}
          onChange={handleChange}
          name="candidateId"
          options={candidates.map(c => ({ id: c._id, name: `${c.name} (${c.position})` }))}
          placeholder="Select candidate"
          required
        />
      </div>
      <div className="mb-4">
        <CustomSelect
          label="Offer Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={[
            { id: 'LOI', name: 'Letter of Intent' },
            { id: 'AL', name: 'Appointment Letter' },
            { id: 'OL', name: 'Offer Letter' },
          ]}
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
        <label className="block text-gray-700">Salary</label>
        <input
          type="text"
          name="salary"
          value={formData.salary}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <Button type="submit">Generate Offer</Button>
    </form>
  );
};

export default OfferForm;







