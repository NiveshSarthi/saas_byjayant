import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '@shared/Button';
import Card from '@shared/Card';

const IncentiveRelations = () => {
  const [relations, setRelations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    salaryComponent: '',
    incentiveType: '',
    relation: '',
    value: 0,
  });

  useEffect(() => {
    fetchRelations();
  }, []);

  const fetchRelations = async () => {
    try {
      const response = await axios.get('/api/linking/incentive-relations');
      setRelations(response.data);
    } catch (error) {
      console.error('Error fetching incentive relations:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/linking/incentive-relations', formData);
      setFormData({ salaryComponent: '', incentiveType: '', relation: '', value: 0 });
      setShowForm(false);
      fetchRelations();
    } catch (error) {
      console.error('Error submitting incentive relation:', error);
    }
  };

  const deleteRelation = async (id) => {
    try {
      await axios.delete(`/api/linking/incentive-relations/${id}`);
      fetchRelations();
    } catch (error) {
      console.error('Error deleting incentive relation:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Incentive Relations</h1>
      <Button onClick={() => setShowForm(!showForm)} className="mb-4">
        {showForm ? 'Cancel' : 'Add Incentive Relation'}
      </Button>
      {showForm && (
        <Card className="mb-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Salary Component</label>
              <input
                type="text"
                name="salaryComponent"
                value={formData.salaryComponent}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Incentive Type</label>
              <input
                type="text"
                name="incentiveType"
                value={formData.incentiveType}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Relation</label>
              <input
                type="text"
                name="relation"
                value={formData.relation}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Value</label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                step="0.01"
              />
            </div>
            <Button type="submit">Submit</Button>
          </form>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relations.map((rel) => (
          <Card key={rel._id} className="p-4">
            <h2 className="text-xl font-bold mb-2">{rel.salaryComponent} - {rel.incentiveType}</h2>
            <p className="text-gray-600 mb-2">Relation: {rel.relation}</p>
            <p className="text-gray-600 mb-2">Value: {rel.value}</p>
            <Button onClick={() => deleteRelation(rel._id)} className="bg-red-500 hover:bg-red-700">
              Delete
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IncentiveRelations;







