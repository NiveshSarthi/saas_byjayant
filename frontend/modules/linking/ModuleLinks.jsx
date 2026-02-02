import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '@shared/Button';
import Card from '@shared/Card';

const ModuleLinks = () => {
  const [links, setLinks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    sourceModule: '',
    targetModule: '',
    description: '',
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await axios.get('/api/linking/module-links');
      setLinks(response.data);
    } catch (error) {
      console.error('Error fetching module links:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/linking/module-links', formData);
      setFormData({ sourceModule: '', targetModule: '', description: '' });
      setShowForm(false);
      fetchLinks();
    } catch (error) {
      console.error('Error submitting module link:', error);
    }
  };

  const deleteLink = async (id) => {
    try {
      await axios.delete(`/api/linking/module-links/${id}`);
      fetchLinks();
    } catch (error) {
      console.error('Error deleting module link:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Module Links</h1>
      <Button onClick={() => setShowForm(!showForm)} className="mb-4">
        {showForm ? 'Cancel' : 'Add Module Link'}
      </Button>
      {showForm && (
        <Card className="mb-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Source Module</label>
              <input
                type="text"
                name="sourceModule"
                value={formData.sourceModule}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Target Module</label>
              <input
                type="text"
                name="targetModule"
                value={formData.targetModule}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <Button type="submit">Submit</Button>
          </form>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link) => (
          <Card key={link._id} className="p-4">
            <h2 className="text-xl font-bold mb-2">{link.sourceModule} → {link.targetModule}</h2>
            <p className="text-gray-600 mb-2">{link.description}</p>
            <Button onClick={() => deleteLink(link._id)} className="bg-red-500 hover:bg-red-700">
              Delete
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ModuleLinks;







