import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '@shared/Button';
import Card from '@shared/Card';

const ModuleConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    moduleName: '',
    enabled: true,
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await axios.get('/api/linking/module-configs');
      setConfigs(response.data);
    } catch (error) {
      console.error('Error fetching module configs:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/linking/module-configs', formData);
      setFormData({ moduleName: '', enabled: true });
      setShowForm(false);
      fetchConfigs();
    } catch (error) {
      console.error('Error submitting module config:', error);
    }
  };

  const toggleEnabled = async (id, currentEnabled) => {
    try {
      await axios.put(`/api/linking/module-configs/${id}`, { enabled: !currentEnabled });
      fetchConfigs();
    } catch (error) {
      console.error('Error updating module config:', error);
    }
  };

  const deleteConfig = async (id) => {
    try {
      await axios.delete(`/api/linking/module-configs/${id}`);
      fetchConfigs();
    } catch (error) {
      console.error('Error deleting module config:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Module Configurations</h1>
      <Button onClick={() => setShowForm(!showForm)} className="mb-4">
        {showForm ? 'Cancel' : 'Add Module Config'}
      </Button>
      {showForm && (
        <Card className="mb-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Module Name</label>
              <input
                type="text"
                name="moduleName"
                value={formData.moduleName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">
                <input
                  type="checkbox"
                  name="enabled"
                  checked={formData.enabled}
                  onChange={handleChange}
                  className="mr-2"
                />
                Enabled
              </label>
            </div>
            <Button type="submit">Submit</Button>
          </form>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {configs.map((config) => (
          <Card key={config._id} className="p-4">
            <h2 className="text-xl font-bold mb-2">{config.moduleName}</h2>
            <p className="text-gray-600 mb-2">Status: {config.enabled ? 'Enabled' : 'Disabled'}</p>
            <Button onClick={() => toggleEnabled(config._id, config.enabled)} className="mr-2">
              {config.enabled ? 'Disable' : 'Enable'}
            </Button>
            <Button onClick={() => deleteConfig(config._id)} className="bg-red-500 hover:bg-red-700">
              Delete
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ModuleConfig;







